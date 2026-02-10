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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">

                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Pagamento Confirmado!</h1>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    Parabéns! Sua assinatura foi ativada. <br />
                    Tudo pronto para sua aprovação.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        Acessar Plataforma
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    <p className="text-sm text-gray-400">
                        Enviamos os dados de acesso para seu e-mail.
                    </p>
                </div>
            </div>
        </div>
    );
}
