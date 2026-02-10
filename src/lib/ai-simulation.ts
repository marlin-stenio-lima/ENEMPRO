
import OpenAI from 'openai';
import { getApiKey, type AgentType } from './api-config';
import { AI_TUTOR_SYSTEM_PROMPT, buildUserPrompt } from './prompts';

// Helper to get client for specific agent
const getClient = (agent: AgentType) => {
    const apiKey = getApiKey(agent);
    if (!apiKey) {
        console.warn(`No API key found for agent: ${agent}`);
        return null;
    }
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
};

const MODEL = "gpt-4o-mini";

interface AIExplanation {
    context: string;
    correctAnalysis: string;
    alternativesAnalysis: string;
}

export const generateExplanation = async (questionText: string, correctAnswer: string, studentAnswer: string = 'A'): Promise<AIExplanation> => {
    const client = getClient('QUESTOES_CRONOGRAMA');
    if (!client) return {
        context: "Erro ao conectar com o Tutor IA (Chave não encontrada).",
        correctAnalysis: "Verifique suas chaves de API.",
        alternativesAnalysis: "Tente novamente."
    };

    try {
        const userPrompt = buildUserPrompt(questionText, correctAnswer, studentAnswer);

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: AI_TUTOR_SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response");

        return JSON.parse(content) as AIExplanation;

    } catch (error) {
        console.error("OpenAI Explanation Error:", error);
        return {
            context: "Erro ao conectar com o Tutor IA.",
            correctAnalysis: "Não foi possível gerar a explicação neste momento.",
            alternativesAnalysis: "Verifique sua conexão ou a chave API."
        };
    }
};

export const generateEssayTopic = async (): Promise<string> => {
    const client = getClient('REDACAO');
    if (!client) return "Impactos da inteligência artificial no mercado (Tema Mock - Sem Chave)";

    try {
        const { ESSAY_TOPIC_SYSTEM_PROMPT, buildEssayTopicPrompt } = await import('./prompts');

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: ESSAY_TOPIC_SYSTEM_PROMPT },
                { role: "user", content: buildEssayTopicPrompt() }
            ]
        });

        return completion.choices[0].message.content?.trim() || "Tema não gerado";
    } catch (error) {
        console.error("OpenAI Topic Gen Error:", error);
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
    // Map persona to AgentType Key
    let agentKey: AgentType = 'QUESTOES_CRONOGRAMA'; // Default
    switch (persona) {
        case 'redacao': agentKey = 'REDACAO'; break;
        case 'exatas': agentKey = 'MATEMATICA_FISICA'; break;
        case 'humanas': agentKey = 'HUMANAS'; break;
        case 'natureza': agentKey = 'NATUREZA'; break;
        case 'geografia': agentKey = 'GEO_ATUALIDADES'; break;
        case 'video_analyst': agentKey = 'YOUTUBE'; break;
    }

    const client = getClient(agentKey);
    if (!client) return `[MOCK] Olá! Sou o assistente ${persona}. Adicione a chave API '${agentKey}' para eu responder de verdade.`;

    try {
        const { PERSONA_PROMPTS } = await import('./prompts');
        const systemInstruction = PERSONA_PROMPTS[persona];

        let fullContext = "";
        if (context) {
            fullContext += `CONTEXTO DO ALUNO:\n`;
            if (context.topic) fullContext += `- TEMA: ${context.topic}\n`;
            if (context.essayText) fullContext += `- TEXTO:\n"""\n${context.essayText}\n"""\n`;
            if (context.correction) fullContext += `- CORREÇÃO: ${JSON.stringify(context.correction)}\n`;
        }

        const messages: any[] = [
            { role: "system", content: systemInstruction }
        ];

        if (fullContext) {
            messages.push({ role: "user", content: fullContext });
        }

        messages.push({ role: "user", content: message });

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: messages
        });

        return completion.choices[0].message.content || "Sem resposta.";
    } catch (error) {
        console.error(`OpenAI Chat Error (${persona}):`, error);
        return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.";
    }
};

export const analyzeVideoContent = async (videoTitle: string, channelTitle: string): Promise<string> => {
    const client = getClient('YOUTUBE');
    if (!client) return `
## 📝 Resumo Executivo (MOCK - SEM CHAVE YOUTUBE)
Adicione a chave API 'YOUTUBE' em api-config.ts para ver a mágica acontecer.
`;

    try {
        const { PERSONA_PROMPTS } = await import('./prompts');
        const systemInstruction = PERSONA_PROMPTS.video_analyst;

        const userContent = `VÍDEO PARA ANÁLISE:\nTítulo: ${videoTitle}\nCanal: ${channelTitle}`;

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userContent }
            ]
        });

        return completion.choices[0].message.content || "Análise não gerada.";
    } catch (error) {
        console.error("OpenAI Video Analysis Error:", error);
        return "Não foi possível gerar a análise deste vídeo no momento.";
    }
};

export const parseScheduleCommand = async (command: string): Promise<any> => {
    const client = getClient('QUESTOES_CRONOGRAMA');
    if (!client) {
        // Mock fallback
        return {
            subject: 'Matemática',
            title: 'Aula Agendada por Voz (Mock)',
            date: '2026-02-06',
            startTime: '14:00',
            duration: 2
        };
    }

    try {
        const prompt = `
            Você é um assistente de agendamento. Extraia os dados do comando do usuário para criar um evento de estudo no formato JSON.
            
            Comando: "${command}"
            Data referência: ${new Date().toISOString()}
            
            Retorne APENAS um JSON válido com:
            - subject: (String) Matéria (Matemática, Física, Química, Biologia, História, Geografia, Linguagens, Redação). Se não identificar, use 'Revisão'.
            - title: (String) Título da aula resumido.
            - date: (String) YYYY-MM-DD.
            - startTime: (String) HH:mm.
            - duration: (Number) Duração em horas (ex: 2). Padrão = 1.
        `;

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        return JSON.parse(content);
    } catch (error) {
        console.error("OpenAI Schedule Parse Error:", error);
        return null;
    }
};
