import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSystemPrompt } from "../prompts/templates.ts";
import { openAiTools, getAllowedToolsForContext, executeTool } from "../tools/registry.ts";

/**
 * AIOrchestrator centralizado para la ejecución segura, controlada y eficiente de "Inno"
 */
export async function orchestrateInnoChat(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string,
  body: any
) {
  const { messages, moduleContext, isRecommendation, platform = "crm_erp", currentRoute = "" } = body;
  const openAiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openAiKey) {
    throw new Error("OPENAI_API_KEY no configurado en el servidor.");
  }

  // 1. MODO RECOMENDACIÓN (Para AIRecommendationWizard)
  if (isRecommendation) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout protection

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          temperature: 0.7,
          response_format: { type: "json_object" }, // Estructuración JSON estricta
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error en recomendación: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Registrar consumo de tokens de recomendación
      let tokensInfo = null;
      if (data.usage?.total_tokens) {
        try {
          const { data: dbTokens } = await supabase.rpc("consume_ai_tokens", {
            p_workspace_id: workspaceId,
            p_tokens: data.usage.total_tokens,
          });
          tokensInfo = dbTokens;
        } catch { /* ignore */ }
      }

      return {
        content,
        tokens: tokensInfo,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // 2. MODO CHAT CONTEXTUAL CON HERRAMIENTAS (Para Inno Chat)
  const MAX_DEPTH = 3;
  const MAX_TOOL_CALLS = 5;
  let depth = 0;
  let toolCallsCount = 0;

  const truncatedHistory = Array.isArray(messages) ? messages.slice(-10) : [];

  const apiMessages = [
    { role: "system", content: getSystemPrompt(platform as "track" | "crm_erp", moduleContext) },
    ...truncatedHistory,
  ];

  // Limitar herramientas según allowlist del módulo
  const allowedTools = getAllowedToolsForContext(platform as "track" | "crm_erp", moduleContext);
  const toolsSchema = openAiTools.filter((t) => allowedTools.includes(t.function.name));

  let finalResponseText = "";
  let accumulatedTokens = 0;

  while (depth < MAX_DEPTH) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const payload: any = {
      model: "gpt-4o-mini",
      messages: apiMessages,
      temperature: 0.7,
    };

    // Solo habilitar herramientas en la primera iteración de llamada
    if (toolsSchema.length > 0 && depth === 0) {
      payload.tools = toolsSchema;
      payload.tool_choice = "auto";
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error("OpenAI no devolvió ninguna opción de respuesta.");
      }
      const choice = data.choices[0];
      const message = choice.message;
      if (!message) {
        throw new Error("El mensaje de respuesta de OpenAI está vacío.");
      }

      if (data.usage?.total_tokens) {
        accumulatedTokens += data.usage.total_tokens;
      }

      // Validar si OpenAI requiere llamadas a herramientas
      if (message.tool_calls && message.tool_calls.length > 0) {
        if (toolCallsCount >= MAX_TOOL_CALLS) {
          console.warn("[Orchestrator] Límite de tool calls alcanzado. Cortando recursión.");
          const limitMsg = "Disculpa, he realizado el número máximo de acciones consecutivas para esta consulta. Por favor, sé más específico o solicita acciones individuales.";
          apiMessages.push({ role: "assistant", content: limitMsg });
          finalResponseText = limitMsg;
          break;
        }

        apiMessages.push(message);

        const toolOutputs = [];
        for (const tc of message.tool_calls) {
          if (toolCallsCount >= MAX_TOOL_CALLS) break;
          toolCallsCount++;

          const fnName = tc.function.name;
          // Validar que la herramienta solicitada esté en la allowlist del módulo actual
          if (!allowedTools.includes(fnName)) {
            toolOutputs.push({
              tool_call_id: tc.id,
              role: "tool",
              name: fnName,
              content: `Error: La herramienta "${fnName}" no está permitida en el módulo actual.`,
            });
            continue;
          }

          let args = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch {
            toolOutputs.push({
              tool_call_id: tc.id,
              role: "tool",
              name: fnName,
              content: "Error: Los argumentos provistos no son un JSON válido.",
            });
            continue;
          }

          let resultStr = "";
          let success = true;
          let errMsg = "";

          try {
            console.log(`[Orchestrator] Ejecutando tool ${fnName} para plataforma ${platform}...`);
            resultStr = await executeTool(supabase, workspaceId, fnName, args, platform as "track" | "crm_erp");

            // Validar contaminación cruzada de datos
            try {
              const parsed = JSON.parse(resultStr);
              if (parsed && typeof parsed === "object") {
                let retrievedData: any[] = [];
                if (Array.isArray(parsed)) {
                  retrievedData = parsed;
                } else {
                  for (const key in parsed) {
                    if (Array.isArray(parsed[key])) {
                      retrievedData.push(...parsed[key]);
                    } else if (parsed[key] && typeof parsed[key] === "object") {
                      retrievedData.push(parsed[key]);
                    }
                  }
                }

                // Filtrar registros inválidos de otra plataforma
                const invalidData = retrievedData.filter(item => item && item.platform !== platform);

                if (invalidData.length > 0) {
                  throw new Error('Cross-platform data contamination detected');
                }
              }
            } catch (err: any) {
              if (err.message && err.message.includes("Cross-platform data contamination detected")) {
                throw err;
              }
              // Ignorar errores de parseo de JSON si la respuesta es texto plano o no estructurado
            }
          } catch (err: any) {
            console.error(`[Orchestrator] Error ejecutando tool ${fnName}:`, err);
            resultStr = `Error en herramienta: ${err.message || "Error desconocido"}`;
            success = false;
            errMsg = err.message || "Error desconocido";
          }

          // Registro de auditoría asíncrono y tolerante a fallos
          try {
            await supabase.from("trak_ai_audit_logs").insert({
              workspace_id: workspaceId,
              user_id: userId,
              tool_name: fnName,
              arguments: args,
              response: { result: resultStr },
              success,
              error_message: errMsg || null,
              tokens_used: data.usage?.total_tokens || 0,
            });
          } catch (auditErr) {
            console.warn("[Orchestrator] Error silencioso al registrar auditoría:", auditErr);
          }

          toolOutputs.push({
            tool_call_id: tc.id,
            role: "tool",
            name: fnName,
            content: resultStr,
          });
        }

        apiMessages.push(...toolOutputs);
        depth++;
      } else {
        finalResponseText = message.content || "";
        break;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Actualizar presupuesto de tokens de forma server-side
  let tokensInfo = null;
  if (accumulatedTokens > 0) {
    try {
      const { data: dbTokens } = await supabase.rpc("consume_ai_tokens", {
        p_workspace_id: workspaceId,
        p_tokens: accumulatedTokens,
      });
      tokensInfo = dbTokens;
    } catch (err) {
      console.warn("[Orchestrator] Falló RPC de tokens:", err);
    }
  }

  return {
    content: finalResponseText || "He realizado la acción requerida.",
    tokens: tokensInfo,
  };
}
