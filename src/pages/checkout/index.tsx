import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AbacatePayService } from '../../services/abacate';
import { Check, Loader2, Copy, Lock, QrCode, X, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PLANS = {
    start: {
        price: 990,
        name: 'Plano Enem Pro',
        id: 'start',
        features: [
            'Professores IA para cada área do ENEM',
            'Correção de Redação Ilimitada',
            'Cronograma de Estudos Adaptativo',
            'Banco de 10k+ Questões',
            'Dashboards de Evolução',
            'Videoaulas com Resumos Automáticos'
        ]
    },
    medicina: {
        price: 9890,
        name: 'Plano Medicina (Vitalício)',
        id: 'medicina',
        features: ['Acesso VITALÍCIO', 'Foco em Medicina', 'Prioridade na Correção', 'Sem mensalidades']
    }
};

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planParam = searchParams.get('plan') as keyof typeof PLANS;

    // Default to 'start' if invalid or not provided, unless 'medicina' is explicitly requested
    const [plan, setPlan] = useState<keyof typeof PLANS>(planParam === 'medicina' ? 'medicina' : 'start');

    const [step, setStep] = useState<'form' | 'payment'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', cellphone: '', cpf: '' });

    const [billingId, setBillingId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);


    const [showBumpModal, setShowBumpModal] = useState(false);

    const createCharge = async (selectedPlan: keyof typeof PLANS) => {
        setLoading(true);
        setError('');

        try {
            const cleanCpf = formData.cpf.replace(/\D/g, '');
            if (cleanCpf.length !== 11) throw new Error("CPF inválido: Digite os 11 números");

            console.log("Submitting charge for plan:", selectedPlan);

            const response = await AbacatePayService.createPixCharge({
                customer: {
                    name: formData.name,
                    email: formData.email,
                    cellphone: formData.cellphone,
                    taxId: cleanCpf
                },
                amount: PLANS[selectedPlan].price,
                description: `Assinatura ${PLANS[selectedPlan].name}`
            });

            console.log("Charge Response:", response);

            if (response.data) {
                setBillingId(response.data.id);
                setPaymentUrl(response.data.brCode);
                setStep('payment');
            } else {
                throw new Error("Erro ao criar cobrança PIX (Sem dados na resposta)");
            }
        } catch (err: any) {
            console.error("CreateCharge Error:", err);
            setError(err.message || 'Erro ao processar. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Order Bump Logic: If user is on 'start' plan, show modal first
        if (plan === 'start') {
            setShowBumpModal(true);
        } else {
            createCharge(plan);
        }
    };

    const handleAcceptBump = () => {
        setPlan('medicina');
        setShowBumpModal(false);
        createCharge('medicina');
    };

    const handleDeclineBump = () => {
        setShowBumpModal(false);
        createCharge('start');
    };

    useEffect(() => {
        if (step !== 'payment' || !billingId) return;

        const interval = setInterval(async () => {
            try {
                const check = await AbacatePayService.checkPaymentStatus(billingId);
                console.log("Full Payment Check Response:", check);
                // Check both standard and possible nested data structures
                const status = check?.data?.status || check?.status;
                if (status === 'PAID' || status === 'COMPLETED') {
                    clearInterval(interval);

                    // Send Welcome Email
                    fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: formData.email,
                            subject: 'Acesso Liberado! 🚀',
                            data: {
                                name: formData.name,
                                plan: PLANS[plan].name,
                                link: window.location.origin + '/app'
                            }
                        })
                    }).catch(err => console.error("Failed to send email:", err));

                    import('../../lib/supabase').then(async ({ supabase }) => {
                        await supabase.from('saas_leads').upsert({
                            email: formData.email,
                            name: formData.name,
                            phone: formData.cellphone,
                            plan: plan,
                            status: 'active',
                            purchase_price: PLANS[plan].price / 100,
                            purchase_date: new Date().toISOString()
                        }, { onConflict: 'email' });

                        const user = { email: formData.email, name: formData.name, plan: plan, role: 'user' };
                        localStorage.setItem('enem_pro_user', JSON.stringify(user));

                        navigate('/thank-you', {
                            state: {
                                purchase_price: PLANS[plan].price / 100,
                                plan_name: PLANS[plan].name,
                                transaction_id: billingId
                            }
                        });
                    });
                }
            } catch (e) {
                console.warn("Polling error", e);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [step, billingId, navigate, formData, plan]);

    return (
        <div className="min-h-screen bg-[#f0f2f5] font-sans text-gray-900 flex flex-col items-center justify-center py-12 px-4 relative">

            {/* Order Bump Modal - Kept functional but softened style */}
            {showBumpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-md w-full rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowBumpModal(false)} className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>

                        <div className="flex items-center gap-2 text-yellow-600 mb-4 uppercase font-bold text-xs tracking-wider">
                            <AlertTriangle className="h-4 w-4" />
                            Espere um segundo!
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Não pague mensalidade <span className="text-red-500 line-through">nunca mais</span>.
                        </h3>

                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            Você escolheu o <strong className="text-gray-900">Plano Enem Pro</strong> por <strong className="text-gray-900">R$ 9,90</strong>. Mas por apenas uma única vez de <strong className="text-green-600 text-lg">R$ 98,90</strong>, você libera o acesso <strong>VITALÍCIO</strong> ao Enem Pro Medicina.
                        </p>

                        <div className="bg-yellow-50 rounded-lg p-4 mb-6 space-y-2 border border-yellow-100">
                            <div className="flex items-center gap-2 font-medium text-sm text-gray-800"><Check className="h-4 w-4 text-green-600" /> Acesso Vitalício (Sem renovação)</div>
                            <div className="flex items-center gap-2 font-medium text-sm text-gray-800"><Check className="h-4 w-4 text-green-600" /> Economia de R$ 400/ano</div>
                            <div className="flex items-center gap-2 font-medium text-sm text-gray-800"><Check className="h-4 w-4 text-green-600" /> Foco em Medicina</div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleAcceptBump}
                                className="w-full bg-green-600 text-white font-bold uppercase py-3 rounded-lg hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                Sim, Quero Vitalício
                            </button>
                            <button
                                type="button"
                                onClick={handleDeclineBump}
                                className="w-full bg-transparent text-gray-500 font-medium py-2 hover:text-gray-700 text-xs transition-colors"
                            >
                                Não, vou continuar no plano atual
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg relative z-0">
                {/* Product Summary Card */}
                <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden mb-4 shadow-sm">
                    <div className="p-6">
                        <h3 className="text-gray-900 font-bold text-lg mb-1">{PLANS[plan].name}</h3>
                        <p className="text-green-700 text-sm mb-4">Acesso imediato à plataforma</p>

                        <div className="space-y-2 mb-6">
                            {PLANS[plan].features.map((feat, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    {feat}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-green-200">
                            <span className="text-gray-500 text-sm">Você paga:</span>
                            <span className="text-2xl font-bold text-green-700">R$ {(PLANS[plan].price / 100).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        {step === 'form' ? (
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                                            placeholder="Seu nome completo"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                                            placeholder="(11) 99999-9999"
                                            required
                                            value={formData.cellphone}
                                            onChange={e => setFormData({ ...formData, cellphone: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                                            placeholder="seuemail@exemplo.com"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                                            placeholder="000.000.000-00"
                                            required
                                            value={formData.cpf}
                                            onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                        <>
                                            <QrCode className="h-5 w-5" />
                                            Gerar QR Code PIX
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center pt-2 pb-6 animate-in fade-in zoom-in-95 duration-500">
                                <div className="text-center mb-6">
                                    <h3 className="font-bold text-gray-900 text-xl">Escaneie o QR Code</h3>
                                    <p className="text-gray-500 text-sm mt-1">Sua aprovação será imediata após o pagamento</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                                    <QRCodeSVG value={paymentUrl || 'error'} size={200} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 px-3 py-1.5 rounded-full animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Aguardando confirmação do pagamento...
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between gap-3 border border-gray-200">
                                        <code className="text-xs text-gray-600 truncate flex-1 font-mono">{paymentUrl}</code>
                                        <button
                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                            onClick={() => navigator.clipboard.writeText(paymentUrl || '')}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        className={`w-full ${copied ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(paymentUrl || '');
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copiado!' : 'Copiar Código PIX'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Ambiente 100% Seguro
                    </p>
                </div>

            </div>
        </div >
    );
}
