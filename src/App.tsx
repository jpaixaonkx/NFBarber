import { useState, useEffect } from 'react';
import { loadDB, saveDB, triggerNotification, recalculateCurrentCashRegister, getWeeklyReportData } from './services/db';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FloatingActions } from './components/FloatingActions';
import { CashRegisterModal } from './components/CashRegisterModal';

// Páginas
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Professionals } from './pages/Professionals';
import { ServicesProducts } from './pages/ServicesProducts';
import { Schedule } from './pages/Schedule';
import { Clients } from './pages/Clients';
import { MarketingAI } from './pages/MarketingAI';
import { Finance } from './pages/Finance';
import { Notifications } from './pages/Notifications';
import { ClientPortal } from './pages/ClientPortal';
import { PaymentMethodModal } from './components/PaymentMethodModal';
import { PaymentMethod } from './types';
import { createEmptyPaymentSummary } from './services/db';
import { LogOut } from 'lucide-react';

export function App() {
  const [dbState, setDbState] = useState(() => loadDB());
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Modais globais
  const [showCashModal, setShowCashModal] = useState(false);
  const [quickSaleModal, setQuickSaleModal] = useState<'appointment' | 'product' | null>(null);
  const [paymentModal, setPaymentModal] = useState<null | { kind: 'appointment'; appointmentId: string }>(null);
  const [quickSalePaymentMethod, setQuickSalePaymentMethod] = useState<PaymentMethod>('pix');

  // Sincronização reativa do banco simulado
  useEffect(() => {
    const handleStorageUpdate = () => {
      setDbState(loadDB());
    };
    window.addEventListener('nf_barber_db_update', handleStorageUpdate);
    return () => window.removeEventListener('nf_barber_db_update', handleStorageUpdate);
  }, []);

  // Update DB simplificado
  const updateState = (updater: (draft: typeof dbState) => void) => {
    const copy = JSON.parse(JSON.stringify(dbState));
    updater(copy);
    saveDB(copy);
    setDbState(copy);
  };

  // Identificação do contexto de usuário ativo
  const { currentUserId, currentUserType, currentBarbershopId } = dbState;
  const currentBarbershop = dbState.barbershops.find(b => b.id === currentBarbershopId);
  
  const currentProfessional = currentUserType === 'professional' 
    ? dbState.professionals.find(p => p.id === currentUserId) 
    : null;

  const currentClient = currentUserType === 'client'
    ? dbState.clients.find(c => c.id === currentUserId)
    : null;

  const managementUserType: 'admin' | 'professional' | null = currentUserType === 'client' ? null : currentUserType;

  const currentCashRegister = dbState.cashRegisters.find(
    cr => cr.barbershopId === currentBarbershopId && cr.status === 'open'
  ) || null;

  const weeklyReport = currentBarbershopId 
    ? getWeeklyReportData(dbState, currentBarbershopId)
    : { startDate: '', endDate: '', totalServices: 0, totalServicesValue: 0, totalProducts: 0, totalProductsValue: 0, commissionsPaid: 0, netBarbershopProfit: 0, paymentSummary: createEmptyPaymentSummary() };

  // HANDLERS AUTENTICAÇÃO
  const handleLoginAdmin = (bId: string) => {
    updateState(draft => {
      draft.currentUserId = bId;
      draft.currentUserType = 'admin';
      draft.currentBarbershopId = bId;
    });
    setCurrentTab('dashboard');
  };

  const handleLoginProfessional = (bId: string, pId: string) => {
    updateState(draft => {
      draft.currentUserId = pId;
      draft.currentUserType = 'professional';
      draft.currentBarbershopId = bId;
    });
    setCurrentTab('dashboard');
  };

  const handleLoginClient = (bId: string, cId: string) => {
    updateState(draft => {
      draft.currentUserId = cId;
      draft.currentUserType = 'client';
      draft.currentBarbershopId = bId;
    });
    setCurrentTab('dashboard');
  };

  const handleRegisterClient = (data: {
    barbershopId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const newId = 'c_' + Date.now();
    updateState(draft => {
      draft.clients.unshift({
        id: newId,
        barbershopId: data.barbershopId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        visitsCount: 0,
        createdAt: new Date().toISOString()
      });

      draft.currentUserId = newId;
      draft.currentUserType = 'client';
      draft.currentBarbershopId = data.barbershopId;

      const shop = draft.barbershops.find(b => b.id === data.barbershopId);
      if (shop) {
        draft.notificationLogs.unshift({
          id: 'n_' + Date.now(),
          barbershopId: data.barbershopId,
          type: 'email',
          recipient: data.email,
          recipientName: data.name,
          message: `Seu cadastro de cliente na ${shop.name} foi concluido com sucesso.`,
          sentAt: new Date().toISOString(),
          status: 'sent'
        });
      }
    });
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    updateState(draft => {
      draft.currentUserId = null;
      draft.currentUserType = null;
      draft.currentBarbershopId = null;
    });
    setCurrentTab('dashboard');
  };

  const handleRegisterBarbershop = (data: { name: string; cnpj: string; password: string; email: string; phone: string; avatarUrl: string }) => {
    const newId = 'b_' + Date.now();
    updateState(draft => {
      draft.barbershops.push({
        id: newId,
        name: data.name,
        cnpj: data.cnpj,
        password: data.password,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        createdAt: new Date().toISOString()
      });

      // Efetua login automático na nova barbearia
      draft.currentUserId = newId;
      draft.currentUserType = 'admin';
      draft.currentBarbershopId = newId;

      // Dispara log de notificação simulando boas-vindas
      draft.notificationLogs.unshift({
        id: 'n_' + Date.now(),
        barbershopId: newId,
        type: 'email',
        recipient: data.email,
        recipientName: data.name,
        message: `Parabéns pela decisão revolucionária! O ambiente de faturamento da ${data.name} foi criado no NF Barber com sucesso.`,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
    });
    setCurrentTab('dashboard');
  };

  // HANDLERS CAIXA DIÁRIO
  const handleOpenCashRegister = (openingBalance: number) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.cashRegisters.unshift({
        id: 'cr_' + Date.now(),
        barbershopId: currentBarbershopId,
        openedAt: new Date().toISOString(),
        openingBalance,
        currentCalculatedTotal: openingBalance,
        status: 'open'
      });
    });
    setShowCashModal(false);
  };

  const handleCloseCashRegister = (closingBalance: number, notes?: string) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      const cr = draft.cashRegisters.find(c => c.barbershopId === currentBarbershopId && c.status === 'open');
      if (cr) {
        cr.status = 'closed';
        cr.closedAt = new Date().toISOString();
        cr.closingBalance = closingBalance;
        cr.notes = notes || 'Fechamento de caixa concluído.';
      }
    });
    setShowCashModal(false);
  };

  // HANDLERS AGENDAMENTO / SERVIÇOS
  const handleAddAppointment = (data: {
    professionalId: string;
    clientId: string;
    serviceId: string;
    dateTime: string;
    paid: boolean;
    paymentMethod?: PaymentMethod;
  }) => {
    if (!currentBarbershopId) return;

    const serv = dbState.services.find(s => s.id === data.serviceId);
    const prof = dbState.professionals.find(p => p.id === data.professionalId);
    const cli = dbState.clients.find(c => c.id === data.clientId);
    if (!serv || !prof || !cli) return;

    // Cálculo exato de comissão customizada ou padrão
    const hasCustom = serv.customCommissions && serv.customCommissions[prof.id] !== undefined;
    const commPct = hasCustom ? serv.customCommissions![prof.id] : prof.defaultServiceCommission;
    const commVal = (serv.price * commPct) / 100;

    const newApptId = 'a_' + Date.now();

    updateState(draft => {
      draft.appointments.unshift({
        id: newApptId,
        barbershopId: currentBarbershopId,
        professionalId: data.professionalId,
        clientId: data.clientId,
        clientName: cli.name,
        serviceId: data.serviceId,
        serviceName: serv.name,
        price: serv.price,
        commissionValue: commVal,
        dateTime: data.dateTime,
        status: data.paid ? 'completed' : 'scheduled',
        paid: data.paid,
        paymentMethod: data.paid ? (data.paymentMethod || 'cash') : undefined
      });

      // Atualiza contagem de visitas do cliente se já finalizado
      if (data.paid) {
        const clientRef = draft.clients.find(c => c.id === data.clientId);
        if (clientRef) clientRef.visitsCount += 1;
      }

      // Notificação Automática Imediata
      triggerNotification(
        draft, 
        currentBarbershopId, 
        data.professionalId, 
        data.paid ? 'Serviço Lançado e Concluído' : 'Novo Agendamento Confirmado', 
        `Serviço: ${serv.name}\nCliente: ${cli.name}\nValor: R$ ${serv.price.toFixed(2)}\nSua Comissão: R$ ${commVal.toFixed(2)} (${commPct}%)`
      );

      // Recalcula o caixa se foi pago
      if (data.paid) {
        recalculateCurrentCashRegister(draft, currentBarbershopId);
      }
    });

    setQuickSaleModal(null);
  };

  const handleUpdateStatus = (id: string, status: 'completed' | 'canceled', paid: boolean) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      const appt = draft.appointments.find(a => a.id === id);
      if (appt) {
        appt.status = status;
        appt.paid = paid;

        if (status === 'completed' && paid) {
          const clientRef = draft.clients.find(c => c.id === appt.clientId);
          if (clientRef) clientRef.visitsCount += 1;
          
          triggerNotification(
            draft, 
            currentBarbershopId, 
            appt.professionalId, 
            'Agendamento Finalizado com Sucesso', 
            `O serviço de ${appt.serviceName} do cliente ${appt.clientName || ''} foi pago no caixa. Comissão assegurada!`
          );
        }

        recalculateCurrentCashRegister(draft, currentBarbershopId);
      }
    });
  };

  const handleCancelAppointment = (id: string) => {
    handleUpdateStatus(id, 'canceled', false);
  };

  const handleBeginFinalizeAppointment = (appointmentId: string) => {
    setPaymentModal({ kind: 'appointment', appointmentId });
  };

  const handleFinalizeAppointmentWithMethod = (appointmentId: string, paymentMethod: PaymentMethod) => {
    if (!currentBarbershopId) return;

    updateState(draft => {
      const appt = draft.appointments.find(a => a.id === appointmentId);
      if (!appt) return;

      appt.status = 'completed';
      appt.paid = true;
      appt.paymentMethod = paymentMethod;

      const clientRef = draft.clients.find(c => c.id === appt.clientId);
      if (clientRef) clientRef.visitsCount += 1;

      triggerNotification(
        draft,
        currentBarbershopId,
        appt.professionalId,
        'Agendamento Finalizado com Sucesso',
        `O serviço de ${appt.serviceName} do cliente ${appt.clientName || ''} foi pago via ${paymentMethod}. Comissão assegurada!`
      );

      recalculateCurrentCashRegister(draft, currentBarbershopId);
    });

    setPaymentModal(null);
  };

  // HANDLERS VENDA DE PRODUTOS
  const handleAddProductSale = (productId: string, professionalId: string, paymentMethod: PaymentMethod = 'cash') => {
    if (!currentBarbershopId) return;

    const prod = dbState.products.find(p => p.id === productId);
    const prof = dbState.professionals.find(p => p.id === professionalId);
    if (!prod || !prof) return;

    // Diminui estoque
    if (prod.stock <= 0) {
      alert("Produto sem estoque disponível!");
      return;
    }

    const hasCustom = prod.customCommissions && prod.customCommissions[prof.id] !== undefined;
    const commPct = hasCustom ? prod.customCommissions![prof.id] : prof.defaultProductCommission;
    const commVal = (prod.price * commPct) / 100;

    updateState(draft => {
      const pRef = draft.products.find(p => p.id === productId);
      if (pRef) pRef.stock -= 1;

      draft.productSales.unshift({
        id: 'ps_' + Date.now(),
        barbershopId: currentBarbershopId,
        professionalId,
        productId,
        productName: prod.name,
        price: prod.price,
        commissionValue: commVal,
        dateTime: new Date().toISOString(),
        paymentMethod
      });

      triggerNotification(
        draft, 
        currentBarbershopId, 
        professionalId, 
        'Venda de Produto Computada', 
        `Item: ${prod.name}\nValor de Venda: R$ ${prod.price.toFixed(2)}\nComissão Recebida: R$ ${commVal.toFixed(2)}`
      );

      recalculateCurrentCashRegister(draft, currentBarbershopId);
    });

    setQuickSaleModal(null);
  };

  const handleClientRequestAppointment = (data: {
    professionalId: string;
    serviceId: string;
    dateTime: string;
  }) => {
    if (!currentBarbershopId || !currentClient) return;

    const serv = dbState.services.find(s => s.id === data.serviceId);
    const prof = dbState.professionals.find(p => p.id === data.professionalId);
    if (!serv || !prof) return;

    const hasCustom = serv.customCommissions && serv.customCommissions[prof.id] !== undefined;
    const commPct = hasCustom ? serv.customCommissions![prof.id] : prof.defaultServiceCommission;
    const commVal = (serv.price * commPct) / 100;

    updateState(draft => {
      draft.appointments.unshift({
        id: 'a_' + Date.now(),
        barbershopId: currentBarbershopId,
        professionalId: data.professionalId,
        clientId: currentClient.id,
        clientName: currentClient.name,
        serviceId: data.serviceId,
        serviceName: serv.name,
        price: serv.price,
        commissionValue: commVal,
        dateTime: data.dateTime,
        status: 'scheduled',
        paid: false,
        paymentMethod: undefined
      });

      triggerNotification(
        draft,
        currentBarbershopId,
        data.professionalId,
        'Novo Pedido de Agendamento do Cliente',
        `Cliente: ${currentClient.name}\nServiço: ${serv.name}\nData: ${new Date(data.dateTime).toLocaleString('pt-BR')}\nComissão Prevista: R$ ${commVal.toFixed(2)}`
      );
    });
  };

  // HANDLERS CADASTROS SECUNDÁRIOS
  const handleAddProfessional = (data: {
    name: string;
    cpfOrCnpj: string;
    email: string;
    phone: string;
    defaultServiceCommission: number;
    defaultProductCommission: number;
    avatarUrl?: string;
  }) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.professionals.push({
        id: 'p_' + Date.now(),
        barbershopId: currentBarbershopId,
        name: data.name,
        cpfOrCnpj: data.cpfOrCnpj,
        email: data.email,
        phone: data.phone,
        defaultServiceCommission: data.defaultServiceCommission,
        defaultProductCommission: data.defaultProductCommission,
        avatarUrl: data.avatarUrl,
        createdAt: new Date().toISOString()
      });

      // Dispara aviso pro-forma
      draft.notificationLogs.unshift({
        id: 'n_' + Date.now(),
        barbershopId: currentBarbershopId,
        type: 'whatsapp',
        recipient: data.phone,
        recipientName: data.name,
        message: `Seja bem-vindo ao time! Seu acesso individual no app NF Barber foi liberado sob o vínculo corporativo.`,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
    });
  };

  const handleAddService = (data: { name: string; price: number; durationMinutes: number; customCommissions: { [pId: string]: number } }) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.services.push({
        id: 's_' + Date.now(),
        barbershopId: currentBarbershopId,
        name: data.name,
        price: data.price,
        durationMinutes: data.durationMinutes,
        customCommissions: data.customCommissions
      });
    });
  };

  const handleAddProduct = (data: { name: string; price: number; stock: number; customCommissions: { [pId: string]: number } }) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.products.push({
        id: 'pr_' + Date.now(),
        barbershopId: currentBarbershopId,
        name: data.name,
        price: data.price,
        stock: data.stock,
        customCommissions: data.customCommissions
      });
    });
  };

  const handleAddClient = (data: { name: string; phone: string; email: string; password: string }) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.clients.unshift({
        id: 'c_' + Date.now(),
        barbershopId: currentBarbershopId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        visitsCount: 1,
        createdAt: new Date().toISOString()
      });
    });
  };

  const handlePublishPost = (data: { caption: string; suggestedImagePrompt: string; type: 'feed' | 'story' }) => {
    if (!currentBarbershopId) return;
    updateState(draft => {
      draft.marketingPosts.unshift({
        id: 'mp_' + Date.now(),
        barbershopId: currentBarbershopId,
        type: data.type,
        caption: data.caption,
        suggestedImagePrompt: data.suggestedImagePrompt,
        status: 'published',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      });
    });
    alert(`⚡️ Sucesso! O conteúdo gerado pela IA foi disparado e postado como ${data.type.toUpperCase()} em tempo real para as redes!`);
  };

  const handleSendWeeklyReport = () => {
    if (!currentBarbershopId || !currentBarbershop) return;
    updateState(draft => {
      const rep = getWeeklyReportData(draft, currentBarbershopId);
      
      const msg = `📊 [NF Barber - Relatório Mestre dos Últimos 6 Dias]\n\n` +
        `Empresa: ${currentBarbershop.name}\n` +
        `Período: ${rep.startDate} a ${rep.endDate}\n\n` +
        `• Serviços Realizados: ${rep.totalServices} (R$ ${rep.totalServicesValue.toFixed(2)})\n` +
        `• Produtos Faturados: ${rep.totalProducts} un. (R$ ${rep.totalProductsValue.toFixed(2)})\n` +
        `• Comissões Deduzidas: R$ ${rep.commissionsPaid.toFixed(2)}\n\n` +
        `🚀 Lucro Líquido Retido: R$ ${rep.netBarbershopProfit.toFixed(2)}`;

      draft.notificationLogs.unshift({
        id: 'n_wpp_' + Date.now(),
        barbershopId: currentBarbershopId,
        type: 'whatsapp',
        recipient: currentBarbershop.phone || '(11) 99999-9999',
        recipientName: 'Gestor (Dono da Barbearia)',
        message: msg,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });

      draft.notificationLogs.unshift({
        id: 'n_email_' + Date.now(),
        barbershopId: currentBarbershopId,
        type: 'email',
        recipient: currentBarbershop.email || 'diretoria@nfbarber.com',
        recipientName: 'Gestão de Faturamento Corporativo',
        message: msg,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
    });
    setCurrentTab('notifications');
    alert("✅ Relatório Global dos 6 Dias disparado com êxito! Cópia arquivada nos logs de notificação via WhatsApp e E-mail.");
  };

  // Se não estiver logado, exibe a tela de login
  if (!currentUserId || !currentUserType || !currentBarbershopId || !currentBarbershop) {
    return (
      <Login
        barbershops={dbState.barbershops}
        professionals={dbState.professionals}
        clients={dbState.clients}
        onLoginAdmin={handleLoginAdmin}
        onLoginProfessional={handleLoginProfessional}
        onLoginClient={handleLoginClient}
        onRegisterClient={handleRegisterClient}
        onRegisterBarbershop={handleRegisterBarbershop}
      />
    );
  }

  if (currentUserType === 'client' && currentClient) {
    return (
      <ClientPortal
        barbershop={currentBarbershop}
        client={currentClient}
        appointments={dbState.appointments}
        services={dbState.services.filter(s => s.barbershopId === currentBarbershopId)}
        professionals={dbState.professionals.filter(p => p.barbershopId === currentBarbershopId)}
        onLogout={handleLogout}
        onRequestAppointment={handleClientRequestAppointment}
      />
    );
  }

  // Resgata nome de exibição
  const userNameDisplay = currentUserType === 'admin' 
    ? currentBarbershop.name 
    : currentProfessional?.name || 'Profissional';

  const userAvatarDisplay = currentUserType === 'admin'
    ? currentBarbershop.avatarUrl
    : currentProfessional?.avatarUrl;

  // Renderizador do Conteúdo Dinâmico
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            appointments={dbState.appointments}
            productSales={dbState.productSales}
            cashRegisters={dbState.cashRegisters}
            professionals={dbState.professionals}
            currentBarbershopId={currentBarbershopId}
            userType={managementUserType}
            currentUserId={currentUserId}
            onSendWeeklyReport={handleSendWeeklyReport}
            onOpenCashModal={() => setShowCashModal(true)}
            weeklyReport={weeklyReport}
          />
        );
      case 'professionals':
        return (
          <Professionals
            professionals={dbState.professionals}
            currentBarbershopId={currentBarbershopId}
            onAddProfessional={handleAddProfessional}
          />
        );
      case 'services':
        return (
          <ServicesProducts
            services={dbState.services}
            products={dbState.products}
            professionals={dbState.professionals}
            currentBarbershopId={currentBarbershopId}
            userType={managementUserType}
            onAddService={handleAddService}
            onAddProduct={handleAddProduct}
          />
        );
      case 'schedule':
        return (
          <Schedule
            appointments={dbState.appointments}
            professionals={dbState.professionals}
            services={dbState.services}
            clients={dbState.clients}
            currentBarbershopId={currentBarbershopId}
            userType={managementUserType}
            currentUserId={currentUserId}
            onAddAppointment={handleAddAppointment}
            onCancelAppointment={handleCancelAppointment}
            onBeginFinalizeAppointment={handleBeginFinalizeAppointment}
          />
        );
      case 'clients':
        return (
          <Clients
            clients={dbState.clients}
            currentBarbershopId={currentBarbershopId}
            onAddClient={handleAddClient}
          />
        );
      case 'marketing':
        return (
          <MarketingAI
            barbershopName={currentBarbershop.name}
            services={dbState.services.filter(s => s.barbershopId === currentBarbershopId)}
            posts={dbState.marketingPosts}
            currentBarbershopId={currentBarbershopId}
            onPublishPost={handlePublishPost}
          />
        );
      case 'finance':
        return (
          <Finance
            appointments={dbState.appointments}
            productSales={dbState.productSales}
            cashRegisters={dbState.cashRegisters}
            professionals={dbState.professionals}
            currentBarbershopId={currentBarbershopId}
            weeklyReport={weeklyReport}
            userType={managementUserType}
            currentUserId={currentUserId}
          />
        );
      case 'notifications':
        return (
          <Notifications
            logs={dbState.notificationLogs}
            currentBarbershopId={currentBarbershopId}
          />
        );
      default:
        return null;
    }
  };

  // Filtragem local para modais rápidos de lançamento
  const shopProf = dbState.professionals.filter(p => p.barbershopId === currentBarbershopId);
  const shopProducts = dbState.products.filter(p => p.barbershopId === currentBarbershopId);

  const mobileNavItems = currentUserType === 'admin'
    ? [
        { id: 'dashboard', label: 'Painel' },
        { id: 'schedule', label: 'Agenda' },
        { id: 'professionals', label: 'Equipe' },
        { id: 'services', label: 'Servicos' },
        { id: 'clients', label: 'Clientes' },
        { id: 'finance', label: 'Financeiro' },
        { id: 'marketing', label: 'IA' },
        { id: 'notifications', label: 'Alertas' },
      ]
    : [
        { id: 'dashboard', label: 'Resumo' },
        { id: 'schedule', label: 'Agenda' },
        { id: 'services', label: 'Precos' },
        { id: 'finance', label: 'Comissoes' },
        { id: 'marketing', label: 'IA' },
      ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0b0a]">
      {/* Sidebar Fixa */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          userType={managementUserType}
          onLogout={handleLogout}
          barbershopName={currentBarbershop.name}
          userName={userNameDisplay}
          avatarUrl={userAvatarDisplay}
        />
      </div>

      {/* Container Principal */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="md:block hidden">
          <Header
            currentCashRegister={currentCashRegister}
            onOpenCashModal={() => setShowCashModal(true)}
          />
        </div>

        <div className="md:hidden sticky top-0 z-30 border-b border-[#2a1f18] bg-[#0d0b0a]/95 backdrop-blur-md">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8c6239] via-[#634427] to-[#d4af37] flex items-center justify-center font-black text-black shrink-0 shadow-lg">
                NF
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">NF Barber</p>
                <p className="text-[11px] text-[#a38a7a] truncate">{currentBarbershop.name}</p>
              </div>
            </div>

            {currentUserType !== 'client' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1e1917] border border-[#33251d] text-[10px] font-bold text-[#e8dbd3]"
                  title="Sair da sessão"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>

                <button
                  onClick={() => setShowCashModal(true)}
                  className="shrink-0 px-3 py-2 rounded-xl bg-[#1e1917] border border-[#33251d] text-[10px] font-bold text-[#e8dbd3]"
                >
                  {currentCashRegister ? 'Caixa Aberto' : 'Abrir Caixa'}
                </button>
              </div>
            )}
          </div>

          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {mobileNavItems.map(item => {
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                      active
                        ? 'bg-[#8c6239] border-[#8c6239] text-white'
                        : 'bg-[#141110] border-[#2a1f18] text-[#bfada3]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 py-4 md:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Botões Flutuantes com atalho customizado */}
      <FloatingActions
        onNewAppointment={() => setCurrentTab('schedule')}
        onNewSale={() => {
          setQuickSalePaymentMethod('pix');
          setQuickSaleModal('product');
        }}
      />

      {/* Modal de Abertura/Fechamento de Caixa */}
      {showCashModal && (
        <CashRegisterModal
          currentRegister={currentCashRegister}
          onOpenRegister={handleOpenCashRegister}
          onCloseRegister={handleCloseCashRegister}
          onCancel={() => setShowCashModal(false)}
        />
      )}

      {/* MODAL RÁPIDO PARA VENDA DE PRODUTOS DIRETAMENTE NO FLOATING BUTTON */}
      {quickSaleModal === 'product' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-bold text-white border-b border-[#2a1f18] pb-3 mb-4">
              Lançar Venda Rápida de Produto
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const pId = fd.get('productId') as string;
              const profId = fd.get('professionalId') as string;
              if (pId && profId) {
                handleAddProductSale(pId, profId, quickSalePaymentMethod);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Produto em Estoque *</label>
                <select name="productId" className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl p-2.5 text-xs text-white" required>
                  {shopProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)} (Restam: {p.stock})</option>
                  ))}
                </select>
                {shopProducts.length === 0 && (
                  <p className="text-[10px] text-red-400 mt-1">Nenhum produto cadastrado. Vá à aba de Serviços/Produtos.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Vendido Por (Barbeiro) *</label>
                <select 
                  name="professionalId" 
                  defaultValue={currentUserType === 'professional' ? currentUserId || undefined : undefined} 
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl p-2.5 text-xs text-white" 
                  required
                >
                  {shopProf.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.defaultProductCommission}% comissão)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Forma de pagamento *</label>
                <select
                  value={quickSalePaymentMethod}
                  onChange={(e) => setQuickSalePaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="pix">Pix</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#2a1f18] flex justify-end gap-3">
                <button type="button" onClick={() => setQuickSaleModal(null)} className="px-3 py-1.5 text-xs text-[#a38a7a]">Cancelar</button>
                <button type="submit" disabled={shopProducts.length === 0} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs">Concluir Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModal?.kind === 'appointment' && (
        <PaymentMethodModal
          title="Finalizar agendamento"
          description="Selecione a forma de pagamento usada para concluir este serviço."
          onCancel={() => setPaymentModal(null)}
          onConfirm={(method) => handleFinalizeAppointmentWithMethod(paymentModal.appointmentId, method)}
        />
      )}

    </div>
  );
}
export default App;
