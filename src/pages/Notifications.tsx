import React from 'react';
import { Bell, MessageSquare, Mail, CheckCircle2 } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationsProps {
  logs: NotificationLog[];
  currentBarbershopId: string;
}

export const Notifications: React.FC<NotificationsProps> = ({
  logs,
  currentBarbershopId
}) => {
  const shopLogs = logs.filter(l => l.barbershopId === currentBarbershopId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#8c6239]" />
          <span>Auditoria de Disparos (WhatsApp & E-mail)</span>
        </h2>
        <p className="text-xs text-[#a38a7a] mt-0.5">
          Verifique as notificações integradas automaticamente para profissionais e comissões.
        </p>
      </div>

      <div className="bg-[#141110] border border-[#2a1f18] rounded-2xl overflow-hidden">
        <div className="p-4 bg-[#1b1614] border-b border-[#2a1f18] flex items-center justify-between text-xs text-[#a38a7a]">
          <span>Histórico do Gateway de Mensagens</span>
          <span>{shopLogs.length} envios registrados</span>
        </div>

        <div className="divide-y divide-[#1e1917]">
          {shopLogs.map((log) => {
            const isWpp = log.type === 'whatsapp';
            const dt = new Date(log.sentAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-[#1b1614]/30 transition-colors">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  isWpp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                }`}>
                  {isWpp ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isWpp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                    }`}>
                      {isWpp ? 'WhatsApp API' : 'SMTP E-mail'}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{log.recipientName}</span>
                    <span className="text-[10px] text-[#a38a7a] truncate font-mono">({log.recipient})</span>
                  </div>

                  <p className="text-xs text-[#e8dbd3] mt-2 whitespace-pre-line leading-relaxed bg-[#1b1614]/50 p-2.5 rounded-lg border border-[#2a1f18]">
                    {log.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-[#a38a7a]">
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Entregue
                    </span>
                    <span>•</span>
                    <span>Disparado em {dt}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {shopLogs.length === 0 && (
            <div className="p-12 text-center text-[#a38a7a] text-xs">
              Nenhuma notificação na fila ou enviada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
