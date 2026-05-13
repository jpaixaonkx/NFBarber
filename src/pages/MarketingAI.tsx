import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Send, RefreshCw, Smartphone, Share2, Image as ImageIcon, Heart, MessageCircle } from 'lucide-react';
import { generateMarketingIdeas, getStoredGroqKey, saveStoredGroqKey, AIGeneratedPost } from '../services/ai';
import { MarketingPost, Service } from '../types';

interface MarketingAIProps {
  barbershopName: string;
  services: Service[];
  posts: MarketingPost[];
  currentBarbershopId: string;
  onPublishPost: (data: { caption: string; suggestedImagePrompt: string; type: 'feed' | 'story' }) => void;
}

export const MarketingAI: React.FC<MarketingAIProps> = ({
  barbershopName,
  services,
  posts,
  currentBarbershopId,
  onPublishPost
}) => {
  const shopPosts = posts.filter(p => p.barbershopId === currentBarbershopId);

  // Key Configuration
  const [apiKey, setApiKey] = useState(getStoredGroqKey());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySavedMsg, setKeySavedMsg] = useState('');
  const [aiError, setAiError] = useState('');

  // Generation
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState<'feed' | 'story'>('feed');
  const [tone, setTone] = useState('moderno e empolgante');
  const [currentIdea, setCurrentIdea] = useState<AIGeneratedPost | null>(null);

  const handleSaveKey = () => {
    saveStoredGroqKey(apiKey);
    setKeySavedMsg('Chave da Groq salva com sucesso! IA conectada no modo de alta performance.');
    setTimeout(() => setKeySavedMsg(''), 4000);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setAiError('');
      setCurrentIdea(null);
      const servicesStr = services.map(s => s.name).join(', ') || 'Cortes de cabelo, Barba na navalha, Sobrancelha, Pomadas';
      
      const idea = await generateMarketingIdeas(barbershopName, servicesStr, tone, postType);
      setCurrentIdea(idea);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar conteúdo com a Groq.';
      setAiError(message);
    } finally {
      setLoading(false);
    }
  };

  // Carrega uma sugestão inicial
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePublish = () => {
    if (!currentIdea) return;
    onPublishPost({
      caption: currentIdea.caption,
      suggestedImagePrompt: currentIdea.suggestedImagePrompt,
      type: currentIdea.type
    });
    // Gera uma nova ideia após publicar
    handleGenerate();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a1f18] pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-[#8c6239] text-black px-2.5 py-0.5 rounded-full">
            Motor IA Groq 🚀
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <span>Gestão de Marketing IA (Instagram)</span>
          </h2>
          <p className="text-xs text-[#a38a7a] mt-0.5">
            Criação e publicação diária de posts altamente engajadores no Feed e nos Stories.
          </p>
        </div>

        {/* Configuração de API Key */}
        <div className="flex flex-col items-end shrink-0">
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs font-bold text-[#d4af37] hover:underline flex items-center gap-1.5 bg-[#1b1614] border border-[#33251d] px-3 py-1.5 rounded-xl"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'Chave Groq Local Ativa' : 'Inserir Groq API Key'}</span>
          </button>

          {showKeyInput && (
            <div className="mt-2 bg-[#1b1614] border border-[#33251d] p-3 rounded-xl flex items-center gap-2 max-w-sm w-full animate-fade-in">
              <input
                type="password"
                placeholder="gsk_••••••••••••"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#141110] border border-[#2a1f18] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveKey}
                className="bg-[#8c6239] hover:bg-[#734f2d] text-white px-3 py-1 rounded-lg text-xs font-bold shrink-0"
              >
                Salvar
              </button>
            </div>
          )}
          <p className="text-[10px] text-[#a38a7a] mt-1 max-w-sm text-right">
            Prioridade: `src/config.ts`. O campo acima serve como override local por dispositivo.
          </p>
          {keySavedMsg && <p className="text-[10px] text-emerald-400 mt-1 font-semibold">{keySavedMsg}</p>}
        </div>
      </div>

      {/* Grid de Geração e Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Esquerdo: Controles de IA (5 colunas) */}
        <div className="lg:col-span-5 bg-[#141110] border border-[#2a1f18] p-6 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e1917] pb-3">
            <span>Configurar Postagem Diária</span>
          </h3>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-2">Formato do Post</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostType('feed')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  postType === 'feed'
                    ? 'bg-[#1b1614] border-[#8c6239] text-[#d4af37]'
                    : 'bg-[#141110] border-[#2a1f18] text-[#a38a7a]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Feed do Instagram</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPostType('story')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  postType === 'story'
                    ? 'bg-[#1b1614] border-[#8c6239] text-[#d4af37]'
                    : 'bg-[#141110] border-[#2a1f18] text-[#a38a7a]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Story Diário</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#a38a7a] mb-1">Tom da Abordagem</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#1b1614] border border-[#33251d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8c6239]"
            >
              <option value="moderno e empolgante">🔥 Moderno & Empolgante</option>
              <option value="exclusivo e de alto luxo">✨ Exclusivo & Alto Luxo</option>
              <option value="casual e descontraído">🤙 Casual & Descontraído</option>
              <option value="focado em promoções rápidas">⚡ Focado em Vagas de Hoje</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8c6239] via-[#634427] to-[#d4af37] hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processando IA na Groq...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span className="text-white">Gerar Ideia Fresquinha do Dia</span>
              </>
            )}
          </button>

          <div className="p-3.5 bg-[#1b1614] rounded-xl border border-[#33251d] text-[11px] text-[#bfada3] leading-relaxed">
            💡 A IA analisa os serviços que você atende e sugere tanto a <strong>legenda completa</strong> com hashtags prontas quanto uma orientação de foto ou vídeo perfeita para fechar a composição.
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
              {aiError.includes('not configured')
                ? 'Configure a chave Groq em src/config.ts para habilitar a IA para todos os acessos.'
                : aiError}
            </div>
          )}

          {/* Histórico recente de publicações */}
          <div className="pt-2 border-t border-[#1e1917]">
            <p className="text-[10px] uppercase font-bold text-[#a38a7a] mb-2">Publicações Compartilhadas</p>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
              {shopPosts.map(p => (
                <div key={p.id} className="text-[11px] bg-[#1b1614] p-2 rounded-lg border border-[#2a1f18] flex items-center justify-between">
                  <span className="truncate max-w-[180px] text-[#bfada3]">{p.caption}</span>
                  <span className="text-[9px] bg-[#2a1f18] px-1.5 py-0.5 rounded text-[#d4af37] uppercase font-bold shrink-0">
                    {p.type}
                  </span>
                </div>
              ))}
              {shopPosts.length === 0 && (
                <p className="text-[10px] text-[#a38a7a] italic">Nenhuma postagem realizada hoje.</p>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Preview do Post em Smartphone (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          
          {/* MOCKUP DE CELULAR */}
          <div className="w-full max-w-sm bg-black border-[8px] border-[#2a1f18] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col aspect-[9/18]">
            
            {/* Notch e Câmera */}
            <div className="absolute top-0 inset-x-0 h-5 bg-black z-20 flex justify-center items-end">
              <div className="w-24 h-3.5 bg-[#141110] rounded-b-xl border-x border-b border-[#2a1f18]" />
            </div>

            {/* Cabeçalho Instagram */}
            <div className="pt-7 px-3 pb-2 bg-[#141110] border-b border-[#2a1f18] flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#8c6239] flex items-center justify-center text-[10px] font-bold text-black">
                  NF
                </div>
                <span className="text-xs font-bold tracking-tight truncate max-w-[120px]">{barbershopName}</span>
              </div>
              <span className="text-[10px] text-[#a38a7a] font-medium uppercase">
                {postType === 'feed' ? 'Post do Feed' : 'Story'}
              </span>
            </div>

            {/* Área Visual Média (Imagem sugerida pela IA) */}
            <div className="flex-1 bg-gradient-to-b from-[#1c1410] via-[#2a1b12] to-[#141110] p-4 flex flex-col justify-center items-center relative text-center overflow-y-auto">
              
              {loading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mx-auto" />
                  <p className="text-[11px] text-[#a38a7a]">Conectando com Llama 3...</p>
                </div>
              ) : currentIdea ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#8c6239]/40 flex items-center justify-center mb-3">
                    <ImageIcon className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <span className="text-[9px] uppercase font-extrabold text-[#d4af37] tracking-widest bg-black/30 px-2 py-0.5 rounded">
                    Orientação Visual Sugerida
                  </span>
                  <p className="text-xs text-white mt-2 font-medium leading-relaxed max-w-xs italic">
                    "{currentIdea.suggestedImagePrompt}"
                  </p>

                  {/* Se for story, o texto pode aparecer sobreposto */}
                  {postType === 'story' && (
                    <div className="mt-6 bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-left w-full">
                      <p className="text-[11px] text-white whitespace-pre-line leading-tight">
                        {currentIdea.caption}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#a38a7a]">Nenhuma ideia gerada ainda.</p>
              )}
            </div>

            {/* Rodapé / Legenda (Visível no Feed) */}
            {postType === 'feed' && currentIdea && !loading && (
              <div className="bg-[#141110] border-t border-[#2a1f18] p-3 text-left shrink-0 max-h-36 overflow-y-auto">
                <div className="flex items-center gap-3 text-white mb-1.5">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <MessageCircle className="w-4 h-4 text-white" />
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[11px] text-white whitespace-pre-line leading-relaxed">
                  <strong className="text-[#d4af37] mr-1.5">{barbershopName.replace(/\s+/g, '')}</strong>
                  {currentIdea.caption}
                </p>
              </div>
            )}

            {/* Indicador de Barra Inferior de Celular */}
            <div className="h-1.5 bg-[#141110] flex justify-center pb-1">
              <div className="w-20 h-0.5 bg-[#33251d] rounded-full" />
            </div>

          </div>

          {/* Botão de Disparo / Publicação simulada */}
          <button
            onClick={handlePublish}
            disabled={loading || !currentIdea}
            className="mt-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Compartilhar & Postar no Instagram Agora</span>
          </button>
          <span className="text-[10px] text-[#a38a7a] mt-1.5">
            Aumenta ativamente as visualizações e prospecções no prazo da semana.
          </span>

        </div>

      </div>
    </div>
  );
};
