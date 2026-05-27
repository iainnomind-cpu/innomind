import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crearProyecto, leerProyectos, crearTarea, obtenerTareasPendientes, obtenerEventosCalendario } from "./projects.ts";
import { crearCotizacion, leerCotizaciones, crearCliente, leerClientes } from "./crm.ts";
import { leerInventario, crearProducto } from "./inventory.ts";
import { leerEmpleados, crearEmpleado } from "./hr.ts";
import { leerFinanzas, crearGasto, crearCuentaPagar, crearCuentaCobrar } from "./finance.ts";

/**
 * Esquemas de herramientas compatibles con la API de OpenAI
 */
export const openAiTools = [
  // ===== CREAR =====
  {
    type: "function",
    function: {
      name: "crear_proyecto",
      description: "Crea un nuevo proyecto en el sistema Track (solo disponible en plataforma Track).",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre del proyecto" },
          descripcion: { type: "string", description: "Descripción del proyecto" },
          presupuesto: { type: "number", description: "Presupuesto monetario" },
          prioridad: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Prioridad" },
          client_id: { type: "string", description: "ID del cliente (UUID) para vincular el proyecto (opcional)" },
        },
        required: ["nombre"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_cotizacion",
      description: "Crea una nueva cotización comercial en estado borrador.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título de la cotización" },
          notes: { type: "string", description: "Notas comerciales o de pago (opcional)" },
          descuento: { type: "number", description: "Monto de descuento (0 si no hay)" },
          client_id: { type: "string", description: "ID del cliente o prospecto (UUID) (opcional)" },
          items: {
            type: "array",
            description: "Lista de productos/servicios",
            items: {
              type: "object",
              properties: {
                nombre: { type: "string" },
                descripcion: { type: "string" },
                cantidad: { type: "number" },
                precio: { type: "number", description: "Precio unitario sin IVA" },
              },
              required: ["nombre", "cantidad", "precio"],
            },
          },
        },
        required: ["titulo", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_cliente",
      description: "Crea un nuevo cliente o prospecto comercial.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre completo del contacto o cliente" },
          email: { type: "string", description: "Correo electrónico" },
          telefono: { type: "string", description: "Teléfono (opcional)" },
          empresa: { type: "string", description: "Nombre de la empresa (opcional)" },
          cargo: { type: "string", description: "Cargo del contacto (opcional)" },
          notas: { type: "string", description: "Notas o comentarios adicionales" },
        },
        required: ["nombre"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_tarea",
      description: "Crea una nueva tarea en el sistema (proyecto de Track o tarea colaborativa en CRM-ERP).",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título de la tarea" },
          descripcion: { type: "string", description: "Descripción" },
          prioridad: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Prioridad" },
          proyecto_id: { type: "string", description: "ID del proyecto (UUID, opcional, solo en Track)" },
          fecha_limite: { type: "string", description: "Fecha límite YYYY-MM-DD (opcional)" },
        },
        required: ["titulo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_producto",
      description: "Registra un nuevo producto en el catálogo maestro.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre del producto" },
          sku: { type: "string", description: "Código SKU (opcional)" },
          categoria: { type: "string", description: "Categoría del producto (opcional)" },
          cantidad: { type: "number", description: "Cantidad inicial en stock (opcional)" },
          unidad: { type: "string", description: "Unidad de medida (pieza, kg, etc.) (opcional)" },
          precio_unitario: { type: "number", description: "Precio o costo unitario (opcional)" },
          stock_minimo: { type: "number", description: "Stock mínimo de alerta (opcional)" },
          descripcion: { type: "string", description: "Descripción del producto (opcional)" },
        },
        required: ["nombre"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_empleado",
      description: "Registra un nuevo empleado en Recursos Humanos (solo en Track).",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre(s)" },
          apellido: { type: "string", description: "Apellido(s)" },
          email: { type: "string", description: "Correo electrónico" },
          telefono: { type: "string", description: "Teléfono" },
          puesto: { type: "string", description: "Puesto/cargo" },
          departamento: { type: "string", description: "Departamento" },
          fecha_ingreso: { type: "string", description: "Fecha de ingreso YYYY-MM-DD" },
        },
        required: ["nombre", "email"],
      },
    },
  },
  // ===== LEER =====
  {
    type: "function",
    function: {
      name: "leer_proyectos",
      description: "Obtiene la lista de proyectos activos con su estado, presupuesto y progreso (solo en Track).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "leer_cotizaciones",
      description: "Obtiene la lista de cotizaciones registradas y sus totales.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "leer_clientes",
      description: "Obtiene la lista de clientes o prospectos comerciales del sistema.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "obtener_tareas_pendientes",
      description: "Obtiene la lista de tareas pendientes con prioridad y fechas límite.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "obtener_eventos_calendario",
      description: "Obtiene los próximos vencimientos y entregas del calendario corporativo.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "leer_inventario",
      description: "Obtiene los productos en inventario y sus existencias de stock.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "leer_empleados",
      description: "Obtiene el directorio corporativo de empleados activos (solo en Track).",
      parameters: { type: "object", properties: {} },
    },
  },
  // ===== CRM-ERP ESPECÍFICOS =====
  {
    type: "function",
    function: {
      name: "leer_finanzas",
      description: "Obtiene saldos de cuentas de banco/cajas y listado de egresos, gastos y cuentas por cobrar o pagar de CRM-ERP.",
      parameters: {
        type: "object",
        properties: {
          seccion: {
            type: "string",
            enum: ["cuentas", "documentos", "todo"],
            description: "Sección específica de finanzas a consultar (por defecto todo)"
          },
          tipo_documento: {
            type: "string",
            enum: ["CUENTA_PAGAR", "NOTA_CARGO", "GASTO"],
            description: "Filtrar documentos por tipo si aplica"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_gasto",
      description: "Registra un nuevo gasto o egreso en el ERP.",
      parameters: {
        type: "object",
        properties: {
          concepto: { type: "string", description: "Concepto o descripción del gasto" },
          monto: { type: "number", description: "Monto total del gasto sin IVA" },
          proveedor: { type: "string", description: "Nombre del proveedor (opcional)" },
          categoria: { type: "string", description: "Categoría del gasto (ej. Viáticos, Marketing, etc.) (opcional)" },
          fecha_emision: { type: "string", description: "Fecha del gasto YYYY-MM-DD (opcional)" }
        },
        required: ["concepto", "monto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_cuenta_pagar",
      description: "Registra una cuenta por pagar a proveedores (egreso futuro diferido).",
      parameters: {
        type: "object",
        properties: {
          concepto: { type: "string", description: "Concepto de la cuenta por pagar" },
          monto: { type: "number", description: "Monto total" },
          proveedor: { type: "string", description: "Nombre del proveedor" },
          fecha_vencimiento: { type: "string", description: "Fecha límite de pago YYYY-MM-DD" },
          fecha_emision: { type: "string", description: "Fecha de emisión YYYY-MM-DD (opcional)" }
        },
        required: ["concepto", "monto", "proveedor", "fecha_vencimiento"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_cuenta_cobrar",
      description: "Registra una nueva cuenta por cobrar (Nota de Cargo a clientes).",
      parameters: {
        type: "object",
        properties: {
          concepto: { type: "string", description: "Concepto del cobro" },
          monto: { type: "number", description: "Monto del cobro" },
          prospect_id: { type: "string", description: "ID del prospecto o cliente (UUID) (opcional)" },
          fecha_vencimiento: { type: "string", description: "Fecha de vencimiento YYYY-MM-DD (opcional)" }
        },
        required: ["concepto", "monto"]
      }
    }
  }
];

/**
 * Obtiene el allowlist de herramientas permitidas según la plataforma y el contexto del módulo para evitar desbordamiento de privilegios.
 */
export function getAllowedToolsForContext(platform: "track" | "crm_erp", moduleContext?: string): string[] {
  if (platform === "track") {
    if (!moduleContext) {
      return [
        "leer_proyectos",
        "leer_cotizaciones",
        "leer_clientes",
        "obtener_tareas_pendientes",
        "obtener_eventos_calendario",
        "leer_inventario",
        "leer_empleados",
      ];
    }

    const contextLower = moduleContext.toLowerCase();

    if (contextLower.includes("proyecto") || contextLower.includes("tarea") || contextLower.includes("calendario") || contextLower.includes("trak")) {
      return [
        "crear_proyecto",
        "leer_proyectos",
        "crear_tarea",
        "obtener_tareas_pendientes",
        "obtener_eventos_calendario",
      ];
    }

    if (contextLower.includes("crm") || contextLower.includes("embudo") || contextLower.includes("prospecto") || contextLower.includes("cliente") || contextLower.includes("cotizaci")) {
      return [
        "crear_cotizacion",
        "leer_cotizaciones",
        "crear_cliente",
        "leer_clientes",
        "leer_proyectos",
      ];
    }

    if (contextLower.includes("inventario") || contextLower.includes("almacen") || contextLower.includes("bodega")) {
      return ["leer_inventario", "crear_producto"];
    }

    if (contextLower.includes("recurso") || contextLower.includes("humano") || contextLower.includes("rh") || contextLower.includes("empleado")) {
      return ["leer_empleados", "crear_empleado"];
    }

    return [
      "leer_proyectos",
      "leer_cotizaciones",
      "leer_clientes",
      "obtener_tareas_pendientes",
      "obtener_eventos_calendario",
    ];
  } else {
    // plataforma crm_erp
    if (!moduleContext) {
      return [
        "leer_cotizaciones",
        "leer_clientes",
        "obtener_tareas_pendientes",
        "obtener_eventos_calendario",
        "leer_inventario",
        "leer_finanzas",
      ];
    }

    const contextLower = moduleContext.toLowerCase();

    // Módulos Financieros (Finanzas, Tesorería, AP/AR, Gastos)
    if (contextLower.includes("finan") || contextLower.includes("tesor") || contextLower.includes("banco") || contextLower.includes("caja")) {
      return ["leer_finanzas"];
    }
    if (contextLower.includes("gasto") || contextLower.includes("reembolso")) {
      return ["leer_finanzas", "crear_gasto"];
    }
    if (contextLower.includes("cobrar") || contextLower.includes("cxc")) {
      return ["leer_finanzas", "crear_cuenta_cobrar"];
    }
    if (contextLower.includes("pagar") || contextLower.includes("cxp")) {
      return ["leer_finanzas", "crear_cuenta_pagar"];
    }

    // Módulo de Compras / Proveedores
    if (contextLower.includes("compra") || contextLower.includes("abastec") || contextLower.includes("proveedor")) {
      return ["leer_finanzas", "crear_cuenta_pagar", "leer_inventario"];
    }

    // Ventas, Prospectos, Cotizaciones y Clientes
    if (contextLower.includes("crm") || contextLower.includes("embudo") || contextLower.includes("prospecto") || contextLower.includes("cliente") || contextLower.includes("cotizaci")) {
      return [
        "crear_cotizacion",
        "leer_cotizaciones",
        "crear_cliente",
        "leer_clientes",
      ];
    }

    // Inventarios, Bodegas, Stock
    if (contextLower.includes("inventario") || contextLower.includes("stock") || contextLower.includes("movimiento") || contextLower.includes("almacen") || contextLower.includes("bodega")) {
      return ["leer_inventario", "crear_producto"];
    }

    // Tareas / Calendario del Nodo
    if (contextLower.includes("tarea") || contextLower.includes("calendario") || contextLower.includes("nodo") || contextLower.includes("workspace") || contextLower.includes("colabora")) {
      return [
        "crear_tarea",
        "obtener_tareas_pendientes",
        "obtener_eventos_calendario"
      ];
    }

    // Por defecto, herramientas de lectura para CRM-ERP
    return [
      "leer_cotizaciones",
      "leer_clientes",
      "obtener_tareas_pendientes",
      "obtener_eventos_calendario",
      "leer_inventario",
      "leer_finanzas",
    ];
  }
}

/**
 * Enrutador de ejecución de herramientas.
 */
export async function executeTool(
  supabase: SupabaseClient,
  workspaceId: string,
  fnName: string,
  args: any,
  platform: "track" | "crm_erp"
): Promise<string> {
  switch (fnName) {
    case "crear_proyecto":
      return await crearProyecto(supabase, workspaceId, args, platform);
    case "leer_proyectos":
      return await leerProyectos(supabase, workspaceId, platform);
    case "crear_tarea":
      return await crearTarea(supabase, workspaceId, args, platform);
    case "obtener_tareas_pendientes":
      return await obtenerTareasPendientes(supabase, workspaceId, platform);
    case "obtener_eventos_calendario":
      return await obtenerEventosCalendario(supabase, workspaceId, platform);
    case "crear_cotizacion":
      return await crearCotizacion(supabase, workspaceId, args, platform);
    case "leer_cotizaciones":
      return await leerCotizaciones(supabase, workspaceId, platform);
    case "crear_cliente":
      return await crearCliente(supabase, workspaceId, args, platform);
    case "leer_clientes":
      return await leerClientes(supabase, workspaceId, platform);
    case "leer_inventario":
      return await leerInventario(supabase, workspaceId, platform);
    case "crear_producto":
      return await crearProducto(supabase, workspaceId, args, platform);
    case "leer_empleados":
      return await leerEmpleados(supabase, workspaceId, platform);
    case "crear_empleado":
      return await crearEmpleado(supabase, workspaceId, args, platform);
    // CRM-ERP Específicos de Finanzas
    case "leer_finanzas":
      return await leerFinanzas(supabase, workspaceId, args, platform);
    case "crear_gasto":
      return await crearGasto(supabase, workspaceId, args, platform);
    case "crear_cuenta_pagar":
      return await crearCuentaPagar(supabase, workspaceId, args, platform);
    case "crear_cuenta_cobrar":
      return await crearCuentaCobrar(supabase, workspaceId, args, platform);
    default:
      throw new Error(`La herramienta "${fnName}" no está registrada en el backend.`);
  }
}
