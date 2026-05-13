import { APP_CONFIG } from '../config';

// Configuração para armazenar a Groq API Key localmente (override opcional)
const GROQ_KEY_STORAGE = 'nf_barber_groq_api_key';

export const getStoredGroqKey = (): string => {
  return localStorage.getItem(GROQ_KEY_STORAGE) || APP_CONFIG.GROQ_API_KEY.trim();
};

export const saveStoredGroqKey = (key: string) => {
  localStorage.setItem(GROQ_KEY_STORAGE, key.trim());
};

export interface AIGeneratedPost {
  caption: string;
  suggestedImagePrompt: string;
  type: 'feed' | 'story';
}

export const generateMarketingIdeas = async (
  barbershopName: string,
  servicesList: string,
  tone = 'moderno e empolgante',
  type: 'feed' | 'story' = 'feed'
): Promise<AIGeneratedPost> => {
  const apiKey = getStoredGroqKey();

  const prompt = `Você é um especialista em Marketing Digital para Barbearias Premium.
Crie um post de alta performance para o ${type.toUpperCase()} do Instagram para a barbearia "${barbershopName}".
Eles oferecem os seguintes serviços/produtos: ${servicesList}.
O tom de voz deve ser: ${tone}.

Retorne estritamente um objeto JSON válido (sem markdown de bloco de código adicional) com o seguinte formato:
{
  "caption": "O texto completo da legenda com emojis cativantes e 5 hashtags altamente relevantes",
  "suggestedImagePrompt": "Uma descrição visual extremamente detalhada do que a foto ou vídeo precisa mostrar para ter o maior engajamento (ex: ângulo, iluminação de estúdio, foco)"
}`;

  if (!apiKey) {
    throw new Error('Groq API key not configured. Configure src/config.ts or save a key in the app.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Você é uma IA criativa especializada em redes sociais para barbearias. Responda apenas em formato JSON estrito.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        caption: parsed.caption || 'Sem legenda gerada.',
        suggestedImagePrompt: parsed.suggestedImagePrompt || 'Conceito visual limpo.',
        type
      };
    }
  } catch (error) {
    console.error('Falha na requisição para Groq:', error);
  }

  // Fallback se a API falhar
  return {
    caption: `✨ O padrão de excelência da ${barbershopName} traduzido no seu visual! \n\n#${barbershopName.replace(/\s+/g, '')} #CortePremium`,
    suggestedImagePrompt: 'Fotografia com foco no reflexo de um espelho limpo com o barbeiro finalizando o penteado com pomada matte.',
    type
  };
};
