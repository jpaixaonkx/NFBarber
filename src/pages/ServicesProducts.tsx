import React, { useState } from 'react';
import { Scissors, ShoppingBag, Plus, Clock, Users } from 'lucide-react';
import { Service, Product, Professional } from '../types';

interface ServicesProductsProps {
  services: Service[];
  products: Product[];
  professionals: Professional[];
  currentBarbershopId: string;
  userType: 'admin' | 'professional' | null;
  onAddService: (data: { name: string; price: number; durationMinutes: number; customCommissions: { [pId: string]: number } }) => void;
  onAddProduct: (data: { name: string; price: number; stock: number; customCommissions: { [pId: string]: number } }) => void;
}

export const ServicesProducts: React.FC<ServicesProductsProps> = ({
  services,
  products,
  professionals,
  currentBarbershopId,
  userType,
  onAddService,
  onAddProduct
}) => {
  const shopServices = services.filter(s => s.barbershopId === currentBarbershopId);
  const shopProducts = products.filter(p => p.barbershopId === currentBarbershopId);
  const shopProf = professionals.filter(p => p.barbershopId === currentBarbershopId);

  const isAdmin = userType === 'admin';

  // Tabs de exibição
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  // Modais de Criação
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'service' | 'product'>('service');

  // Form States
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDurationOrStock, setItemDurationOrStock] = useState('');
  
  // Custom Commissions: mapeia professionalId -> comissão customizada em %
  const [customComm, setCustomComm] = useState<{ [pId: string]: number }>({});

  const handleOpenModal = (type: 'service' | 'product') => {
    setModalType(type);
    setItemName('');
    setItemPrice('');
    setItemDurationOrStock(type === 'service' ? '45' : '10');
    setCustomComm({});
    setShowModal(true);
  };

  const handleCommChange = (pId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      const copy = { ...customComm };
      delete copy[pId];
      setCustomComm(copy);
    } else {
      setCustomComm({ ...customComm, [pId]: num });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;

    const priceNum = parseFloat(itemPrice) || 0;

    if (modalType === 'service') {
      onAddService({
        name: itemName,
        price: priceNum,
        durationMinutes: parseInt(itemDurationOrStock) || 45,
        customCommissions: customComm
      });
    } else {
      onAddProduct({
        name: itemName,
        price: priceNum,
        stock: parseInt(itemDurationOrStock) || 10,
        customCommissions: customComm
      });
    }

    setShowModal(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#8c6239]" />
            <span>Gestão de Serviços & Produtos</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">
            Especifique os valores de venda e as comissões individuais configuradas por funcionário.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal('service')}
              className="bg-[#1e1917] hover:bg-[#2a2320] border border-[#33251d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#8c6239]" />
              <span>Novo Serviço</span>
            </button>
            <button
              onClick={() => handleOpenModal('product')}
              className="bg-gradient-to-r from-[#8c6239] to-[#634427] hover:from-[#9c6f42] hover:to-[#734f2d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Produto</span>
            </button>
          </div>
        )}
      </div>

      {/* Toggle View */}
      <div className="flex border-b border-[#2a1f18] gap-8">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 relative ${
            activeTab === 'services' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#8c6239] hover:text-white'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Catálogo de Serviços ({shopServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 relative ${
            activeTab === 'products' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#8c6239] hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Estoque de Produtos ({shopProducts.length})</span>
        </button>
      </div>

      {/* CONTEÚDO SERVIÇOS */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {shopServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{service.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#a38a7a] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8c6239]" />
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-[#d4af37]">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                {/* Comissões Detalhadas por Profissional */}
                <div className="mt-4 pt-3 border-t border-[#1e1917]">
                  <p className="text-[10px] uppercase font-bold text-[#a38a7a] mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#8c6239]" />
                    <span>Regra de Comissão por Funcionário</span>
                  </p>

                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {shopProf.map(p => {
                      const hasCustom = service.customCommissions && service.customCommissions[p.id] !== undefined;
                      const pct = hasCustom ? service.customCommissions![p.id] : p.defaultServiceCommission;
                      const commVal = (service.price * pct) / 100;

                      return (
                        <div key={p.id} className="flex items-center justify-between text-xs bg-[#1b1614] px-2.5 py-1 rounded-lg">
                          <span className="text-[#bfada3] truncate max-w-[140px] font-medium">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-[#2a1f18] px-1.5 py-0.5 rounded text-[#8c6239] font-bold">
                              {pct}% {hasCustom ? '(Especial)' : ''}
                            </span>
                            <span className="font-bold text-emerald-400">{formatCurrency(commVal)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {shopProf.length === 0 && (
                      <p className="text-[10px] text-[#a38a7a] italic">Cadastre funcionários para visualizar as fatias de comissão.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[9px] text-[#a38a7a] text-right">
                Configuração aplicada ao fechamento diário
              </div>
            </div>
          ))}

          {shopServices.length === 0 && (
            <div className="col-span-full py-12 text-center bg-[#141110] rounded-2xl border border-[#2a1f18]">
              <p className="text-xs text-[#a38a7a]">Nenhum serviço cadastrado.</p>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO PRODUTOS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
          {shopProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-[#141110] border border-[#2a1f18] p-5 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{product.name}</h3>
                    <p className="text-[10px] text-sky-400 font-bold mt-0.5">
                      Estoque atual: {product.stock} un.
                    </p>
                  </div>
                  <span className="text-base font-black text-white shrink-0">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {/* Comissões Detalhadas por Profissional */}
                <div className="mt-4 pt-3 border-t border-[#1e1917]">
                  <p className="text-[10px] uppercase font-bold text-[#a38a7a] mb-1.5">
                    Comissão de Venda
                  </p>

                  <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
                    {shopProf.map(p => {
                      const hasCustom = product.customCommissions && product.customCommissions[p.id] !== undefined;
                      const pct = hasCustom ? product.customCommissions![p.id] : p.defaultProductCommission;
                      const commVal = (product.price * pct) / 100;

                      return (
                        <div key={p.id} className="flex items-center justify-between text-[11px] bg-[#1b1614] px-2 py-0.5 rounded">
                          <span className="text-[#bfada3] truncate max-w-[100px]">{p.name}</span>
                          <span className="text-sky-400 font-bold">{pct}% = {formatCurrency(commVal)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {shopProducts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-[#141110] rounded-2xl border border-[#2a1f18]">
              <p className="text-xs text-[#a38a7a]">Nenhum produto em estoque.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141110] border border-[#2a1f18] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#2a1f18] flex items-center justify-between bg-gradient-to-b from-[#1b1614] to-transparent">
              <h3 className="text-base font-bold text-white">
                {modalType === 'service' ? 'Cadastrar Novo Serviço' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#a38a7a] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">
                  Nome do {modalType === 'service' ? 'Serviço' : 'Produto'} *
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'service' ? 'Ex: Corte e Alinhamento' : 'Ex: Pomada em Pó'}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Valor de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="70.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">
                    {modalType === 'service' ? 'Duração Média (min)' : 'Quantidade Inicial'}
                  </label>
                  <input
                    type="number"
                    placeholder={modalType === 'service' ? '45' : '12'}
                    value={itemDurationOrStock}
                    onChange={(e) => setItemDurationOrStock(e.target.value)}
                    className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
                    required
                  />
                </div>
              </div>

              {/* Personalização Avançada de Comissões por Funcionário */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase text-[#d4af37] mb-1">
                  Substituir Comissão Padrão por Funcionário (Opcional)
                </label>
                <p className="text-[10px] text-[#a38a7a] mb-3">
                  Se preenchido, o profissional ganhará esta porcentagem específica em vez da comissão global de seu cadastro ao vender este item.
                </p>

                <div className="space-y-2 border border-[#2a1f18] p-3 rounded-xl bg-[#1b1614]/50">
                  {shopProf.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#bfada3] truncate">{p.name}</span>
                      <div className="flex items-center gap-1 w-32">
                        <input
                          type="number"
                          placeholder={`${modalType === 'service' ? p.defaultServiceCommission : p.defaultProductCommission}% padrão`}
                          value={customComm[p.id] !== undefined ? customComm[p.id] : ''}
                          onChange={(e) => handleCommChange(p.id, e.target.value)}
                          className="w-full bg-[#141110] border border-[#33251d] rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-[#8c6239]"
                        />
                        <span className="text-[10px] text-[#a38a7a]">%</span>
                      </div>
                    </div>
                  ))}

                  {shopProf.length === 0 && (
                    <p className="text-[10px] text-[#a38a7a] italic text-center">Nenhum profissional para customizar.</p>
                  )}
                </div>
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
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
