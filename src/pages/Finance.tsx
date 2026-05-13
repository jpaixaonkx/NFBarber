import React from 'react';
import { DollarSign, Users, History } from 'lucide-react';
import { Appointment, ProductSale, CashRegister, Professional, WeeklyReport } from '../types';
import { PAYMENT_METHODS } from '../services/db';

interface FinanceProps {
  appointments: Appointment[];
  productSales: ProductSale[];
  cashRegisters: CashRegister[];
  professionals: Professional[];
  currentBarbershopId: string;
  weeklyReport: WeeklyReport;
  userType: 'admin' | 'professional' | null;
  currentUserId: string | null;
}

export const Finance: React.FC<FinanceProps> = ({
  appointments,
  productSales,
  cashRegisters,
  professionals,
  currentBarbershopId,
  weeklyReport,
  userType,
  currentUserId
}) => {
  const shopAppts = appointments.filter(a => a.barbershopId === currentBarbershopId);
  const shopSales = productSales.filter(ps => ps.barbershopId === currentBarbershopId);
  const shopCash = cashRegisters.filter(cr => cr.barbershopId === currentBarbershopId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Histórico de comissões totais geradas por profissional (pago + pendente)
  const profCommissionsData = professionals.filter(p => p.barbershopId === currentBarbershopId).map(prof => {
    const pAppts = shopAppts.filter(a => a.professionalId === prof.id && a.status !== 'canceled');
    const pSales = shopSales.filter(ps => ps.professionalId === prof.id);

    const apptCount = pAppts.length;
    const salesCount = pSales.length;

    const totalServiceRevenue = pAppts.reduce((sum, item) => sum + item.price, 0);
    const totalProductRevenue = pSales.reduce((sum, item) => sum + item.price, 0);

    const totalCommissions = pAppts.reduce((sum, item) => sum + item.commissionValue, 0) +
                             pSales.reduce((sum, item) => sum + item.commissionValue, 0);

    return {
      ...prof,
      apptCount,
      salesCount,
      totalServiceRevenue,
      totalProductRevenue,
      totalCommissions
    };
  });

  const isProf = userType === 'professional';
  const myProf = isProf ? professionals.find(p => p.id === currentUserId) : null;
  const myAppointments = isProf ? shopAppts.filter(a => a.professionalId === currentUserId) : [];
  const mySales = isProf ? shopSales.filter(ps => ps.professionalId === currentUserId) : [];
  const myPayments = [...myAppointments, ...mySales].reduce((acc, item) => {
    const method = item.paymentMethod || 'cash';
    acc[method] = (acc[method] || 0) + item.price;
    return acc;
  }, { pix: 0, debit: 0, credit: 0, cash: 0 } as Record<'pix' | 'debit' | 'credit' | 'cash', number>);

  if (isProf && myProf) {
    const myTotalRevenue = myAppointments.reduce((sum, item) => sum + item.price, 0) + mySales.reduce((sum, item) => sum + item.price, 0);
    const myCommissionTotal = myAppointments.reduce((sum, item) => sum + item.commissionValue, 0) + mySales.reduce((sum, item) => sum + item.commissionValue, 0);

    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#8c6239]" />
            <span>Minhas Comissões & Recebimentos</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">Painel individual, sem dados da empresa ou de outros profissionais.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">Meu faturamento</span>
            <h3 className="text-xl font-black text-white mt-1">{formatCurrency(myTotalRevenue)}</h3>
            <p className="text-[11px] text-[#bfada3] mt-1">Somente meus serviços e produtos</p>
          </div>
          <div className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">Minha comissão</span>
            <h3 className="text-xl font-black text-emerald-400 mt-1">{formatCurrency(myCommissionTotal)}</h3>
            <p className="text-[11px] text-[#bfada3] mt-1">A receber da barbearia</p>
          </div>
          {PAYMENT_METHODS.map((method) => (
            <div key={method.value} className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">{method.label}</span>
              <h3 className="text-xl font-black text-white mt-1">{formatCurrency(myPayments[method.value])}</h3>
              <p className="text-[11px] text-[#bfada3] mt-1">Recebimentos classificados</p>
            </div>
          ))}
        </div>

        <div className="bg-[#141110] border border-[#2a1f18] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#2a1f18] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8c6239]" />
              <span>Meus Lançamentos</span>
            </h3>
            <span className="text-xs text-[#a38a7a]">{myAppointments.length + mySales.length} registros</span>
          </div>
          <div className="divide-y divide-[#1e1917]">
            {[...myAppointments, ...mySales].map((item) => {
              const label = 'serviceName' in item ? item.serviceName : (item as ProductSale).productName;
              return (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{label || 'Lançamento'}</p>
                  <p className="text-[11px] text-[#a38a7a] mt-1">Forma de pagamento: {item.paymentMethod === 'pix' ? 'Pix' : item.paymentMethod === 'debit' ? 'Débito' : item.paymentMethod === 'credit' ? 'Crédito' : 'Dinheiro'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#d4af37]">{formatCurrency(item.price)}</p>
                  <p className="text-[11px] text-emerald-400">Comissão {formatCurrency(item.commissionValue)}</p>
                </div>
              </div>
              );
            })}
            {myAppointments.length + mySales.length === 0 && <div className="p-8 text-center text-[#a38a7a] text-xs">Nenhum lançamento encontrado.</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#8c6239]" />
          <span>Gestão Financeira & Comissões</span>
        </h2>
        <p className="text-xs text-[#a38a7a] mt-0.5">
          Auditoria de faturamento da empresa e comissionamento individual distribuído.
        </p>
      </div>

      {/* Visão de Faturamento Acumulado (Matriz 6 Dias) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">Serviços Bruto</span>
          <h3 className="text-xl font-black text-white mt-1">
            {formatCurrency(weeklyReport.totalServicesValue)}
          </h3>
          <p className="text-[11px] text-[#bfada3] mt-1">{weeklyReport.totalServices} serviços somados</p>
        </div>

        <div className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">Produtos Bruto</span>
          <h3 className="text-xl font-black text-white mt-1">
            {formatCurrency(weeklyReport.totalProductsValue)}
          </h3>
          <p className="text-[11px] text-[#bfada3] mt-1">{weeklyReport.totalProducts} itens em caixa</p>
        </div>

        <div className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#a38a7a] block">Comissões a Pagar</span>
          <h3 className="text-xl font-black text-amber-500 mt-1">
            {formatCurrency(weeklyReport.commissionsPaid)}
          </h3>
          <p className="text-[11px] text-[#bfada3] mt-1">Repasse direto aos profissionais</p>
        </div>

        <div className="bg-gradient-to-tr from-[#8c6239] via-[#634427] to-[#d4af37] p-5 rounded-2xl text-white">
          <span className="text-[10px] uppercase font-extrabold text-white/80 block">Lucro Retido Empresa</span>
          <h3 className="text-xl font-black text-white mt-1">
            {formatCurrency(weeklyReport.netBarbershopProfit)}
          </h3>
          <p className="text-[11px] text-white/90 mt-1">Líquido de taxas de repasse</p>
        </div>

        <div className="md:col-span-4 bg-[#141110] border border-[#2a1f18] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Pagamentos por forma no período</h3>
            <span className="text-xs text-[#a38a7a]">6 dias</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {PAYMENT_METHODS.map(method => (
              <div key={method.value} className="bg-[#1b1614] border border-[#2a1f18] rounded-xl p-4">
                <p className="text-[10px] uppercase font-bold text-[#a38a7a]">{method.label}</p>
                <p className="text-lg font-black text-white mt-1">{formatCurrency(weeklyReport.paymentSummary[method.value])}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relatório Analítico por Profissional */}
      <div className="bg-[#141110] border border-[#2a1f18] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#2a1f18] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8c6239]" />
            <span>Faturamento Individual por Colaborador</span>
          </h3>
          <span className="text-xs text-[#a38a7a]">Distribuição da Empresa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1b1614] border-b border-[#2a1f18] text-[#a38a7a]">
                <th className="p-4 font-bold">Profissional</th>
                <th className="p-4 font-bold text-center">Atendimentos</th>
                <th className="p-4 font-bold text-right">Gerado Serviços</th>
                <th className="p-4 font-bold text-right">Gerado Produtos</th>
                <th className="p-4 font-bold text-right">Faturamento Total</th>
                <th className="p-4 font-bold text-right text-emerald-400">Minha Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1917]">
              {profCommissionsData.map(row => {
                const totalRev = row.totalServiceRevenue + row.totalProductRevenue;
                return (
                  <tr key={row.id} className="hover:bg-[#1b1614]/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img 
                        src={row.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span>{row.name}</span>
                    </td>
                    <td className="p-4 text-center text-[#bfada3]">
                      <span className="bg-[#2a1f18] px-2 py-0.5 rounded text-xs font-bold text-[#d4af37]">
                        {row.apptCount + row.salesCount}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#bfada3]">{formatCurrency(row.totalServiceRevenue)}</td>
                    <td className="p-4 text-right text-[#bfada3]">{formatCurrency(row.totalProductRevenue)}</td>
                    <td className="p-4 text-right font-bold text-white">{formatCurrency(totalRev)}</td>
                    <td className="p-4 text-right font-black text-emerald-400 bg-emerald-500/5">
                      {formatCurrency(row.totalCommissions)}
                    </td>
                  </tr>
                );
              })}
              {profCommissionsData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#a38a7a]">
                    Nenhum profissional com dados lançados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditoria de Histórico do Caixa */}
      <div className="bg-[#141110] border border-[#2a1f18] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#2a1f18] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#8c6239]" />
            <span>Extrato de Fechamento de Caixa Diário</span>
          </h3>
          <span className="text-xs text-[#a38a7a]">Aberturas e Fechamentos Automáticos</span>
        </div>

        <div className="divide-y divide-[#1e1917]">
          {shopCash.map((cr) => {
            const dtOpen = new Date(cr.openedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const dtClose = cr.closedAt 
              ? new Date(cr.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
              : 'Ainda em Aberto';

            return (
              <div key={cr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cr.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                    <strong className="text-xs text-white">
                      {cr.status === 'open' ? 'Caixa Atual (Em Execução)' : 'Fechado com Sucesso'}
                    </strong>
                    <span className="text-[10px] text-[#a38a7a]">ID: {cr.id}</span>
                  </div>
                  <p className="text-[11px] text-[#a38a7a] mt-1">
                    Aberto em: <strong className="text-[#bfada3]">{dtOpen}</strong> • 
                    Fechado às: <strong className="text-[#bfada3]">{dtClose}</strong>
                  </p>
                  {cr.notes && (
                    <p className="text-[11px] text-[#8c6239] italic mt-0.5">Nota: "{cr.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-right bg-[#1b1614] p-2.5 rounded-xl border border-[#2a1f18] self-start sm:self-auto">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#a38a7a] block">Fundo de Abertura</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(cr.openingBalance)}</span>
                  </div>
                  <div className="border-l border-[#33251d] pl-3">
                    <span className="text-[9px] uppercase font-bold text-[#d4af37] block">Total Consolidado</span>
                    <span className="text-xs font-black text-[#d4af37]">
                      {formatCurrency(cr.status === 'open' ? cr.currentCalculatedTotal : (cr.closingBalance || cr.currentCalculatedTotal))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {shopCash.length === 0 && (
            <div className="p-8 text-center text-[#a38a7a] text-xs">
              Nenhum registro de caixa encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
