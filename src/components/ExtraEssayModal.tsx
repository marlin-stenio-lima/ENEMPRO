
import { useState } from 'react';
import { Sparkles, Loader2, QrCode, Copy, Check } from 'lucide-react';
import { AbacatePayService } from '../services/abacate';
import { QRCodeSVG } from 'qrcode.react';

interface ExtraEssayModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ExtraEssayModal({ onClose, onSuccess }: ExtraEssayModalProps) {
    const [step, setStep] = useState<'offer' | 'payment'>('offer');
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [billingId, setBillingId] = useState<string | null>(null);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('enem_pro_user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user) throw new Error("Usuário não logado");

            // Mock user data if missing (In real app, fetch from DB)
            const userData = {
                name: user.name || "Aluno EnemPro",
                email: user.email,
                cellphone: user.phone || "11999999999", // Fallback
                taxId: user.cpf || "00000000000" // Fallback
            };

            const response = await AbacatePayService.createExtraEssayCharge(userData);

            if (response.data) {
                setBillingId(response.data.id);
                setPaymentUrl(response.data.brCode);
                setStep('payment');

                // Start polling
                const interval = setInterval(async () => {
                    try {
                        const check = await AbacatePayService.checkPaymentStatus(response.data.id);
                        if (check.data?.status === 'PAID') {
                            clearInterval(interval);

                            // Update DB (Add extra balance) - In real app, webhook handles this.
                            // Here we simulate client-side update for MVP (Insecure but functional for demo)
                            const { supabase } = await import('../lib/supabase');
                            await supabase.rpc('increment_extra_essays', { user_email: user.email });

                            onSuccess();
                            onClose();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }, 3000);
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar pagamento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                {step === 'offer' ? (
                    <div className="text-center">
                        <div className="inline-flex bg-indigo-100 p-4 rounded-full mb-4">
                            <Sparkles className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Limite Mensal Atingido</h2>
                        <p className="text-gray-500 mb-6 font-medium">Você usou todas as correções do seu plano este mês.</p>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Correção Extra Avulsa</div>
                            <div className="text-4xl font-black text-gray-900">R$ 4,99</div>
                            <div className="text-green-600 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                                <Check className="h-3 w-3" /> Correção Detalhada IA
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Comprar Agora"}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Pague via PIX</h3>
                        <p className="text-gray-500 text-sm mb-6">Escaneie para liberar sua correção imediatamente.</p>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block mb-4 shadow-sm">
                            <QRCodeSVG value={paymentUrl || ''} size={180} />
                        </div>

                        <button
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mb-2"
                            onClick={() => navigator.clipboard.writeText(paymentUrl || '')}
                        >
                            <Copy className="h-4 w-4" />
                            Copiar Código
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-bold animate-pulse mt-4">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Aguardando pagamento...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
