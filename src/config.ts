export const APP_CONFIG = {
  // Cole sua Groq API Key aqui para habilitar a IA em todo o app.
  // Exemplo: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxx'
  GROQ_API_KEY: String(((import.meta as any).env?.VITE_GROQ_API_KEY || '')).trim(),
};
