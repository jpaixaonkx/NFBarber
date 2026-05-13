import React from 'react';
import { Wallet, Database } from 'lucide-react';
import { CashRegister } from '../types';

interface HeaderProps {
  currentCashRegister: CashRegister | null;
  onOpenCashModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCashRegister,
  onOpenCashModal
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isOpen = currentCashRegister?.status === 'open';

  return (
    <header className="h-20 bg-[#141110]/80 backdrop-blur-md border-b border-[#2a1f18] px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Gestão Administrativa
            <span className="text-xs bg-[#2e231d] text-[#d4af37] border border-[#523d2f] px-2.5 py-0.5 rounded-full font-semibold uppercase">
              Pro
            </span>
          </h2>
          <p className="text-xs text-[#a38a7a]">
            Controle em tempo real de faturamento e comissões
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Supabase Status Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-[#1b1614] border border-[#2a1f18] px-3 py-1.5 rounded-lg text-xs text-[#a38a7a]">
          <Database className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Supabase DB: <strong className="text-emerald-400">Ativo</strong></span>
        </div>

        {/* Status do Caixa do Dia */}
        <div className="flex items-center gap-3 bg-[#1b1614] border border-[#2a1f18] p-1.5 pr-4 rounded-xl">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#a38a7a] tracking-wider">Caixa do Dia</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <p className="text-sm font-extrabold text-white">
              {isOpen ? formatCurrency(currentCashRegister.currentCalculatedTotal) : 'Fechado'}
            </p>
          </div>
        </div>

        {/* Botão de Controle de Caixa */}
        <button
          onClick={onOpenCashModal}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
            isOpen 
              ? 'bg-[#2a1f18] hover:bg-[#382b22] text-[#e8dbd3] border border-[#4a3525]' 
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
          }`}
        >
          {isOpen ? 'Fechar Caixa Diário' : 'Abrir Caixa'}
        </button>
      </div>
    </header>
  );
};
