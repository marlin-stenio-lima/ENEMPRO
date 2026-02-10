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
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; }
                        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                        .header { background-color: #000000; padding: 40px; text-align: center; }
                        .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; display: flex; justify-content: center; align-items: center; }
                        .content { padding: 40px; color: #333333; line-height: 1.6; }
                        h1 { margin: 0 0 20px; font-size: 28px; font-weight: 800; color: #111111; }
                        p { margin: 0 0 20px; font-size: 16px; color: #555555; }
                        .btn { display: block; width: 100%; text-align: center; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 0; border-radius: 12px; font-weight: 700; margin: 30px 0; font-size: 16px; }
                        .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
                        .highlight { color: #22c55e; font-weight: 700; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">
                                <!-- Brain Icon SVG -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                                </svg>
                            </div>
                        </div>
                        <div class="content">
                            <h1>Bem-vindo ao Elite! 🚀</h1>
                            <p>Olá, <strong>${name || 'Estudante'}</strong>!</p>
                            <p>Sua assinatura do <span class="highlight">Plano ${plan || 'Pro'}</span> foi confirmada com sucesso.</p>
                            <p>A partir de agora, você tem uma equipe de Tutores IA trabalhando 24h por dia para garantir sua aprovação.</p>
                            
                            <a href="https://enem-pro.vercel.app/app" class="btn">ACESSAR PLATAFORMA AGORA</a>
                            
                            <p style="font-size: 14px; color: #888;">
                                Se precisar de qualquer ajuda, basta responder a este e-mail.<br>
                                Estamos juntos nessa jornada! 👊
                            </p>
                        </div>
                        <div class="footer">
                            © 2026 Gabas Education. Todos os direitos reservados.
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Resend Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
