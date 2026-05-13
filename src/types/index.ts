export type PaymentMethod = 'debit' | 'credit' | 'pix' | 'cash';

export interface Barbershop {
  id: string;
  name: string;
  cnpj: string; // login da barbearia
  password: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  barbershopId: string;
  name: string;
  cpfOrCnpj: string;
  email: string; // usado para login do profissional
  phone: string;
  defaultServiceCommission: number; // % padrão de comissão de serviço
  defaultProductCommission: number; // % padrão de comissão de produto
  avatarUrl?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  price: number;
  durationMinutes: number;
  // Permite sobrepor a comissão padrão para profissionais específicos
  customCommissions?: { [professionalId: string]: number }; 
}

export interface Product {
  id: string;
  barbershopId: string;
  name: string;
  price: number;
  stock: number;
  customCommissions?: { [professionalId: string]: number }; 
}

export interface Client {
  id: string;
  barbershopId: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  visitsCount: number;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  barbershopId: string;
  professionalId: string;
  clientId: string;
  clientName?: string; // Cache simplificado
  serviceId: string;
  serviceName?: string;
  price: number;
  commissionValue: number;
  dateTime: string; // ISO string
  status: 'scheduled' | 'completed' | 'canceled';
  paid: boolean;
  paymentMethod?: PaymentMethod;
}

export interface ProductSale {
  id: string;
  barbershopId: string;
  professionalId: string;
  productId: string;
  productName?: string;
  price: number;
  commissionValue: number;
  dateTime: string;
  paymentMethod: PaymentMethod;
}

export interface CashRegister {
  id: string;
  barbershopId: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  currentCalculatedTotal: number;
  status: 'open' | 'closed';
  notes?: string;
  paymentBreakdown?: Record<PaymentMethod, number>;
}

export interface NotificationLog {
  id: string;
  barbershopId: string;
  type: 'whatsapp' | 'email';
  recipient: string;
  recipientName: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'pending';
}

export interface MarketingPost {
  id: string;
  barbershopId: string;
  type: 'feed' | 'story';
  caption: string;
  suggestedImagePrompt: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  totalServices: number;
  totalServicesValue: number;
  totalProducts: number;
  totalProductsValue: number;
  commissionsPaid: number;
  netBarbershopProfit: number;
  paymentSummary: Record<PaymentMethod, number>;
}
