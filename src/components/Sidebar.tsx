import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  LogOut, 
  Building2,
  Bell
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userType: 'admin' | 'professional' | null;
  onLogout: () => void;
  barbershopName: string;
  userName: string;
  avatarUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  userType,
  onLogout,
  barbershopName,
  userName,
  avatarUrl
}) => {
  const adminItems = [
    { id: 'dashboard', label: 'Painel & Caixa', icon: LayoutDashboard },
    { id: 'schedule', label: 'Agendamentos', icon: Calendar },
    { id: 'professionals', label: 'Profissionais', icon: Users },
    { id: 'services', label: 'Serviços & Produtos', icon: Scissors },
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'finance', label: 'Financeiro & Relatórios', icon: DollarSign },
    { id: 'marketing', label: 'Marketing IA', icon: Sparkles },
    { id: 'notifications', label: 'Logs de Notificações', icon: Bell },
  ];

  const profItems = [
    { id: 'dashboard', label: 'Meu Resumo', icon: LayoutDashboard },
    { id: 'schedule', label: 'Minha Agenda', icon: Calendar },
    { id: 'services', label: 'Tabela de Preços', icon: Scissors },
    { id: 'finance', label: 'Minhas Comissões', icon: DollarSign },
    { id: 'marketing', label: 'Sugestões IA', icon: Sparkles },
  ];

  const items = userType === 'admin' ? adminItems : profItems;

  return (
    <aside className="w-64 bg-[#141110] border-r border-[#2a1f18] flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2a1f18] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8c6239] to-[#d4af37] flex items-center justify-center font-bold text-black text-lg shadow-md">
          NF
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-white tracking-wide truncate">NF Barber</h1>
          <p className="text-xs text-[#a38a7a] truncate font-medium">{barbershopName}</p>
        </div>
      </div>

      {/* User Info Badge */}
      <div className="p-4 mx-3 my-3 bg-[#1e1917] rounded-xl border border-[#33251d] flex items-center gap-3">
        <img 
          src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
          alt="Avatar" 
          className="w-10 h-10 rounded-lg object-cover border border-[#8c6239]"
        />
        <div className="overflow-hidden">
          <p className="text-xs text-[#8c6239] uppercase font-bold tracking-wider">
            {userType === 'admin' ? 'Acesso Admin' : 'Profissional'}
          </p>
          <p className="text-sm font-semibold text-white truncate">{userName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#8c6239] to-[#634427] text-white shadow-lg shadow-[#8c6239]/20 font-semibold' 
                  : 'text-[#bfada3] hover:bg-[#1e1917] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8c6239]'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-[#2a1f18]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#d9534f] hover:bg-[#d9534f]/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
};
