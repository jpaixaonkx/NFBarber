import React, { useState } from 'react';
import { UserPlus, Search, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { Client } from '../types';

interface ClientsProps {
  clients: Client[];
  currentBarbershopId: string;
  onAddClient: (data: { name: string; phone: string; email: string; password: string }) => void;
}

export const Clients: React.FC<ClientsProps> = ({
  clients,
  currentBarbershopId,
  onAddClient
}) => {
  const shopClients = clients.filter(c => c.barbershopId === currentBarbershopId);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const filtered = shopClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    onAddClient({ name, phone, email, password: password || phone.replace(/\D/g, '').slice(-4) || '1234' });
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#8c6239]" />
            <span>Gestão de Clientes Cadastrados</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">
            Cadastre os frequentadores para associá-los a agendamentos e fidelidade.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#8c6239] to-[#634427] hover:from-[#9c6f42] hover:to-[#734f2d] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-[#141110] border border-[#2a1f18] p-2 rounded-xl flex items-center gap-3">
        <Search className="w-4 h-4 text-[#8c6239] ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Buscar cliente por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white focus:outline-none py-1.5 pr-2"
        />
      </div>

      {/* Grade de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((client) => (
          <div 
            key={client.id} 
            className="bg-[#141110] border border-[#2a1f18] hover:border-[#4a3525] p-5 rounded-2xl transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{client.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#d4af37] font-semibold">
                    <span>Fidelidade: {client.visitsCount} visitas</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#1b1614] border border-[#33251d] text-[#8c6239] flex items-center justify-center font-bold text-xs">
                  {client.name.charAt(0)}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 pt-3 border-t border-[#1e1917] text-xs text-[#a38a7a]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8c6239]" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-[#1e1917] text-right">
              <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Ativo no Sistema</span>
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#141110] rounded-2xl border border-[#2a1f18]">
            <p className="text-xs text-[#a38a7a]">Nenhum cliente com este nome cadastrado.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#2a1f18] flex items-center justify-between bg-gradient-to-b from-[#1b1614] to-transparent">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-[#a38a7a] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  placeholder="(11) 99191-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="carlos@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Senha de acesso</label>
                <input
                  type="password"
                  placeholder="Opcional: crie a senha do cliente"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                />
              </div>

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
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
