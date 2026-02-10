import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, name, plan } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const data = await resend.emails.send({
            from: 'Gabas <onboarding@resend.dev>', // Default testing domain. User should verify their own domain later.
            to: [email],
            subject: 'Bem-vindo ao Gabas! 🚀',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Olá, ${name || 'Estudante'}! 👋</h1>
                    <p>Sua assinatura do <strong>Plano ${plan || 'Pro'}</strong> foi confirmada com sucesso.</p>
                    <p>Agora você tem acesso total aos nossos Tutores IA e ferramentas de estudo.</p>
                    <br/>
                    <a href="https://enem-pro.vercel.app/app" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Plataforma</a>
                    <br/><br/>
                    <p>Bons estudos!<br/>Equipe Gabas</p>
                </div>
            `
        });

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Resend Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
