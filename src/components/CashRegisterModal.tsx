import React, { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { CashRegister } from '../types';
import { PAYMENT_METHODS } from '../services/db';

interface CashRegisterModalProps {
  currentRegister: CashRegister | null;
  onOpenRegister: (openingBalance: number) => void;
  onCloseRegister: (closingBalance: number, notes?: string) => void;
  onCancel: () => void;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
  currentRegister,
  onOpenRegister,
  onCloseRegister,
  onCancel
}) => {
  const isOpen = currentRegister?.status === 'open';

  // Formulário abertura
  const [openingVal, setOpeningVal] = useState('150');

  // Formulário fechamento
  const [closingNotes, setClosingNotes] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(openingVal) || 0;
    onOpenRegister(val);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRegister) return;
    // O fechamento assume o valor acumulado em tempo real
    onCloseRegister(currentRegister.currentCalculatedTotal, closingNotes);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2a1f18] flex items-center justify-between bg-gradient-to-b from-[#1b1614] to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOpen ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isOpen ? 'Fechamento de Caixa Diário' : 'Abertura de Caixa Diário'}
              </h3>
              <p className="text-xs text-[#a38a7a]">
                {isOpen ? 'Consolidação das transações de hoje' : 'Informe o fundo inicial em gaveta'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-[#a38a7a] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODO ABRIR CAIXA */}
        {!isOpen && (
          <form onSubmit={handleOpenSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Valor de Fundo Inicial (Troco em Caixa) *</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xs font-bold text-[#8c6239]">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={openingVal}
                  onChange={(e) => setOpeningVal(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl pl-10 pr-4 py-2.5 text-sm font-black text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>
              <p className="text-[10px] text-[#a38a7a] mt-1.5">
                O valor preenchido de abertura será a base em que as vendas concluídas de serviços e produtos lançados no dia irão se acumular.
              </p>
            </div>

            <div className="p-3 bg-[#1b1614] rounded-xl border border-[#33251d] flex items-center gap-2 text-[11px] text-[#bfada3]">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>O sistema ativará o cálculo dinâmico instantâneo para os colaboradores.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xl transition-all mt-4"
            >
              Confirmar Abertura de Caixa
            </button>
          </form>
        )}

        {/* MODO FECHAR CAIXA */}
        {isOpen && currentRegister && (
          <form onSubmit={handleCloseSubmit} className="p-6 space-y-4">
            <div className="bg-[#1b1614] border border-[#33251d] p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-[#a38a7a]">
                <span>Saldo Inicial Declarado:</span>
                <span className="font-bold text-white">{formatCurrency(currentRegister.openingBalance)}</span>
              </div>
              
              <div className="flex justify-between items-center text-[#a38a7a]">
                <span>Lançamentos / Faturamento do Dia:</span>
                <span className="font-bold text-emerald-400">
                  +{formatCurrency(currentRegister.currentCalculatedTotal - currentRegister.openingBalance)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#2a1f18] flex justify-between items-center">
                <span className="font-bold text-[#d4af37] uppercase text-[10px]">Total Consolidado Automático:</span>
                <span className="text-base font-black text-[#d4af37]">
                  {formatCurrency(currentRegister.currentCalculatedTotal)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#2a1f18] space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-[#a38a7a]">Pagamentos por forma</p>
                {PAYMENT_METHODS.map(method => (
                  <div key={method.value} className="flex justify-between text-[11px]">
                    <span className="text-[#a38a7a]">{method.label}</span>
                    <span className="font-bold text-white">
                      {formatCurrency(currentRegister.paymentBreakdown?.[method.value] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Observações do Fechamento (Opcional)</label>
              <textarea
                placeholder="Valores checados, gaveta conferida perfeitamente..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#8c6239] resize-none"
              />
            </div>

            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Ao fechar o caixa, o saldo final consolida nos relatórios semanais. Para reabrir, inicie um novo turno.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2a1f18] hover:bg-[#382b22] text-[#d4af37] border border-[#523d2f] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xl transition-all mt-4"
            >
              Consolidar e Fechar Caixa Diário
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
