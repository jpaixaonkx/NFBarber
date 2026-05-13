import React, { useState } from 'react';
import { Users, Plus, UserPlus, Percent, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Professional } from '../types';

interface ProfessionalsProps {
  professionals: Professional[];
  currentBarbershopId: string;
  onAddProfessional: (data: {
    name: string;
    cpfOrCnpj: string;
    email: string;
    phone: string;
    defaultServiceCommission: number;
    defaultProductCommission: number;
    avatarUrl?: string;
  }) => void;
}

export const Professionals: React.FC<ProfessionalsProps> = ({
  professionals,
  currentBarbershopId,
  onAddProfessional
}) => {
  const shopProf = professionals.filter(p => p.barbershopId === currentBarbershopId);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cpfOrCnpj, setCpfOrCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCommission, setServiceCommission] = useState('50');
  const [productCommission, setProductCommission] = useState('10');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpfOrCnpj || !email) return;

    onAddProfessional({
      name,
      cpfOrCnpj,
      email,
      phone: phone || '(11) 98888-8888',
      defaultServiceCommission: parseFloat(serviceCommission) || 50,
      defaultProductCommission: parseFloat(productCommission) || 10,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    });

    // Reset fields
    setName('');
    setCpfOrCnpj('');
    setEmail('');
    setPhone('');
    setServiceCommission('50');
    setProductCommission('10');
    setAvatarUrl('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8c6239]" />
            <span>Gestão Individual de Funcionários</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">
            Cadastre os profissionais para login individual e relatórios separados de faturamento.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#8c6239] to-[#634427] hover:from-[#9c6f42] hover:to-[#734f2d] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Profissional</span>
        </button>
      </div>

      {/* Grid de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shopProf.map((prof) => (
          <div 
            key={prof.id} 
            className="bg-[#141110] border border-[#2a1f18] hover:border-[#4a3525] p-5 rounded-2xl transition-all shadow-md relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={prof.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={prof.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-[#8c6239]/50"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{prof.name}</h3>
                    <p className="text-[10px] text-[#8c6239] uppercase font-bold tracking-wider">Ativo • Barbearia</p>
                  </div>
                </div>

                <span className="bg-[#1b1614] border border-[#33251d] text-[#bfada3] text-[10px] px-2 py-1 rounded-md font-mono">
                  {prof.cpfOrCnpj}
                </span>
              </div>

              {/* Informações de contato */}
              <div className="mt-4 space-y-1.5 pt-3 border-t border-[#1e1917] text-xs text-[#a38a7a]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span className="truncate">{prof.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>{prof.phone}</span>
                </div>
              </div>
            </div>

            {/* Comissões de Serviços e Produtos */}
            <div className="mt-4 pt-3 border-t border-[#1e1917] grid grid-cols-2 gap-2 bg-[#1b1614] p-2.5 rounded-xl">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#a38a7a] block">Comissão Serviço</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-0.5">
                  {prof.defaultServiceCommission}%
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-[#a38a7a] block">Comissão Produto</span>
                <span className="text-xs font-black text-sky-400 flex items-center gap-0.5">
                  {prof.defaultProductCommission}%
                </span>
              </div>
            </div>

            {/* Nota de rodapé explicativa */}
            <div className="mt-2 text-[9px] text-[#8c6239]/80 text-center font-medium">
              Acesso configurado para faturamento individual
            </div>
          </div>
        ))}

        {shopProf.length === 0 && (
          <div className="col-span-full bg-[#141110] p-12 text-center rounded-2xl border border-[#2a1f18]">
            <p className="text-sm font-medium text-[#a38a7a]">Nenhum profissional cadastrado na sua barbearia.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs font-bold text-[#d4af37] underline"
            >
              Crie o primeiro acesso profissional agora
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO DE PROFISSIONAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#2a1f18] flex items-center justify-between bg-gradient-to-b from-[#1b1614] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8c6239]/10 text-[#8c6239] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Adicionar Novo Profissional</h3>
                  <p className="text-xs text-[#a38a7a]">Acesso restrito e faturamento individualizado</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#a38a7a] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    placeholder="Ex: Diego Navalha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    placeholder="Ex: 111.222.333-44"
                    value={cpfOrCnpj}
                    onChange={(e) => setCpfOrCnpj(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Número de Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 91111-2222"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">E-mail de Acesso (Login do Barbeiro) *</label>
                  <input
                    type="email"
                    placeholder="profissional@barbearia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                  <p className="text-[10px] text-[#8c6239] mt-0.5">O funcionário utilizará este e-mail para entrar e ser redirecionado para a barbearia.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Comissão de Serviços (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={serviceCommission}
                      onChange={(e) => setServiceCommission(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                      required
                    />
                    <Percent className="w-3.5 h-3.5 text-[#a38a7a] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Comissão de Produtos (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={productCommission}
                      onChange={(e) => setProductCommission(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                      required
                    />
                    <Percent className="w-3.5 h-3.5 text-[#a38a7a] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Foto de Perfil (URL Opcional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#1e1917] rounded-xl border border-[#33251d] flex items-center gap-2 mt-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span className="text-[10px] text-[#bfada3]">O envio de notificação simulada de boas-vindas com e-mail/WhatsApp é gerado no cadastro.</span>
              </div>

              <div className="pt-4 border-t border-[#2a1f18] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#a38a7a] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#8c6239] hover:bg-[#734f2d] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Cadastrar Barbeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
