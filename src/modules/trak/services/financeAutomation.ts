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

/**
 * Completes the financial closeout of a project.
 * Now stays 100% within Trak: only updates trak_project_milestones
 * and trak_project_activity. Does NOT write to Core tables.
 */
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

  // Mark all pending milestones as 'invoiced' so they show as pending-to-collect in Trak Finance
  if (pendingAmount > 0) {
    const pendingIds = (milestones || []).filter(m => m.status === 'pending').map(m => m.id);
    if (pendingIds.length > 0) {
      await supabase.from('trak_project_milestones').update({ status: 'invoiced' }).in('id', pendingIds);
    }
  }

  await supabase.from('trak_project_activity').insert({
    project_id: projectId,
    user_id: userId || null,
    type: pendingAmount > 0 ? 'milestone' : 'status_change',
    is_resolved: pendingAmount <= 0,
    content: pendingAmount > 0
      ? `Proyecto completado. Quedan ${money(pendingAmount)} pendientes de cobrar en Plan de Pagos.`
      : 'Proyecto completado y sin cobranza pendiente registrada.'
  });

  if (workspaceId && pendingAmount > 0) {
    await supabase.from('trak_notifications').insert({
      workspace_id: workspaceId,
      type: 'finance',
      title: 'Proyecto completado con saldo pendiente',
      message: `"${project?.name}" fue completado. Quedan ${money(pendingAmount)} por cobrar en el Plan de Pagos.`,
      link_url: `/trak/projects/${projectId}`
    });
  }
}

/**
 * Marks a project milestone as 'invoiced' (Cuenta por Cobrar generated).
 * Now stays 100% within Trak: only updates trak_project_milestones.
 * Does NOT write to Core charge_notes or prospects tables.
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

  try {
    // Update milestone status to 'invoiced'
    await supabase.from('trak_project_milestones').update({
      status: 'invoiced'
    }).eq('id', milestone.id);

    // Activity log
    await supabase.from('trak_project_activity').insert({
      project_id: project.id,
      user_id: userId || null,
      type: 'milestone',
      content: `Hito "${milestone.name}" marcado como Cuenta por Cobrar por ${money(milestone.amount)}.`
    });

    // Notification
    await supabase.from('trak_notifications').insert({
      workspace_id: workspaceId,
      type: 'finance',
      title: 'Cuenta por Cobrar generada',
      message: `Hito "${milestone.name}" del proyecto "${project.name}" por ${money(milestone.amount)} está pendiente de cobro.`,
      link_url: `/trak/projects/${project.id}`
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
