import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Scissors, 
  ShoppingBag, 
  Send, 
  CalendarCheck, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Appointment, ProductSale, CashRegister, WeeklyReport, Professional } from '../types';
import { PAYMENT_METHODS, sumPaymentSummary } from '../services/db';

interface DashboardProps {
  appointments: Appointment[];
  productSales: ProductSale[];
  cashRegisters: CashRegister[];
  professionals: Professional[];
  currentBarbershopId: string;
  userType: 'admin' | 'professional' | null;
  currentUserId: string | null;
  onSendWeeklyReport: () => void;
  onOpenCashModal: () => void;
  weeklyReport: WeeklyReport;
}

export const Dashboard: React.FC<DashboardProps> = ({
  appointments,
  productSales,
  cashRegisters,
  professionals,
  currentBarbershopId,
  userType,
  currentUserId,
  onSendWeeklyReport,
  onOpenCashModal,
  weeklyReport
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtrar dados da barbearia atual
  const shopAppointments = appointments.filter(a => a.barbershopId === currentBarbershopId);
  const shopSales = productSales.filter(ps => ps.barbershopId === currentBarbershopId);
  
  // Identificar caixa aberto de hoje
  const openCash = cashRegisters.find(cr => cr.barbershopId === currentBarbershopId && cr.status === 'open');

  // Filtrar serviços lançados no dia de hoje
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayAppointments = shopAppointments.filter(a => {
    const d = new Date(a.dateTime);
    return d >= startOfDay && a.status !== 'canceled';
  });

  const todaySales = shopSales.filter(ps => {
    const d = new Date(ps.dateTime);
    return d >= startOfDay;
  });

  const todayServicesTotal = todayAppointments.filter(a => a.paid).reduce((sum, item) => sum + item.price, 0);
  const todayProductsTotal = todaySales.reduce((sum, item) => sum + item.price, 0);

  // Se o usuário logado for um Profissional, filtramos apenas as métricas DELE
  const isProf = userType === 'professional';
  const myAppointmentsToday = isProf 
    ? todayAppointments.filter(a => a.professionalId === currentUserId)
    : todayAppointments;
  
  const mySalesToday = isProf
    ? todaySales.filter(ps => ps.professionalId === currentUserId)
    : todaySales;

  const myCommissionToday = isProf 
    ? myAppointmentsToday.reduce((sum, item) => sum + item.commissionValue, 0) +
      mySalesToday.reduce((sum, item) => sum + item.commissionValue, 0)
    : 0;

  const myPaymentSummaryToday = sumPaymentSummary([
    ...myAppointmentsToday.map(item => ({ paymentMethod: item.paymentMethod, price: item.price })),
    ...mySalesToday.map(item => ({ paymentMethod: item.paymentMethod, price: item.price })),
  ]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner Superior Exclusivo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1410] via-[#2a1b12] to-[#141110] border border-[#33251d] p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#8c6239]/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <span className="text-[11px] font-extrabold uppercase bg-[#8c6239] text-white px-3 py-1 rounded-full">
            {isProf ? 'Resumo do Profissional' : 'Controle do Estabelecimento'}
          </span>
          <h1 className="text-3xl font-black text-white mt-4 tracking-tight">
            {isProf ? 'Seu desempenho diário está incrível!' : 'Gestão Financeira & Faturamento'}
          </h1>
          <p className="text-sm text-[#bfada3] mt-2 leading-relaxed">
            {isProf 
              ? 'Acompanhe de forma individual cada serviço lançado e suas comissões geradas em tempo real.'
              : 'Sistema automático de caixa. As vendas faturadas são somadas instantaneamente na abertura do dia.'
            }
          </p>

          {/* Ações do Relatório para o Dono */}
          {!isProf && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onSendWeeklyReport}
                className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c29f32] text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Disparar Relatório Geral (6 Dias)</span>
              </button>
              <span className="text-xs text-[#a38a7a]">
                Notifica o dono por <strong>E-mail</strong> e <strong>WhatsApp</strong>.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* GRADE DE ESTATÍSTICAS PRINCIPAIS DE HOJE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Status do Caixa */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#a38a7a] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Situação do Caixa</span>
              <Wallet className="w-5 h-5 text-[#8c6239]" />
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              {openCash ? 'Caixa Aberto' : 'Caixa Fechado'}
            </h3>
            <p className="text-xs text-[#a38a7a] mt-1">
              {openCash 
                ? `Abertura com ${formatCurrency(openCash.openingBalance)}` 
                : 'Abra para começar a faturar hoje'
              }
            </p>
          </div>

          {!isProf && (
            <button
              onClick={onOpenCashModal}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-colors text-center ${
                openCash 
                  ? 'bg-[#1e1917] hover:bg-[#2a2320] text-[#e8dbd3] border border-[#33251d]' 
                  : 'bg-[#8c6239] hover:bg-[#734f2d] text-white'
              }`}
            >
              {openCash ? 'Gerenciar Caixa do Dia' : 'Abrir Caixa Agora'}
            </button>
          )}
        </div>

        {/* Card 2: Faturamento Serviços Hoje */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#a38a7a] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Serviços Hoje</span>
              <Scissors className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              {formatCurrency(isProf ? myAppointmentsToday.reduce((sum, item) => sum + item.price, 0) : todayServicesTotal)}
            </h3>
            <p className="text-xs text-[#a38a7a] mt-1">
              {isProf ? myAppointmentsToday.length : todayAppointments.filter(a => a.paid).length} serviços concluídos
            </p>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Contabilidade automática</span>
          </div>
        </div>

        {/* Card 3: Produtos Vendidos Hoje */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#a38a7a] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Produtos Hoje</span>
              <ShoppingBag className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              {formatCurrency(isProf ? mySalesToday.reduce((sum, item) => sum + item.price, 0) : todayProductsTotal)}
            </h3>
            <p className="text-xs text-[#a38a7a] mt-1">
              {isProf ? mySalesToday.length : todaySales.length} itens vendidos
            </p>
          </div>
          <div className="text-[11px] text-sky-500 font-semibold mt-4">
            <span>Baixa em estoque atualizada</span>
          </div>
        </div>

        {/* Card 4: Faturamento Total ou Comissão do Profissional */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#1b1614] to-[#141110]">
          <div>
            <div className="flex items-center justify-between text-[#a38a7a] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isProf ? 'Minha Comissão Hoje' : 'Saldo Total do Caixa'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
            </div>
            <h3 className="text-2xl font-black text-[#d4af37] mt-1">
              {formatCurrency(isProf ? myCommissionToday : (openCash ? openCash.currentCalculatedTotal : 0))}
            </h3>
            <p className="text-xs text-[#a38a7a] mt-1">
              {isProf ? 'A receber da barbearia' : 'Abertura + Serviços + Produtos'}
            </p>
          </div>
          <div className="text-[11px] text-[#bfada3] mt-4 pt-2 border-t border-[#2a1f18]">
            <span>Líquido calculado na hora</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: DETALHAMENTO DE RELATÓRIO E LANÇAMENTOS DO DIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Painel Esquerdo: Visão da empresa ou resumo individual */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl md:col-span-1 flex flex-col justify-between">
          {isProf ? (
            <>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-[#2a1f18] pb-3">
                  <CalendarCheck className="w-4 h-4 text-[#8c6239]" />
                  <span>Meu Resumo Individual</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Serviços hoje</span>
                    <span className="text-xs font-bold text-white">{myAppointmentsToday.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Produtos hoje</span>
                    <span className="text-xs font-bold text-white">{mySalesToday.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Minhas comissões</span>
                    <span className="text-xs font-bold text-emerald-400">{formatCurrency(myCommissionToday)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Recebido via Pix</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(myPaymentSummaryToday.pix)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Recebido no cartão</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(myPaymentSummaryToday.debit + myPaymentSummaryToday.credit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-2 bg-[#1e1917] px-3 rounded-xl border border-[#33251d]">
                    <span className="text-xs font-bold text-white">Total faturado por mim</span>
                    <span className="text-sm font-black text-[#d4af37]">{formatCurrency(myPaymentSummaryToday.pix + myPaymentSummaryToday.debit + myPaymentSummaryToday.credit + myPaymentSummaryToday.cash)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1f18]">
                <p className="text-[11px] text-[#a38a7a] leading-relaxed">
                  Aqui você vê apenas seu faturamento, comissões e entradas por forma de pagamento.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-[#2a1f18] pb-3">
                  <CalendarCheck className="w-4 h-4 text-[#8c6239]" />
                  <span>Relatório Geral (Prazo 6 Dias)</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Total Serviços (6 dias)</span>
                    <span className="text-xs font-bold text-white">{weeklyReport.totalServices} faturados</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Valor de Serviços</span>
                    <span className="text-xs font-bold text-emerald-400">{formatCurrency(weeklyReport.totalServicesValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Produtos Vendidos</span>
                    <span className="text-xs font-bold text-white">{weeklyReport.totalProducts} unidades</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Valor de Produtos</span>
                    <span className="text-xs font-bold text-sky-400">{formatCurrency(weeklyReport.totalProductsValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1e1917]">
                    <span className="text-xs text-[#a38a7a]">Comissões Destinadas</span>
                    <span className="text-xs font-bold text-amber-500">{formatCurrency(weeklyReport.commissionsPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-2 bg-[#1e1917] px-3 rounded-xl border border-[#33251d]">
                    <span className="text-xs font-bold text-white">Lucro Líquido Empresa</span>
                    <span className="text-sm font-black text-[#d4af37]">{formatCurrency(weeklyReport.netBarbershopProfit)}</span>
                  </div>

                  <div className="pt-3 border-t border-[#2a1f18] space-y-2">
                    <p className="text-[10px] uppercase font-bold text-[#a38a7a]">Pagamentos recebidos no período</p>
                    {PAYMENT_METHODS.map(method => (
                      <div key={method.value} className="flex justify-between items-center text-xs">
                        <span className="text-[#a38a7a]">{method.label}</span>
                        <span className="font-bold text-white">{formatCurrency(weeklyReport.paymentSummary[method.value])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1f18]">
                <p className="text-[11px] text-[#a38a7a] leading-relaxed">
                  O relatório da barbearia envia uma sumarização perfeita de performance na semana, assegurando controle muito acessível e visível.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Painel Direito: Lançamentos / Extrato de Hoje */}
        <div className="bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl md:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-[#2a1f18] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8c6239]" />
              <span>Serviços e Vendas do Dia (Hoje)</span>
            </h3>
            <span className="text-xs text-[#a38a7a]">
              {isProf ? myAppointmentsToday.length + mySalesToday.length : todayAppointments.length + todaySales.length} registros
            </span>
          </div>

          {/* Lista combinada de agendamentos e vendas */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {/* Lista de Agendamentos/Serviços */}
            {todayAppointments.map((appt) => {
              const prof = professionals.find(p => p.id === appt.professionalId);
              const isMine = appt.professionalId === currentUserId;
              
              if (isProf && !isMine) return null;

              return (
                <div 
                  key={appt.id} 
                  className="bg-[#1b1614] border border-[#2a1f18] hover:border-[#4a3525] p-3 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#8c6239]/10 text-[#8c6239] flex items-center justify-center shrink-0">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">{appt.serviceName}</p>
                        <span className="text-[10px] text-[#a38a7a]">({appt.clientName || 'Avulso'})</span>
                      </div>
                      <p className="text-[11px] text-[#a38a7a]">
                        Feito por: <strong className="text-[#bfada3]">{prof?.name || 'Profissional'}</strong> • 
                        Comissão: <span className="text-emerald-400 font-semibold">{formatCurrency(appt.commissionValue)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-white">{formatCurrency(appt.price)}</p>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      {appt.paid ? 'Pago no Caixa' : 'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Lista de Vendas de Produtos */}
            {todaySales.map((sale) => {
              const prof = professionals.find(p => p.id === sale.professionalId);
              const isMine = sale.professionalId === currentUserId;

              if (isProf && !isMine) return null;

              return (
                <div 
                  key={sale.id} 
                  className="bg-[#1b1614] border border-[#2a1f18] hover:border-[#4a3525] p-3 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{sale.productName}</p>
                      <p className="text-[11px] text-[#a38a7a]">
                        Vendido por: <strong className="text-[#bfada3]">{prof?.name || 'Profissional'}</strong> • 
                        Comissão: <span className="text-sky-400 font-semibold">{formatCurrency(sale.commissionValue)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-white">{formatCurrency(sale.price)}</p>
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-bold">
                      Produto
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Placeholder Vazio */}
            {((isProf ? myAppointmentsToday.length + mySalesToday.length : todayAppointments.length + todaySales.length) === 0) && (
              <div className="text-center py-12 bg-[#1b1614]/50 rounded-xl border border-dashed border-[#2a1f18]">
                <CheckCircle2 className="w-8 h-8 text-[#523d2f] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#a38a7a]">Nenhum serviço ou produto faturado hoje até o momento.</p>
                <p className="text-[11px] text-[#523d2f] mt-1">Utilize o botão flutuante para lançar e validar o cálculo automático.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
