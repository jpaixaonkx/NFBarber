import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import { PAYMENT_METHODS } from '../services/db';
import { PaymentMethod } from '../types';

interface PaymentMethodModalProps {
  title: string;
  description: string;
  defaultMethod?: PaymentMethod;
  onConfirm: (method: PaymentMethod) => void;
  onCancel: () => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  title,
  description,
  defaultMethod = 'pix',
  onConfirm,
  onCancel,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#141110] border border-[#2a1f18] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#2a1f18] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#d4af37] text-[10px] font-black uppercase tracking-[0.25em] mb-2">
              <CreditCard className="w-4 h-4" />
              Pagamento
            </div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-[#a38a7a] mt-1">{description}</p>
          </div>
          <button onClick={onCancel} className="text-[#a38a7a] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#a38a7a] mb-2">Forma de pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMethod(item.value)}
                  className={`px-3 py-3 rounded-xl border text-xs font-bold transition-colors ${
                    method === item.value
                      ? 'bg-[#8c6239] border-[#8c6239] text-white'
                      : 'bg-[#1b1614] border-[#33251d] text-[#bfada3] hover:border-[#8c6239]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-[#33251d] text-xs font-bold text-[#a38a7a] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(method)}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8c6239] to-[#d4af37] text-black text-xs font-black"
            >
              Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
