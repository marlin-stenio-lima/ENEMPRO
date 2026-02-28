import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEYS = [
    process.env.VITE_ABACATE_KEY_1,
    process.env.VITE_ABACATE_KEY_2,
    process.env.VITE_ABACATE_KEY_3,
].filter(Boolean) as string[];

const BASE_URL = "https://api.abacatepay.com/v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { endpoint, method, body } = req.body;

    if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint' });
    }

    if (API_KEYS.length === 0) {
        return res.status(500).json({ error: 'Abacate Pay API Keys not configured on server' });
    }

    let lastError;

    for (const apiKey of API_KEYS) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: method || 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            const responseText = await response.text();

            if (!response.ok) {
                console.error(`AbacatePay Proxy Error (${response.status}):`, responseText);
                throw new Error(`AbacatePay Error (${response.status}): ${responseText}`);
            }

            try {
                return res.status(200).json(JSON.parse(responseText));
            } catch (e) {
                return res.status(200).send(responseText);
            }
        } catch (error: any) {
            console.warn(`AbacatePay Proxy attempt failed. Error:`, error.message);
            lastError = error;
            continue;
        }
    }

    return res.status(500).json({ error: lastError?.message || 'All AbacatePay API keys failed on proxy.' });
}
