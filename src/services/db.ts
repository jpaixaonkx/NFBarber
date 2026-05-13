import { 
  Barbershop, 
  Professional, 
  Service, 
  Product, 
  Client, 
  Appointment, 
  ProductSale, 
  CashRegister, 
  NotificationLog, 
  MarketingPost,
  WeeklyReport,
  PaymentMethod
} from '../types';

import { syncAppStateToSupabase, sendRealtimeNotification } from '../../supabase';

const STORAGE_KEY = 'nf_barber_db_data_v2';

interface DBState {
  barbershops: Barbershop[];
  professionals: Professional[];
  services: Service[];
  products: Product[];
  clients: Client[];
  appointments: Appointment[];
  productSales: ProductSale[];
  cashRegisters: CashRegister[];
  notificationLogs: NotificationLog[];
  marketingPosts: MarketingPost[];
  currentUserId: string | null;
  currentUserType: 'admin' | 'professional' | 'client' | null;
  currentBarbershopId: string | null;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
];

export const createEmptyPaymentSummary = (): Record<PaymentMethod, number> => ({
  pix: 0,
  debit: 0,
  credit: 0,
  cash: 0,
});

export const sumPaymentSummary = (
  items: Array<{ paymentMethod?: PaymentMethod; price: number }>
) => {
  const summary = createEmptyPaymentSummary();
  items.forEach(item => {
    const method = item.paymentMethod || 'cash';
    summary[method] += item.price;
  });
  return summary;
};

const INITIAL_STATE: DBState = {
  barbershops: [],
  professionals: [],
  services: [],
  products: [],
  clients: [],
  appointments: [],
  productSales: [],
  cashRegisters: [],
  notificationLogs: [],
  marketingPosts: [],
  currentUserId: null,
  currentUserType: null,
  currentBarbershopId: null
};

const normalizeDB = (state: DBState): DBState => ({
  ...state,
  clients: state.clients.map(client => ({
    ...client,
    password: client.password || client.phone.replace(/\D/g, '').slice(-4) || '1234',
  })),
  appointments: state.appointments.map(appt => ({
    ...appt,
    paymentMethod: appt.paymentMethod || (appt.paid ? 'cash' : undefined),
  })),
  productSales: state.productSales.map(sale => ({
    ...sale,
    paymentMethod: sale.paymentMethod || 'cash',
  })),
  cashRegisters: state.cashRegisters.map(cr => ({
    ...cr,
    paymentBreakdown: cr.paymentBreakdown || createEmptyPaymentSummary(),
  })),
});

// Função para ler ou inicializar o banco
export const loadDB = (): DBState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Garante que o estado tenha todas as propriedades caso venha de versão antiga
      return normalizeDB({ ...INITIAL_STATE, ...data });
    }
  } catch (e) {
    console.error("Falha ao ler LocalStorage", e);
  }
  saveDB(INITIAL_STATE);
  return INITIAL_STATE;
};

export const saveDB = (state: DBState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispara evento para reatividade multi-componentes
    window.dispatchEvent(new Event('nf_barber_db_update'));
    void syncAppStateToSupabase(state);
  } catch (e) {
    console.error("Falha ao salvar LocalStorage", e);
  }
};

// Funções de gatilho para notificações automáticas
export const triggerNotification = (
  state: DBState, 
  barbershopId: string, 
  professionalId: string, 
  title: string, 
  body: string
) => {
  const prof = state.professionals.find(p => p.id === professionalId);
  if (!prof) return;

  // Cria notificação de Whatsapp
  const logWpp: NotificationLog = {
    id: 'nw_' + Date.now(),
    barbershopId,
    type: 'whatsapp',
    recipient: prof.phone,
    recipientName: prof.name,
    message: `[NF Barber Automático via WhatsApp] ${title}: ${body}`,
    sentAt: new Date().toISOString(),
    status: 'sent'
  };

  // Cria notificação de Email
  const logEmail: NotificationLog = {
    id: 'ne_' + Date.now(),
    barbershopId,
    type: 'email',
    recipient: prof.email,
    recipientName: prof.name,
    message: `[NF Barber Sistema de Alertas E-mail] ${title}\n\nDetalhes:\n${body}`,
    sentAt: new Date().toISOString(),
    status: 'sent'
  };

  state.notificationLogs = [logWpp, logEmail, ...state.notificationLogs];
  void sendRealtimeNotification({
    barbershopId,
    professionalId,
    title,
    body,
    recipientEmail: prof.email,
    recipientPhone: prof.phone,
    recipientName: prof.name,
  });
};

// Atualiza o caixa aberto da barbearia recalculando seu saldo com os pagamentos de hoje
export const recalculateCurrentCashRegister = (state: DBState, barbershopId: string) => {
  const openCr = state.cashRegisters.find(cr => cr.barbershopId === barbershopId && cr.status === 'open');
  if (!openCr) return;

  // Pega todas as transações de serviços e produtos lançados/pagos de hoje
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const appointmentsToday = state.appointments.filter(a => {
    if (a.barbershopId !== barbershopId || !a.paid || a.status === 'canceled') return false;
    const aDate = new Date(a.dateTime);
    return aDate >= startOfDay;
  });

  const salesToday = state.productSales.filter(ps => {
    if (ps.barbershopId !== barbershopId) return false;
    const sDate = new Date(ps.dateTime);
    return sDate >= startOfDay;
  });

  const apptTotal = appointmentsToday.reduce((acc, curr) => acc + curr.price, 0);
  const salesTotal = salesToday.reduce((acc, curr) => acc + curr.price, 0);

  openCr.currentCalculatedTotal = openCr.openingBalance + apptTotal + salesTotal;
  openCr.paymentBreakdown = sumPaymentSummary([
    ...appointmentsToday,
    ...salesToday,
  ] as Array<{ paymentMethod?: PaymentMethod; price: number }>);
};

// Obter relatório de 6 dias
export const getWeeklyReportData = (state: DBState, barbershopId: string): WeeklyReport => {
  const now = new Date();
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(now.getDate() - 6);
  sixDaysAgo.setHours(0, 0, 0, 0);

  const filterAppts = state.appointments.filter(a => {
    if (a.barbershopId !== barbershopId || !a.paid || a.status === 'canceled') return false;
    const dt = new Date(a.dateTime);
    return dt >= sixDaysAgo && dt <= now;
  });

  const filterSales = state.productSales.filter(ps => {
    if (ps.barbershopId !== barbershopId) return false;
    const dt = new Date(ps.dateTime);
    return dt >= sixDaysAgo && dt <= now;
  });

  const totalServicesValue = filterAppts.reduce((sum, item) => sum + item.price, 0);
  const totalProductsValue = filterSales.reduce((sum, item) => sum + item.price, 0);
  
  const apptCommissions = filterAppts.reduce((sum, item) => sum + (item.commissionValue || 0), 0);
  const salesCommissions = filterSales.reduce((sum, item) => sum + (item.commissionValue || 0), 0);
  const commissionsPaid = apptCommissions + salesCommissions;

  const netBarbershopProfit = (totalServicesValue + totalProductsValue) - commissionsPaid;
  const paymentSummary = sumPaymentSummary([
    ...filterAppts,
    ...filterSales,
  ] as Array<{ paymentMethod?: PaymentMethod; price: number }>);

  return {
    startDate: sixDaysAgo.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    totalServices: filterAppts.length,
    totalServicesValue,
    totalProducts: filterSales.length,
    totalProductsValue,
    commissionsPaid,
    netBarbershopProfit,
    paymentSummary,
  };
};
