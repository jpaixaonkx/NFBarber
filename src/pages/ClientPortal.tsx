import React, { useMemo, useState } from 'react';
import { CalendarClock, Clock3, LogOut, Send, Sparkles, UserRound } from 'lucide-react';
import { Appointment, Barbershop, Client, Professional, Service } from '../types';

interface ClientPortalProps {
  barbershop: Barbershop;
  client: Client;
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[];
  onLogout: () => void;
  onRequestAppointment: (data: {
    professionalId: string;
    serviceId: string;
    dateTime: string;
  }) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  barbershop,
  client,
  appointments,
  services,
  professionals,
  onLogout,
  onRequestAppointment
}) => {
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');

  const myAppointments = useMemo(() => {
    return appointments
      .filter(a => a.clientId === client.id && a.barbershopId === barbershop.id)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [appointments, barbershop.id, client.id]);

  const upcoming = myAppointments.filter(a => a.status === 'scheduled');
  const completed = myAppointments.filter(a => a.status === 'completed');

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !professionalId) return;
    onRequestAppointment({
      professionalId,
      serviceId,
      dateTime: new Date(`${date}T${time}:00`).toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between gap-4 border border-[#2a1f18] bg-[#141110] rounded-3xl p-5 md:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8c6239] font-bold">Acesso do Cliente</p>
            <h1 className="text-2xl md:text-3xl font-black mt-1">{client.name}</h1>
            <p className="text-xs md:text-sm text-[#a38a7a] mt-1">
              {barbershop.name} - sua agenda e solicitações em um só lugar.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e1917] border border-[#33251d] text-xs font-bold text-[#e8dbd3] hover:bg-[#2a1f18]"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <div className="lg:col-span-2 space-y-5">
            <section className="bg-[#141110] border border-[#2a1f18] rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-[#d4af37]" />
                <h2 className="text-lg font-bold">Minha Agenda</h2>
              </div>

              <div className="space-y-3">
                {myAppointments.map(appt => {
                  const dt = new Date(appt.dateTime);
                  const day = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const hour = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const service = services.find(s => s.id === appt.serviceId);
                  const prof = professionals.find(p => p.id === appt.professionalId);

                  return (
                    <div key={appt.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#1b1614] border border-[#2a1f18] p-4">
                      <div>
                        <p className="text-sm font-bold text-white">{appt.serviceName || service?.name}</p>
                        <p className="text-xs text-[#a38a7a] mt-1">
                          {day} - {hour} - {prof?.name || 'Profissional'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[#d4af37]">{formatCurrency(appt.price)}</p>
                        <p className={`text-[10px] uppercase font-bold mt-1 ${appt.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {appt.status === 'completed' ? 'Concluido' : 'Agendado'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {myAppointments.length === 0 && (
                  <div className="rounded-2xl bg-[#1b1614] border border-dashed border-[#33251d] p-6 text-sm text-[#a38a7a]">
                    Você ainda não possui agendamentos nesta barbearia.
                  </div>
                )}
              </div>
            </section>

            <section className="bg-[#141110] border border-[#2a1f18] rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                <h2 className="text-lg font-bold">Solicitar Novo Horário</h2>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a38a7a] font-bold mb-1">Serviço</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-3 text-sm text-white"
                    required
                  >
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name} - {formatCurrency(service.price)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a38a7a] font-bold mb-1">Profissional</label>
                  <select
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-3 text-sm text-white"
                    required
                  >
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a38a7a] font-bold mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-3 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a38a7a] font-bold mb-1">Horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-3 text-sm text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#8c6239] to-[#d4af37] text-black font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar solicitação para a barbearia
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="bg-[#141110] border border-[#2a1f18] rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserRound className="w-5 h-5 text-[#d4af37]" />
                <h2 className="text-lg font-bold">Meu Perfil</h2>
              </div>
              <div className="space-y-2 text-sm text-[#bfada3]">
                <p><span className="text-[#a38a7a]">E-mail:</span> {client.email || '-'}</p>
                <p><span className="text-[#a38a7a]">Telefone:</span> {client.phone}</p>
                <p><span className="text-[#a38a7a]">Visitas:</span> {client.visitsCount}</p>
                <p><span className="text-[#a38a7a]">Concluídos:</span> {completed.length}</p>
                <p><span className="text-[#a38a7a]">Agendados:</span> {upcoming.length}</p>
              </div>
            </section>

            <section className="bg-[#141110] border border-[#2a1f18] rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock3 className="w-5 h-5 text-[#d4af37]" />
                <h2 className="text-lg font-bold">Resumo Rápido</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#1b1614] border border-[#2a1f18] p-4">
                  <p className="text-[10px] uppercase text-[#a38a7a] font-bold">Em aberto</p>
                  <p className="text-2xl font-black mt-1 text-white">{upcoming.length}</p>
                </div>
                <div className="rounded-2xl bg-[#1b1614] border border-[#2a1f18] p-4">
                  <p className="text-[10px] uppercase text-[#a38a7a] font-bold">Concluidos</p>
                  <p className="text-2xl font-black mt-1 text-[#d4af37]">{completed.length}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};