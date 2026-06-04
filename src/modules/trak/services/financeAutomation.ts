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
  const { data: milestones } = await supabase
    .from('trak_project_milestones')
    .select('id, status, amount')
    .eq('project_id', projectId);

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

  await supabase.from('trak_project_activity').insert({
    project_id: projectId,
    user_id: userId || null,
    type: pendingAmount > 0 ? 'issue' : 'status_change',
    is_resolved: pendingAmount <= 0,
    content: pendingAmount > 0
      ? `Proyecto completado con ${money(pendingAmount)} pendiente de cobro. Revisar hitos antes del cierre financiero.`
      : 'Proyecto completado y sin cobranza pendiente registrada.'
  });

  if (workspaceId && pendingAmount > 0) {
    await supabase.from('trak_notifications').insert({
      workspace_id: workspaceId,
      type: 'finance',
      title: 'Cierre financiero pendiente',
      message: `Un proyecto se completo con ${money(pendingAmount)} pendiente de cobro.`,
      link_url: `/trak/projects/${projectId}`
    });
  }
}
