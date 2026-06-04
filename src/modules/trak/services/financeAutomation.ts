import { supabase } from '@/lib/supabase';

interface QuoteAutomationInput {
  quoteId?: string | null;
  workspaceId: string | null;
  clientId?: string | null;
  projectId?: string | null;
  title: string;
  quoteNumber: string;
  total: number;
  paymentTerms?: string | null;
  userId?: string | null;
}

interface PaymentMilestoneDraft {
  name: string;
  percentage?: number;
  amount: number;
  due_date?: string | null;
}

const money = (amount: number) => `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export function buildPaymentPlanFromTerms(paymentTerms: string | null | undefined, total: number): PaymentMilestoneDraft[] {
  const normalized = (paymentTerms || '').toLowerCase();
  const percentages = Array.from(normalized.matchAll(/(\d+(?:\.\d+)?)\s*%/g))
    .map(match => Number(match[1]))
    .filter(value => value > 0);

  if (percentages.length >= 2 && percentages.reduce((sum, value) => sum + value, 0) <= 110) {
    return percentages.map((percentage, index) => ({
      name: index === 0 ? `Anticipo ${percentage}%` : `Pago ${index + 1} (${percentage}%)`,
      percentage,
      amount: Math.round(total * (percentage / 100) * 100) / 100,
      due_date: index === 0 ? addDays(0) : addDays(index * 30)
    }));
  }

  if (percentages.length === 1 && percentages[0] < 100) {
    const first = percentages[0];
    const second = 100 - first;
    return [
      {
        name: `Anticipo ${first}%`,
        percentage: first,
        amount: Math.round(total * (first / 100) * 100) / 100,
        due_date: addDays(0)
      },
      {
        name: `Liquidacion ${second}%`,
        percentage: second,
        amount: Math.round(total * (second / 100) * 100) / 100,
        due_date: addDays(30)
      }
    ];
  }

  return [
    {
      name: 'Anticipo 50%',
      percentage: 50,
      amount: Math.round(total * 0.5 * 100) / 100,
      due_date: addDays(0)
    },
    {
      name: 'Liquidacion 50%',
      percentage: 50,
      amount: Math.round(total * 0.5 * 100) / 100,
      due_date: addDays(30)
    }
  ];
}

export async function ensureAcceptedQuoteFinance(input: QuoteAutomationInput) {
  if (!input.workspaceId || !input.clientId || input.total <= 0) return input.projectId || null;

  let projectId = input.projectId || null;

  if (!projectId) {
    const { data: newProject, error } = await supabase
      .from('trak_projects')
      .insert({
        workspace_id: input.workspaceId,
        name: input.title,
        client_id: input.clientId,
        description: `Proyecto generado automaticamente desde cotizacion ${input.quoteNumber}`,
        status: 'planning',
        budget: input.total,
        color: '#10b981',
        created_by: input.userId || null
      })
      .select('id')
      .single();

    if (error) throw error;
    projectId = newProject?.id || null;
  } else {
    await supabase
      .from('trak_projects')
      .update({
        budget: input.total,
        client_id: input.clientId,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
  }

  if (!projectId) return null;

  if (input.quoteId) {
    await supabase
      .from('trak_quotes')
      .update({ project_id: projectId, total: input.total })
      .eq('id', input.quoteId);
  }

  const { data: existingMilestones } = await supabase
    .from('trak_project_milestones')
    .select('id')
    .eq('project_id', projectId)
    .limit(1);

  const shouldCreatePlan = !existingMilestones || existingMilestones.length === 0;

  if (shouldCreatePlan) {
    const plan = buildPaymentPlanFromTerms(input.paymentTerms, input.total);
    await supabase.from('trak_project_milestones').insert(
      plan.map(milestone => ({
        project_id: projectId,
        name: milestone.name,
        amount: milestone.amount,
        percentage: milestone.percentage || null,
        due_date: milestone.due_date || null,
        status: 'pending',
        notes: `Generado automaticamente desde cotizacion ${input.quoteNumber}`
      }))
    );

    await supabase.from('trak_project_activity').insert({
      project_id: projectId,
      user_id: input.userId || null,
      type: 'milestone',
      content: `Finanzas inicializadas desde cotizacion ${input.quoteNumber}: presupuesto ${money(input.total)} y plan de cobranza generado.`
    });

    await supabase.from('trak_notifications').insert({
      workspace_id: input.workspaceId,
      type: 'finance',
      title: 'Cotizacion aceptada',
      message: `Se preparo el control financiero de "${input.title}" por ${money(input.total)}.`,
      link_url: `/trak/projects/${projectId}`
    });
  }

  return projectId;
}

export async function completeProjectFinancialCloseout(projectId: string, workspaceId: string | null, userId?: string | null) {
  const [{ data: milestones }, { data: project }] = await Promise.all([
    supabase.from('trak_project_milestones').select('id, status, amount, name').eq('project_id', projectId),
    supabase.from('trak_projects').select('name, client_id, budget').eq('id', projectId).single()
  ]);

  const pendingAmount = (milestones || [])
    .filter(milestone => milestone.status !== 'paid')
    .reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);

  await supabase
    .from('trak_projects')
    .update({
      status: 'completed',
      progress: 100,
      actual_end_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId);

  // If there's pending amount and a linked client, auto-generate a final Charge Note
  if (workspaceId && pendingAmount > 0 && project?.client_id) {
    // Lookup prospect linked to this trak client
    const { data: trakClient } = await supabase
      .from('trak_clients')
      .select('prospect_id, company_name')
      .eq('id', project.client_id)
      .single();

    let prospectId = trakClient?.prospect_id || null;

    if (!prospectId && trakClient) {
      const { data: newProspect, error: prospectError } = await supabase
        .from('prospects')
        .insert({
          workspace: workspaceId,
          nombre: trakClient.company_name || 'Cliente Trak',
          empresa: trakClient.company_name || 'Cliente Trak',
          estado: 'Cliente Activo',
          correo: 'sin-correo@trak.local',
          telefono: '0000000000',
          servicio_interes: project.name || 'Proyecto Trak',
          plataforma: 'WhatsApp',
          responsable: userId || null
        })
        .select('id')
        .single();

      if (!prospectError && newProspect) {
        prospectId = newProspect.id;
        await supabase.from('trak_clients').update({ prospect_id: prospectId }).eq('id', project.client_id);
      } else {
        console.error('Error auto-creating prospect:', prospectError);
      }
    }

    if (prospectId) {
      try {
        const noteNumber = `NC-PROY-${project?.name?.slice(0, 10).replace(/\s/g, '')}-LIQ`;
        const today = new Date().toISOString().split('T')[0];
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + 30);
        const dueDate = dueDateObj.toISOString().split('T')[0];

        const pendingMilestones = (milestones || []).filter(m => m.status !== 'paid');
        const items = pendingMilestones.map(m => ({
          item_name: m.name || 'Hito de proyecto',
          description: `Liquidación - ${project?.name || 'Proyecto'}`,
          quantity: 1,
          unit_price: Number(m.amount || 0),
          total: Number(m.amount || 0)
        }));

        await supabase.rpc('create_manual_charge_note', {
          p_workspace_id: workspaceId,
          p_prospect_id: prospectId,
          p_note_number: noteNumber,
          p_issue_date: today,
          p_due_date: dueDate,
          p_subtotal: pendingAmount,
          p_total_amount: pendingAmount
        }).then(async ({ data: noteId }) => {
          if (noteId && items.length > 0) {
            await supabase.from('charge_note_items').insert(
              items.map(item => ({ ...item, charge_note_id: noteId }))
            );
          }
        });
      } catch (err) {
        console.error('Error creating closeout charge note:', err);
      }
    }
  }

  await supabase.from('trak_project_activity').insert({
    project_id: projectId,
    user_id: userId || null,
    type: pendingAmount > 0 ? 'milestone' : 'status_change',
    is_resolved: pendingAmount <= 0,
    content: pendingAmount > 0
      ? `Proyecto completado. Se generó Cuenta por Cobrar de liquidación por ${money(pendingAmount)}.`
      : 'Proyecto completado y sin cobranza pendiente registrada.'
  });

  if (workspaceId && pendingAmount > 0) {
    await supabase.from('trak_notifications').insert({
      workspace_id: workspaceId,
      type: 'finance',
      title: 'Liquidación de proyecto generada',
      message: `Se creó una Cuenta por Cobrar de ${money(pendingAmount)} por la liquidación de "${project?.name}".`,
      link_url: `/crm/finance/receivables`
    });
  }
}

/**
 * Generates a Charge Note (Account Receivable) from a project milestone.
 * Called when user clicks "Facturar" on a milestone in ProjectFinances.
 */
export async function generateChargeNoteFromMilestone(
  milestone: { id: string; name: string; amount: number; due_date?: string | null; percentage?: number },
  project: { id: string; name: string; client_id?: string },
  workspaceId: string | null,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!workspaceId || !project.client_id) {
    return { success: false, error: 'Proyecto sin cliente o workspace asignado.' };
  }

  // Find the prospect linked to the trak client
  const { data: trakClient } = await supabase
    .from('trak_clients')
    .select('prospect_id, company_name')
    .eq('id', project.client_id)
    .single();

  let prospectId = trakClient?.prospect_id || null;

  if (!prospectId && trakClient) {
    const { data: newProspect, error: prospectError } = await supabase
      .from('prospects')
      .insert({
        workspace: workspaceId,
        nombre: trakClient.company_name || 'Cliente Trak',
        empresa: trakClient.company_name || 'Cliente Trak',
        estado: 'Cliente Activo',
        correo: 'sin-correo@trak.local',
        telefono: '0000000000',
        servicio_interes: project.name || 'Proyecto Trak',
        plataforma: 'WhatsApp',
        responsable: userId || null
      })
      .select('id')
      .single();

    if (!prospectError && newProspect) {
      prospectId = newProspect.id;
      await supabase.from('trak_clients').update({ prospect_id: prospectId }).eq('id', project.client_id);
    } else {
      console.error('Error auto-creating prospect:', prospectError);
      return { success: false, error: `Error DB al crear cliente: ${prospectError?.message || prospectError?.details || 'Desconocido'}` };
    }
  }

  if (!prospectId) {
    return { success: false, error: 'El cliente del proyecto no está vinculado a un prospecto del CRM y no se pudo autogenerar.' };
  }

  try {
    const noteNumber = `NC-${project.name.slice(0, 8).replace(/\s/g, '').toUpperCase()}-${milestone.name.slice(0, 6).replace(/\s/g, '').toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = milestone.due_date || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      return d.toISOString().split('T')[0];
    })();

    const { data: noteId, error: noteError } = await supabase.rpc('create_manual_charge_note', {
      p_workspace_id: workspaceId,
      p_prospect_id: prospectId,
      p_note_number: noteNumber,
      p_issue_date: today,
      p_due_date: dueDate,
      p_subtotal: milestone.amount,
      p_total_amount: milestone.amount
    });

    if (noteError) throw noteError;

    if (noteId) {
      await supabase.from('charge_note_items').insert({
        charge_note_id: noteId,
        item_name: milestone.name,
        description: `Proyecto: ${project.name}${milestone.percentage ? ` (${milestone.percentage}%)` : ''}`,
        quantity: 1,
        unit_price: milestone.amount,
        total: milestone.amount
      });
    }

    // Update milestone status to 'invoiced'
    await supabase.from('trak_project_milestones').update({
      status: 'invoiced',
      charge_note_id: noteId || null
    }).eq('id', milestone.id);

    // Activity log
    await supabase.from('trak_project_activity').insert({
      project_id: project.id,
      user_id: userId || null,
      type: 'milestone',
      content: `Hito "${milestone.name}" facturado por ${money(milestone.amount)}. Cuenta por Cobrar generada.`
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error generating charge note from milestone:', err);
    return { success: false, error: err.message || 'Error al generar la Cuenta por Cobrar.' };
  }
}

/**
 * Creates an Accounts Payable record from a project expense.
 * Called when user checks "Enviar a CxP" when creating a project expense.
 */
export async function createPayableFromProjectExpense(
  expense: { id: string; description: string; amount: number; date: string; category: string },
  project: { id: string; name: string },
  workspaceId: string | null,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!workspaceId) {
    return { success: false, error: 'Workspace no disponible.' };
  }

  try {
    const concept = `[Proyecto: ${project.name}] ${expense.description}`;
    const dueDateObj = new Date(expense.date);
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const { error } = await supabase.from('accounts_payable').insert({
      workspace_id: workspaceId,
      workspace: workspaceId,
      concept,
      amount: expense.amount,
      monto: expense.amount,
      balance_due: expense.amount,
      due_date: dueDate,
      status: 'pending',
      estado: 'pending',
      supplier_type: 'company_expense',
      reference_id: expense.id,
      notes: `Gasto operativo del proyecto "${project.name}" - Categoría: ${expense.category}`,
      created_by: userId || null
    });

    if (error) throw error;

    // Activity log
    await supabase.from('trak_project_activity').insert({
      project_id: project.id,
      user_id: userId || null,
      type: 'milestone',
      content: `Gasto "${expense.description}" por ${money(expense.amount)} enviado a Cuentas por Pagar.`
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error creating payable from project expense:', err);
    return { success: false, error: err.message || 'Error al crear la Cuenta por Pagar.' };
  }
}

