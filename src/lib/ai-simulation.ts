
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_TUTOR_SYSTEM_PROMPT, buildUserPrompt } from './prompts';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

interface AIExplanation {
    context: string;
    correctAnalysis: string;
    alternativesAnalysis: string;
}

export const generateExplanation = async (questionText: string, correctAnswer: string, studentAnswer: string = 'A'): Promise<AIExplanation> => {
    if (!API_KEY) {
        console.warn("Missing Gemini API Key. Returning mock data.");
        // Fallback mock if key is missing/fails
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            context: "Modo Simulação (Sem Chave API): A questão trata de interpretação textual.",
            correctAnalysis: "Esta é uma resposta simulada. Adicione sua chave API no arquivo .env para ver a mágica acontecer.",
            alternativesAnalysis: "Análise simulada das alternativas incorretas."
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const userPrompt = buildUserPrompt(questionText, correctAnswer, studentAnswer);
        const fullPrompt = `${AI_TUTOR_SYSTEM_PROMPT}\n\n${userPrompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr) as AIExplanation;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            context: "Erro ao conectar com o Tutor IA.",
            correctAnalysis: "Não foi possível gerar a explicação neste momento.",
            alternativesAnalysis: "Verifique sua conexão ou a chave API."
        };
    }
};

export const generateEssayTopic = async (): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "Impactos da inteligência artificial no mercado de trabalho brasileiro (Tema Gerado via Mock)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const { ESSAY_TOPIC_SYSTEM_PROMPT, buildEssayTopicPrompt } = await import('./prompts');

        const fullPrompt = `${ESSAY_TOPIC_SYSTEM_PROMPT}\n\n${buildEssayTopicPrompt()}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Topic Gen Error:", error);
        return "Desafios para a garantia da segurança alimentar no Brasil (Fallback)";
    }
};

export const sendMessageToAssistant = async (
    message: string,
    persona: keyof typeof import('./prompts').PERSONA_PROMPTS,
    context?: {
        topic?: string;
        essayText?: string;
        correction?: any;
    }
): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `[MOCK] Olá! Sou o assistente ${persona}. Recebi sua mensagem: "${message}". Contexto: ${context ? 'Sim' : 'Não'}. Adicione sua API Key para eu responder de verdade!`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const { PERSONA_PROMPTS } = await import('./prompts');
        const systemInstruction = PERSONA_PROMPTS[persona];

        let fullPrompt = `${systemInstruction}\n\n`;

        // Add Context if available
        if (context) {
            fullPrompt += `CONTEXTO DO ALUNO (Use isso para personalizar a resposta):\n`;
            if (context.topic) fullPrompt += `- TEMA DA REDAÇÃO: ${context.topic}\n`;
            if (context.essayText) fullPrompt += `- TEXTO DO ALUNO:\n"""\n${context.essayText}\n"""\n`;
            if (context.correction) fullPrompt += `- CORREÇÃO ANTERIOR: ${JSON.stringify(context.correction)}\n`;
            fullPrompt += `\n`;
        }

        fullPrompt += `PERGUNTA DO ALUNO:\n${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Gemini Chat Error (${persona}):`, error);
        return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.";
    }
};

export const analyzeVideoContent = async (videoTitle: string, channelTitle: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `
## 📝 Resumo Executivo (MOCK)
Esta aula de **${videoTitle}** do canal **${channelTitle}** aborda os fundamentos essenciais do tema, focando na compreensão conceitual e resolução de exercícios práticos.

## 💡 Conceitos Chave
- **Conceito Principal:** Definição clara e objetiva do tema central.
- **Exemplos Práticos:** Aplicação da teoria em situações cotidianas.
- **Resolução de Problemas:** Estratégias para atacar questões do ENEM.

## 🚀 Aplicação no ENEM
Este conteúdo é frequente na prova de Ciências da Natureza/Matemática, cobrando interpretação de gráficos e aplicação de fórmulas.

## 🧠 Mapa Mental
- Introdução
  - Contexto Histórico
  - Definições
- Desenvolvimento
  - Fórmulas Principais
  - Exceções e Regras
- Conclusão
  - Dicas Finais
`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const { PERSONA_PROMPTS } = await import('./prompts');
        const systemInstruction = PERSONA_PROMPTS['video_analyst' as any]; // Cast as any if TS complains about dynamic key

        const fullPrompt = `${systemInstruction}\n\nVÍDEO PARA ANÁLISE:\nTítulo: ${videoTitle}\nCanal: ${channelTitle}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Video Analysis Error:", error);
        return "Não foi possível gerar a análise deste vídeo no momento.";
    }
};

export const parseScheduleCommand = async (command: string): Promise<any> => {
    if (!API_KEY) {
        // Mock fallback for testing without API key
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            subject: 'Matemática',
            title: 'Aula Agendada por Voz',
            date: '2026-02-06', // Today mock
            startTime: '14:00',
            duration: 2
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Você é um assistente de agendamento. Extraia os dados do comando do usuário para criar um evento de estudo no formato JSON.
            
            Comando: "${command}"
            
            Data atual de referência: ${new Date().toISOString()}
            
            Retorne APENAS um JSON válido (sem markdown) com os campos:
            - subject: (String) Matéria (Matemática, Física, Química, Biologia, História, Geografia, Linguagens, Redação). Se não identificar, use 'Revisão'.
            - title: (String) Título da aula resumido (ex: 'Geometria Espacial').
            - date: (String) Data no formato YYYY-MM-DD. Se for dia da semana (ex: 'segunda'), calcule a data correta baseada na data de hoje.
            - startTime: (String) Horário de início no formato HH:mm.
            - duration: (Number) Duração em horas (ex: 2 para 2 horas). Padrão = 1.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Clean markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Schedule Parse Error:", error);
        return null;
    }
};
