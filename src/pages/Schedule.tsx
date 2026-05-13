import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Scissors, User, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Appointment, Professional, Service, Client, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../services/db';

interface ScheduleProps {
  appointments: Appointment[];
  professionals: Professional[];
  services: Service[];
  clients: Client[];
  currentBarbershopId: string;
  userType: 'admin' | 'professional' | null;
  currentUserId: string | null;
  onAddAppointment: (data: {
    professionalId: string;
    clientId: string;
    serviceId: string;
    dateTime: string;
    paid: boolean;
    paymentMethod?: PaymentMethod;
  }) => void;
  onCancelAppointment: (id: string) => void;
  onBeginFinalizeAppointment: (id: string) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({
  appointments,
  professionals,
  services,
  clients,
  currentBarbershopId,
  userType,
  currentUserId,
  onAddAppointment,
  onCancelAppointment,
  onBeginFinalizeAppointment
}) => {
  const shopAppts = appointments.filter(a => a.barbershopId === currentBarbershopId);
  const shopProf = professionals.filter(p => p.barbershopId === currentBarbershopId);
  const shopServices = services.filter(s => s.barbershopId === currentBarbershopId);
  const shopClients = clients.filter(c => c.barbershopId === currentBarbershopId);

  const isProf = userType === 'professional';

  // Filtro
  const [selectedProfId, setSelectedProfId] = useState<string>(isProf ? (currentUserId || 'all') : 'all');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [profId, setProfId] = useState(shopProf[0]?.id || '');
  const [clientId, setClientId] = useState(shopClients[0]?.id || '');
  const [serviceId, setServiceId] = useState(shopServices[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const filteredAppts = shopAppts.filter(a => {
    if (selectedProfId !== 'all' && a.professionalId !== selectedProfId) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profId || !serviceId || !clientId) return;

    const dt = new Date(`${date}T${time}:00`).toISOString();
    onAddAppointment({
      professionalId: profId,
      clientId,
      serviceId,
      dateTime: dt,
      paid,
      paymentMethod: paid ? paymentMethod : undefined
    });

    setShowModal(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#8c6239]" />
            <span>{isProf ? 'Sua Agenda Individual' : 'Agenda de Atendimentos'}</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">
            Agendamentos com atualização automática do comissionamento em tempo real.
          </p>
        </div>

        <button
          onClick={() => {
            if (shopProf.length > 0 && !profId) setProfId(shopProf[0].id);
            if (shopClients.length > 0 && !clientId) setClientId(shopClients[0].id);
            if (shopServices.length > 0 && !serviceId) setServiceId(shopServices[0].id);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-[#8c6239] to-[#634427] hover:from-[#9c6f42] hover:to-[#734f2d] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Horário</span>
        </button>
      </div>

      {/* Filtros */}
      {!isProf && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedProfId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedProfId === 'all' 
                ? 'bg-[#2a1f18] text-[#d4af37] border border-[#523d2f]' 
                : 'bg-[#141110] text-[#a38a7a] hover:text-white border border-[#2a1f18]'
            }`}
          >
            Todos os Profissionais ({shopAppts.length})
          </button>
          
          {shopProf.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProfId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                selectedProfId === p.id 
                  ? 'bg-[#2a1f18] text-[#d4af37] border border-[#523d2f]' 
                  : 'bg-[#141110] text-[#a38a7a] hover:text-white border border-[#2a1f18]'
              }`}
            >
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Lista de Agendamentos */}
      <div className="space-y-3">
        {filteredAppts.map((appt) => {
          const prof = shopProf.find(p => p.id === appt.professionalId);
          const dt = new Date(appt.dateTime);
          const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div 
              key={appt.id} 
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                appt.status === 'completed' 
                  ? 'bg-[#141110] border-[#2a1f18] opacity-80' 
                  : appt.status === 'canceled'
                  ? 'bg-[#141110]/40 border-red-950/40 opacity-40'
                  : 'bg-[#1b1614] border-[#33251d] shadow-md'
              }`}
            >
              {/* Info Esquerda */}
              <div className="flex items-start gap-4">
                <div className="bg-[#2a1f18] px-3 py-2 rounded-xl border border-[#4a3525] text-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37] mx-auto mb-1" />
                  <p className="text-xs font-black text-white">{timeStr}</p>
                  <span className="text-[9px] text-[#a38a7a] block">{dateStr}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">{appt.serviceName}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      appt.status === 'canceled' ? 'bg-red-500/10 text-red-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {appt.status === 'completed' ? 'Concluído' : appt.status === 'canceled' ? 'Cancelado' : 'Agendado'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#a38a7a]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#8c6239]" />
                      Cliente: <strong className="text-[#e8dbd3]">{appt.clientName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-[#8c6239]" />
                      Barbeiro: <strong className="text-[#bfada3]">{prof?.name}</strong>
                    </span>
                  </div>

                  <div className="mt-2 text-[11px]">
                    <span className="text-[#a38a7a]">Valor: </span>
                    <strong className="text-white">{formatCurrency(appt.price)}</strong>
                    <span className="text-[#a38a7a] ml-3">Comissão: </span>
                    <strong className="text-emerald-400">{formatCurrency(appt.commissionValue)}</strong>
                  </div>
                </div>
              </div>

              {/* Ações / Status à direita */}
              <div className="flex items-center gap-2 justify-end pt-2 border-t border-[#2a1f18] md:pt-0 md:border-t-0 shrink-0">
                {!appt.paid && appt.status === 'scheduled' && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold">
                    Pendente de Pagamento
                  </span>
                )}

                {appt.paid && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold">
                    Pago
                  </span>
                )}

                {appt.status === 'scheduled' && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onBeginFinalizeAppointment(appt.id)}
                      title="Marcar Concluído e Pago"
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Finalizar</span>
                    </button>
                    
                    <button
                      onClick={() => onCancelAppointment(appt.id)}
                      title="Cancelar"
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredAppts.length === 0 && (
          <div className="text-center py-12 bg-[#141110] rounded-2xl border border-[#2a1f18]">
            <p className="text-xs text-[#a38a7a]">Nenhum agendamento encontrado para este filtro.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO DE AGENDAMENTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#2a1f18] flex items-center justify-between bg-gradient-to-b from-[#1b1614] to-transparent">
              <h3 className="text-base font-bold text-white">Agendar Horário / Lançar Serviço</h3>
              <button onClick={() => setShowModal(false)} className="text-[#a38a7a] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Selecione o Profissional *</label>
                <select
                  value={profId}
                  onChange={(e) => setProfId(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                >
                  {shopProf.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Selecione o Serviço *</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                >
                  {shopServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Selecione o Cliente *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                >
                  {shopClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {shopClients.length === 0 && (
                  <p className="text-[10px] text-red-400 mt-1">Atenção: Cadastre clientes na aba de Clientes para poder agendar.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Horário *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#8c6239]"
                  />
                  <span className="text-xs font-bold text-white">Serviço já está Pago no Caixa</span>
                </label>
                <p className="text-[10px] text-[#a38a7a] ml-6 mt-0.5">
                  Se marcado, o valor é contabilizado na hora no Caixa do Dia aberto.
                </p>
              </div>

              {paid && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Forma de pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-[#2a1f18] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#a38a7a]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#8c6239] hover:bg-[#734f2d] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
                  disabled={shopClients.length === 0}
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
