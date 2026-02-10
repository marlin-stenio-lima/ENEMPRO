import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ThankYou() {
    const navigate = useNavigate();
    const location = useLocation();
    const sentRef = useRef(false);

    useEffect(() => {
        if (sentRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = location.state as { purchase_price?: number, plan_name?: string, transaction_id?: string, user_email?: string, user_name?: string } | null;
        const value = state?.purchase_price || 9.90; // Fallback to 9.90
        const transaction_id = state?.transaction_id || `txn_${Date.now()}`;

        // 1. Send Pixel Event
        if (window.gtag) {
            window.gtag('event', 'purchase', {
                transaction_id: transaction_id,
                value: value,
                currency: 'BRL',
                items: [{
                    item_name: state?.plan_name || 'Plano Semanal',
                    price: value
                }]
            });
            console.log('Pixel Purchase Sent:', { value, transaction_id });
        }

        // 2. Send Welcome Email (via Serverless Function)
        const userStr = localStorage.getItem('enem_pro_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const email = state?.user_email || user?.email;
        const name = state?.user_name || user?.name;

        if (email) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    plan: state?.plan_name || 'Semanal'
                })
            }).then(res => {
                if (res.ok) console.log("Email sent successfully");
                else console.error("Failed to send email");
            }).catch(err => console.error("Email API Error:", err));
        }

        sentRef.current = true;
    }, [location]);

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white border-4 border-green-600 shadow-[8px_8px_0px_0px_rgba(22,163,74,1)] p-8 text-center animate-in fade-in zoom-in-95">

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-600">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-black uppercase text-gray-900 mb-2">Pagamento Confirmado!</h1>
                <p className="text-gray-600 font-medium mb-8">
                    Parabéns! Sua assinatura foi ativada com sucesso. Você já pode acessar todo o conteúdo exclusivo da plataforma.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-black text-white font-black uppercase tracking-wider p-4 border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 group"
                    >
                        Acessar Plataforma
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-xs text-gray-400">
                        As instruções de acesso também foram enviadas para seu e-mail.
                    </p>
                </div>
            </div>
        </div>
    );
}
