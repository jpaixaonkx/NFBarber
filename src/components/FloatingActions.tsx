import React, { useState } from 'react';
import { Plus, Scissors, ShoppingBag, X } from 'lucide-react';

interface FloatingActionsProps {
  onNewAppointment: () => void;
  onNewSale: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onNewAppointment,
  onNewSale,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Opções expandidas */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 animate-fade-in">
          <button
            onClick={() => {
              setIsOpen(false);
              onNewAppointment();
            }}
            className="flex items-center gap-3 bg-[#1e1917] hover:bg-[#2e231d] border border-[#523d2f] text-white px-4 py-2.5 rounded-xl shadow-xl transition-all duration-200 text-xs font-bold"
          >
            <span>Lançar Serviço / Agendar</span>
            <div className="w-7 h-7 rounded-lg bg-[#8c6239] flex items-center justify-center text-white">
              <Scissors className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onNewSale();
            }}
            className="flex items-center gap-3 bg-[#1e1917] hover:bg-[#2e231d] border border-[#523d2f] text-white px-4 py-2.5 rounded-xl shadow-xl transition-all duration-200 text-xs font-bold"
          >
            <span>Vender Produto</span>
            <div className="w-7 h-7 rounded-lg bg-[#8c6239] flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </button>

        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-[#2a1f18] text-white rotate-90 border border-[#523d2f]' 
            : 'bg-gradient-to-tr from-[#8c6239] via-[#634427] to-[#d4af37] text-white hover:scale-105'
        }`}
        title="Ações Rápidas"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
      </button>
    </div>
  );
};
