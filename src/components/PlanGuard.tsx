
import { useState } from 'react';
import { Lock, ArrowUpCircle, X, Check, Copy, Loader2 } from 'lucide-react';
import { AbacatePayService } from '../services/abacate';
import { QRCodeSVG } from 'qrcode.react';

interface PlanGuardProps {
    requiredPlan: 'pro' | 'advanced';
    userPlan: string; // 'start', 'pro', 'advanced'
    children: React.ReactNode;
    featureName: string;
}

const PLAN_LEVELS = { 'start': 0, 'pro': 1, 'advanced': 2 };

export default function PlanGuard({ requiredPlan, userPlan, children, featureName }: PlanGuardProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Normalize user plan (handle undefined/null as start)
    const currentLevel = PLAN_LEVELS[userPlan as keyof typeof PLAN_LEVELS] || 0;
    const requiredLevel = PLAN_LEVELS[requiredPlan];

    if (currentLevel >= requiredLevel) {
        return <>{children}</>;
    }

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-gray-100">
                <div className="bg-indigo-100 p-3 rounded-full mb-4">
                    <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Recurso {requiredPlan === 'pro' ? 'Pro' : 'Avançado'}</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">{featureName} está disponível apenas no plano {requiredPlan}. Faça o upgrade agora pagando apenas a diferença.</p>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <ArrowUpCircle className="h-4 w-4" />
                    Fazer Upgrade
                </button>
            </div>

            {/* Blurred content preview */}
            <div className="opacity-20 pointer-events-none filter blur-sm select-none" aria-hidden="true">
                {children}
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    currentPlan={userPlan}
                    targetPlan={requiredPlan}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    );
}

function UpgradeModal({ currentPlan, targetPlan, onClose }: { currentPlan: string, targetPlan: string, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [step, setStep] = useState<'offer' | 'payment'>('offer');

    // Calculate diff
    // Start (14.90) -> Pro (29.90) = 15.00
    // Start -> Adv (49.90) = 35.00
    // Pro -> Adv (49.90) = 20.00

    let amount = 0;
    if (currentPlan === 'start' && targetPlan === 'pro') amount = 1500;
    else if (currentPlan === 'start' && targetPlan === 'advanced') amount = 3500;
    else if (currentPlan === 'pro' && targetPlan === 'advanced') amount = 2000;
    else amount = 2990; // Fallback

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('enem_pro_user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user) throw new Error("Usuário não encontrado");

            // Mock user data for MVP (In prod, use real data from DB/Auth)
            const userData = {
                name: user.name || "Aluno EnemPro",
                email: user.email,
                cellphone: user.phone || "11999999999",
                taxId: user.cpf || "00000000000"
            };

            const response = await AbacatePayService.createUpgradeCharge(userData, amount, targetPlan);

            if (response.data) {
                setPaymentUrl(response.data.brCode);
                setStep('payment');

                // Start Polling
                const interval = setInterval(async () => {
                    try {
                        const check = await AbacatePayService.checkPaymentStatus(response.data.id);
                        if (check.data?.status === 'PAID') {
                            clearInterval(interval);
                            alert("Upgrade realizado com sucesso! Atualize a página.");
                            // In real app: call backend to update plan
                            onClose();
                            window.location.reload();
                        }
                    } catch (e) { console.error(e); }
                }, 3000);
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar upgrade. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                </button>

                {step === 'offer' ? (
                    <div className="text-center">
                        <div className="inline-flex bg-indigo-100 p-4 rounded-full mb-4">
                            <ArrowUpCircle className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Upgrade para {targetPlan === 'pro' ? 'Pro' : 'Avançado'}</h2>
                        <p className="text-gray-500 mb-8">Desbloqueie todo o potencial da plataforma agora.</p>

                        <div className="bg-indigo-50 p-6 rounded-2xl mb-8 border border-indigo-100">
                            <div className="text-sm font-bold text-indigo-400 uppercase tracking-wide mb-1">Valor da Diferença</div>
                            <div className="text-4xl font-black text-indigo-600">R$ {(amount / 100).toFixed(2).replace('.', ',')}</div>
                            <p className="text-xs text-indigo-400 mt-2">Pagamento único referente a este mês</p>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pagar Diferença via PIX"}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Pague via PIX</h3>
                        <p className="text-gray-500 text-sm mb-6">Seu plano será atualizado automaticamente.</p>

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
                            Aguardando confirmação...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
