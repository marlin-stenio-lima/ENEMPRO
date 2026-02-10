import OpenAI from 'openai';
import { getApiKey, type AgentType } from './api-config';
import { supabase } from './supabase';
import {
    AI_TUTOR_SYSTEM_PROMPT,
    buildUserPrompt,
    buildEssayTopicPrompt,
    ESSAY_TOPIC_SYSTEM_PROMPT,

    PERSONA_PROMPTS,
    ESSAY_CORRECTION_SYSTEM_PROMPT,
    buildEssayCorrectionPrompt
} from './prompts';

// Helper to get API Key for specific agent
const getClient = (agent: AgentType): string | null => {
    const apiKey = getApiKey(agent);
    if (!apiKey) {
        console.warn(`No API key found for agent: ${agent}`);
        return null;
    }
    return apiKey;
};

const MODEL = "gpt-4o-mini"; // Cost-effective, high intelligence

// HELPER: Centralized OpenAI Caller (Proxy vs Local)
async function callOpenAI(apiKey: string, messages: any[], responseFormat: any = null) {
    // PROXY LOGIC (Production)
    if (!import.meta.env.DEV) {
        const response = await fetch('/.netlify/functions/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: MODEL,
                apiKey: apiKey,
                response_format: responseFormat
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("Proxy OpenAI Error Details:", data.error);
            throw new Error(data.error);
        }
        return data; // Returns the full completion object
    }

    // LOCAL LOGIC (Development)
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    return await client.chat.completions.create({
        model: MODEL,
        messages: messages as any,
        response_format: responseFormat
    });
}


// 1. QUESTION EXPLANATION
interface AIExplanation {
    context: string;
    correctAnalysis: string;
    alternativesAnalysis: string;
}

export const generateExplanation = async (questionText: string, correctAnswer: string, studentAnswer: string = 'A'): Promise<AIExplanation> => {
    const client = getClient('QUESTOES_CRONOGRAMA');
    if (!client) return getMockExplanation();

    try {
        const userPrompt = buildUserPrompt(questionText, correctAnswer, studentAnswer);
        const messages = [
            { role: "system", content: AI_TUTOR_SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
        ];

        const completion = await callOpenAI(client, messages, { type: "json_object" });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response");

        return JSON.parse(content) as AIExplanation;
    } catch (error) {
        console.error("OpenAI Explanation Error:", error);
        return getMockExplanation();
    }
};

const getMockExplanation = () => ({
    context: "Erro ao conectar com a IA (Verifique a Chave API).",
    correctAnalysis: "Não foi possível gerar a análise.",
    alternativesAnalysis: "Tente novamente mais tarde."
});

// 2. ESSAY TOPIC GENERATION
export const generateEssayTopic = async (): Promise<string> => {
    const client = getClient('REDACAO');
    if (!client) return "Tecnologia e sociedade (Mock)";

    try {
        const messages = [
            { role: "system", content: ESSAY_TOPIC_SYSTEM_PROMPT },
            { role: "user", content: buildEssayTopicPrompt() }
        ];

        const completion = await callOpenAI(client, messages);

        return completion.choices[0].message.content?.trim() || "Tema não gerado";
    } catch (error) {
        console.error("OpenAI Topic Error:", error);
        return "Desafios da educação no Brasil (Fallback)";
    }
};

// 3. CHAT ASSISTANT (PERSONAS)
export const sendMessageToAssistant = async (
    message: string,
    persona: keyof typeof PERSONA_PROMPTS,
    context?: {
        topic?: string;
        essayText?: string;
        correction?: any;
        learnedContext?: string;
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
    if (!client) return "Erro: Chave API não configurada para este agente.";

    try {
        const systemInstruction = PERSONA_PROMPTS[persona];
        let fullContext = "";

        if (context) {
            fullContext += `CONTEXTO DO ALUNO:\n`;
            if (context.topic) fullContext += `- TEMA: ${context.topic}\n`;
            if (context.essayText) fullContext += `- TEXTO:\n"""\n${context.essayText}\n"""\n`;
            if (context.correction) fullContext += `- CORREÇÃO: ${JSON.stringify(context.correction)}\n`;
            if (context.learnedContext) fullContext += `\nESTILO DE RESPOSTA PREFERIDO (APRENDIDO COM O USUÁRIO):\nOs exemplos abaixo receberam feedback positivo. ADOTE O TIPO DE FORMATAÇÃO (ex: listas, negrito) E O TOM DESTES EXEMPLOS, mas **NUNCA REPITA** SAUDAÇÕES (como 'Olá sou Sophia') ou apresentações. Vá direto ao ponto.\n\n${context.learnedContext}\n`;
        }

        const messages: any[] = [
            { role: "system", content: systemInstruction }
        ];

        if (fullContext) {
            messages.push({ role: "user", content: fullContext });
        }

        messages.push({ role: "user", content: message });

        const completion = await callOpenAI(client, messages);

        // Log Usage (Fire and Forget)
        try {
            supabase.from('ai_usage_logs').insert({
                assistant: persona,
                timestamp: new Date().toISOString()
            }).then(({ error }) => {
                if (error) console.warn("Failed to log AI usage", error);
            });
        } catch (e) { console.warn("Logging error", e); }

        return completion.choices[0].message.content || "Sem resposta.";
    } catch (error) {
        console.error(`OpenAI Chat Error (${persona}):`, error);
        return "Tive um problema ao processar sua mensagem. Tente novamente.";
    }
};

// 4. VIDEO ANALYSIS
export const analyzeVideoContent = async (videoTitle: string, channelTitle: string): Promise<string> => {
    const client = getClient('YOUTUBE');
    if (!client) return "Erro: Chave API de Vídeo não configurada.";

    try {
        const systemInstruction = PERSONA_PROMPTS['video_analyst'];
        const userContent = `VÍDEO PARA ANÁLISE:\nTítulo: ${videoTitle}\nCanal: ${channelTitle}`;

        const messages = [
            { role: "system", content: systemInstruction },
            { role: "user", content: userContent }
        ];

        const completion = await callOpenAI(client, messages);

        return completion.choices[0].message.content || "Análise não gerada.";
    } catch (error) {
        console.error("OpenAI Video Analysis Error:", error);
        return "Não foi possível gerar a análise deste vídeo.";
    }
};

// 5. SCHEDULE PARSING
export const parseScheduleCommand = async (command: string): Promise<any> => {
    const client = getClient('QUESTOES_CRONOGRAMA');
    if (!client) return null;

    try {
        const prompt = `
            Você é um assistente de agendamento. Extraia os dados do comando do usuário para criar um evento de estudo no formato JSON.
            
            Comando: "${command}"
            Data referência: ${new Date().toISOString()}
            
            Retorne APENAS um JSON válido com:
            - subject: (String) Matéria (Matemática, Física, Química, Biologia, História, Geografia, Linguagens, Redação). Se nebuloso, 'Revisão'.
            - title: (String) Título resumido.
            - date: (String) YYYY-MM-DD.
            - startTime: (String) HH:mm.
            - duration: (Number) Horas (ex: 1.5). Padrão 1.
        `;

        const messages = [{ role: "system", content: prompt }];

        const completion = await callOpenAI(client, messages, { type: "json_object" });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        return JSON.parse(content);
    } catch (error) {
        return null;
    }
};

// 6. ESSAY CORRECTION
export const gradeEssay = async (topic: string, essay: string): Promise<any> => {
    const client = getClient('REDACAO');
    if (!client) {
        console.error("Agent REDACAO not configured");
        return null;
    }

    try {
        const messages = [
            { role: "system", content: ESSAY_CORRECTION_SYSTEM_PROMPT },
            { role: "user", content: buildEssayCorrectionPrompt(topic, essay) }
        ];

        const completion = await callOpenAI(client, messages, { type: "json_object" });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response");

        // Log Usage (Fire and Forget)
        try {
            supabase.from('ai_usage_logs').insert({
                assistant: 'essay_grader',
                timestamp: new Date().toISOString()
            }).then(({ error }) => {
                if (error) console.warn("Failed to log AI usage", error);
            });
        } catch (e) {
            console.warn("Logging error", e);
        }

        return JSON.parse(content);
    } catch (error: any) {
        console.error("OpenAI Essay Grading Error FULL OBJECT:", error);
        if (error.response) {
            console.error("OpenAI Error Response Data:", error.response.data);
            console.error("OpenAI Error Response Status:", error.response.status);
        }
        return null;
    }
};
