import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SyncRow = Record<string, unknown>;

const env = (import.meta as any).env ?? {};
const SUPABASE_URL = String(env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = String(env.VITE_SUPABASE_ANON_KEY || '').trim();

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const syncTables = [
  'barbershops',
  'professionals',
  'services',
  'products',
  'clients',
  'appointments',
  'product_sales',
  'cash_registers',
  'notification_logs',
  'marketing_posts',
] as const;

export const syncAppStateToSupabase = async (state: any) => {
  if (!supabase) return;

  const payloadMap: Record<(typeof syncTables)[number], SyncRow[]> = {
    barbershops: state.barbershops,
    professionals: state.professionals,
    services: state.services,
    products: state.products,
    clients: state.clients,
    appointments: state.appointments,
    product_sales: state.productSales,
    cash_registers: state.cashRegisters,
    notification_logs: state.notificationLogs,
    marketing_posts: state.marketingPosts,
  };

  await Promise.allSettled(
    syncTables.map(async (table) => {
      const rows = payloadMap[table];
      if (!rows.length) return;
      const { error } = await supabase.from(table).upsert(rows as never[], { onConflict: 'id' });
      if (error) {
        console.error(`[Supabase] Falha ao sincronizar ${table}:`, error.message);
      }
    })
  );
};

export const sendRealtimeNotification = async (payload: {
  barbershopId: string;
  professionalId: string;
  title: string;
  body: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientName: string;
}) => {
  const endpoints = [
    String(env.VITE_NOTIFICATION_WEBHOOK_URL || '').trim(),
    String(env.VITE_EMAIL_WEBHOOK_URL || '').trim(),
    String(env.VITE_WHATSAPP_WEBHOOK_URL || '').trim(),
  ].filter(Boolean) as string[];

  if (!endpoints.length) return;

  await Promise.allSettled(
    endpoints.map(endpoint =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )
  );
};
