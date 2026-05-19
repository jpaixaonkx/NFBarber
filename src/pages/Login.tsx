import React, { useRef, useState } from 'react';
import { Scissors, Building2, UserCheck, ShieldAlert } from 'lucide-react';
import { Barbershop, Professional, Client } from '../types';

interface LoginProps {
  barbershops: Barbershop[];
  professionals: Professional[];
  clients: Client[];
  onLoginAdmin: (barbershopId: string) => void;
  onLoginProfessional: (barbershopId: string, professionalId: string) => void;
  onLoginClient: (barbershopId: string, clientId: string) => void;
  onRegisterClient: (data: {
    barbershopId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => void;
  onRegisterBarbershop: (data: {
    name: string;
    cnpj: string;
    password: string;
    email: string;
    phone: string;
    avatarUrl: string;
  }) => void;
}

export const Login: React.FC<LoginProps> = ({
  barbershops,
  professionals,
  clients,
  onLoginAdmin,
  onLoginProfessional,
  onLoginClient,
  onRegisterClient,
  onRegisterBarbershop
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'professional' | 'client' | 'register'>('admin');
  const [clientMode, setClientMode] = useState<'login' | 'register'>('login');
  
  // States Admin Login
  const [adminCnpj, setAdminCnpj] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // States Professional Login
  const [profIdentifier, setProfIdentifier] = useState('');

  // States Client Login
  const [clientIdentifier, setClientIdentifier] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientBarbershopId, setClientBarbershopId] = useState(barbershops[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientRegisterPassword, setClientRegisterPassword] = useState('');

  // States Register
  const [regName, setRegName] = useState('');
  const [regCnpj, setRegCnpj] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanInput = adminCnpj.replace(/\D/g, '');
    const found = barbershops.find(b => b.cnpj.replace(/\D/g, '') === cleanInput || b.cnpj === adminCnpj);
    
    if (found) {
      if (found.password === adminPassword) {
        onLoginAdmin(found.id);
      } else {
        setErrorMsg('Senha inválida. Verifique as credenciais cadastradas da sua barbearia.');
      }
    } else {
      setErrorMsg('CNPJ não encontrado. Cadastre sua barbearia para criar um novo acesso.');
    }
  };

  const handleProfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const s = profIdentifier.trim().toLowerCase();
    const found = professionals.find(
      p => p.email.toLowerCase() === s || p.cpfOrCnpj.replace(/\D/g, '') === s.replace(/\D/g, '')
    );

    if (found) {
      onLoginProfessional(found.barbershopId, found.id);
    } else {
      setErrorMsg('E-mail ou CPF do profissional não encontrado. Verifique com o dono da barbearia se o seu cadastro foi efetuado.');
    }
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const s = clientIdentifier.trim().toLowerCase();
    const found = clients.find(
      c => (c.email.toLowerCase() === s || c.phone.replace(/\D/g, '') === s.replace(/\D/g, '')) && c.password === clientPassword
    );

    if (found) {
      onLoginClient(found.barbershopId, found.id);
    } else {
      setErrorMsg('Cliente não encontrado ou senha inválida.');
    }
  };

  const handleClientRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!clientBarbershopId) {
      setErrorMsg('Selecione a barbearia onde deseja se cadastrar.');
      return;
    }
    if (!clientName || !clientEmail || !clientPhone || !clientRegisterPassword) {
      setErrorMsg('Preencha nome, e-mail, número e senha do cliente.');
      return;
    }

    onRegisterClient({
      barbershopId: clientBarbershopId,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      password: clientRegisterPassword
    });

    setClientMode('login');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName || !regCnpj || !regEmail) {
      setErrorMsg('Preencha os campos obrigatórios (Nome, CNPJ, Senha e E-mail).');
      return;
    }

    if (!regPassword) {
      setErrorMsg('Defina uma senha de acesso para a barbearia.');
      return;
    }

    onRegisterBarbershop({
      name: regName,
      cnpj: regCnpj,
      password: regPassword,
      email: regEmail,
      phone: regPhone || '(11) 99999-9999',
      avatarUrl: regAvatar || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80'
    });
  };

  const handleAvatarFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Envie apenas uma imagem para a foto de perfil da barbearia.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRegAvatar(String(reader.result || ''));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0d0b0a] flex items-center justify-center p-4">
      {/* Decoração e fundo de ambiente */}
      <div className="absolute inset-0 bg-radial-at-t from-[#2a1b12]/30 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-[#141110] border border-[#2a1f18] rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center border-b border-[#2a1f18] bg-gradient-to-b from-[#1b1614] to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8c6239] via-[#634427] to-[#d4af37] flex items-center justify-center font-extrabold text-black text-2xl mx-auto shadow-xl mb-4">
            NF
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">NF Barber</h1>
          <p className="text-xs text-[#a38a7a] mt-1 font-medium">
            Gestão Administrativa & Multi-Barbearias
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#2a1f18] bg-[#0d0b0a]">
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`py-3 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'admin' 
                ? 'bg-[#141110] text-[#d4af37] border-b-2 border-[#d4af37]' 
                : 'text-[#8c6239] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresa</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('professional'); setErrorMsg(''); }}
            className={`py-3 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'professional' 
                ? 'bg-[#141110] text-[#d4af37] border-b-2 border-[#d4af37]' 
                : 'text-[#8c6239] hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profissional</span>
          </button>

          <button
            onClick={() => { setActiveTab('client'); setErrorMsg(''); }}
            className={`py-3 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'client'
                ? 'bg-[#141110] text-[#d4af37] border-b-2 border-[#d4af37]'
                : 'text-[#8c6239] hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Cliente</span>
          </button>

          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-3 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'register' 
                ? 'bg-[#141110] text-[#d4af37] border-b-2 border-[#d4af37]' 
                : 'text-[#8c6239] hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Cadastrar</span>
          </button>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 bg-[#d9534f]/10 border border-[#d9534f]/30 p-3 rounded-xl flex items-start gap-3 text-[#d9534f]">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* ABA ADMIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">CNPJ da Barbearia</label>
                <input
                  type="text"
                  placeholder="Ex: 12.345.678/0001-90"
                  value={adminCnpj}
                  onChange={(e) => setAdminCnpj(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Senha de Acesso</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#8c6239] to-[#634427] hover:from-[#9c6f42] hover:to-[#734f2d] text-white font-bold py-3.5 rounded-xl text-sm shadow-xl transition-all mt-6"
              >
                Acessar Gestão da Empresa
              </button>

            </form>
          )}

          {/* ABA PROFISSIONAL */}
          {activeTab === 'professional' && (
            <form onSubmit={handleProfSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Seu E-mail ou CPF</label>
                <input
                  type="text"
                  placeholder="Ex: bruno@nfbarber.com"
                  value={profIdentifier}
                  onChange={(e) => setProfIdentifier(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                  required
                />
                <p className="text-[10px] text-[#8c6239] mt-1.5">
                  O sistema redireciona você automaticamente para a Barbearia onde está cadastrado.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#8c6239] hover:opacity-90 text-black font-bold py-3.5 rounded-xl text-sm shadow-xl transition-all mt-6"
              >
                Entrar no Meu Painel de Barbeiro
              </button>

            </form>
          )}

          {/* ABA CLIENTE */}
          {activeTab === 'client' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex gap-2 p-1 bg-[#1b1614] border border-[#33251d] rounded-xl">
                <button
                  type="button"
                  onClick={() => setClientMode('login')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${clientMode === 'login' ? 'bg-[#8c6239] text-white' : 'text-[#a38a7a]'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('register')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${clientMode === 'register' ? 'bg-[#8c6239] text-white' : 'text-[#a38a7a]'}`}
                >
                  Cadastrar
                </button>
              </div>

              {clientMode === 'login' ? (
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">E-mail ou Telefone</label>
                    <input
                      type="text"
                      placeholder="Ex: cliente@exemplo.com ou (11) 99999-9999"
                      value={clientIdentifier}
                      onChange={(e) => setClientIdentifier(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                    <p className="text-[10px] text-[#8c6239] mt-1.5">
                      Entre com os dados cadastrados pelo cliente.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#8c6239] hover:opacity-90 text-black font-bold py-3.5 rounded-xl text-sm shadow-xl transition-all mt-6"
                  >
                    Entrar como Cliente
                  </button>
                </form>
              ) : (
                <form onSubmit={handleClientRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Barbearia</label>
                    <select
                      value={clientBarbershopId}
                      onChange={(e) => setClientBarbershopId(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    >
                      <option value="">Selecione a barbearia</option>
                      {barbershops.map(b => (
                        <option key={b.id} value={b.id}>{b.name} - {b.cnpj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">E-mail</label>
                    <input
                      type="email"
                      placeholder="cliente@exemplo.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Número</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Senha</label>
                    <input
                      type="password"
                      placeholder="Crie uma senha"
                      value={clientRegisterPassword}
                      onChange={(e) => setClientRegisterPassword(e.target.value)}
                      className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8c6239] transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-xl transition-all mt-4"
                  >
                    Cadastrar Cliente
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ABA REGISTRO */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fade-in max-h-[350px] overflow-y-auto pr-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Nome da Barbearia *</label>
                <input
                  type="text"
                  placeholder="Ex: NF Barber Vintage"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">CNPJ (Login) *</label>
                <input
                  type="text"
                  placeholder="Ex: 44.555.666/0001-00"
                  value={regCnpj}
                  onChange={(e) => setRegCnpj(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  placeholder="Crie a senha da sua barbearia"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">E-mail de Contato *</label>
                <input
                  type="email"
                  placeholder="contato@barbearia.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-8888"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Foto de Perfil da Barbearia</label>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
                  onDragLeave={() => setIsDraggingAvatar(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingAvatar(false);
                    handleAvatarFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-colors ${
                    isDraggingAvatar
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-[#33251d] bg-[#1b1614] hover:border-[#8c6239]'
                  }`}
                >
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                  />

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0d0b0a] border border-[#2a1f18] shrink-0 flex items-center justify-center">
                      {regAvatar ? (
                        <img src={regAvatar} alt="Preview da barbearia" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-black text-[#8c6239] text-center px-2">NF</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">Arraste e solte a imagem aqui</p>
                      <p className="text-[10px] text-[#a38a7a] mt-1">ou clique para selecionar do seu dispositivo</p>
                      <p className="text-[9px] text-[#523d2f] mt-1">PNG, JPG ou JPEG. A imagem será usada como avatar da barbearia.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem (opcional)"
                    value={regAvatar}
                    onChange={(e) => setRegAvatar(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  />
                </div>
                <span className="text-[9px] text-gray-500 block mt-0.5">Se nada for enviado, uma imagem padrão moderna será usada.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs shadow-xl transition-all mt-4 uppercase tracking-wider"
              >
                Concluir Cadastro & Lançar no App
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-[#0d0b0a] border-t border-[#2a1f18] flex items-center justify-between text-[11px] text-[#a38a7a]">
          <span>Design Moderno & Flutuante</span>
          <span className="font-bold text-[#d4af37]">Versão 1.0</span>
        </div>
      </div>
    </div>
  );
};
