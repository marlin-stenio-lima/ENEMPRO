import OpenAI from 'openai';

export default async (req: Request) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers });
    }

    try {
        const { messages, model, apiKey, response_format } = await req.json();

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Missing API Key' }), { status: 400, headers });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const completion = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: messages,
            response_format: response_format || undefined
        });

        return new Response(JSON.stringify(completion), { headers: { ...headers, 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error("OpenAI Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500, headers });
    }
};
