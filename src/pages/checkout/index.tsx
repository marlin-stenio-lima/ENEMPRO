import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AbacatePayService } from '../../services/abacate';
import { Check, Loader2, Copy, Lock, QrCode, ShieldCheck, Star, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PLANS = {
    start: {
        price: 990,
        name: 'Plano Semanal',
        id: 'start',
        features: ['Acesso Total por 7 dias', 'Tutores IA 24h', 'Correção de Redação']
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
    const [status, setStatus] = useState<'PENDING' | 'PAID' | 'EXPIRED'>('PENDING');

    const [showBumpModal, setShowBumpModal] = useState(false);

    const createCharge = async (selectedPlan: keyof typeof PLANS) => {
        setLoading(true);
        setError('');

        try {
            if (formData.cpf.length < 11) throw new Error("CPF inválido");

            const response = await AbacatePayService.createPixCharge({
                customer: {
                    name: formData.name,
                    email: formData.email,
                    cellphone: formData.cellphone,
                    taxId: formData.cpf
                },
                amount: PLANS[selectedPlan].price,
                description: `Assinatura ${PLANS[selectedPlan].name}`
            });

            if (response.data) {
                setBillingId(response.data.id);
                setPaymentUrl(response.data.brCode);
                setStep('payment');
            } else {
                throw new Error("Erro ao criar cobrança PIX");
            }
        } catch (err: any) {
            console.error(err);
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
                if (check.data?.status === 'PAID') {
                    setStatus('PAID');
                    clearInterval(interval);

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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col items-center justify-center py-12 px-4 relative">

            {/* Order Bump Modal */}
            {showBumpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-md w-full rounded-none border-4 border-yellow-400 shadow-[10px_10px_0px_0px_rgba(250,204,21,1)] p-6 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowBumpModal(false)} className="absolute top-2 right-2 p-2 hover:bg-gray-100"><X className="h-6 w-6" /></button>

                        <div className="flex items-center gap-2 text-yellow-600 mb-4 uppercase font-black tracking-widest text-sm">
                            <AlertTriangle className="h-5 w-5" />
                            Espere um segundo!
                        </div>

                        <h3 className="text-3xl font-black uppercase leading-none mb-4">
                            Não pague mensalidade <span className="text-red-600 line-through decoration-4">nunca mais</span>.
                        </h3>

                        <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                            Você escolheu o plano semanal por <strong className="text-black">R$ 9,90</strong>. Mas por apenas uma única vez de <strong className="text-green-600 text-xl">R$ 98,90</strong>, você libera o acesso <strong>VITALÍCIO</strong> ao Enem Pro Medicina.
                        </p>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-sm"><Check className="h-4 w-4 text-green-600" /> Acesso Vitalício (Sem renovação)</div>
                            <div className="flex items-center gap-2 font-bold text-sm"><Check className="h-4 w-4 text-green-600" /> Economia de R$ 400/ano</div>
                            <div className="flex items-center gap-2 font-bold text-sm"><Check className="h-4 w-4 text-green-600" /> Foco em Medicina</div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAcceptBump}
                                className="w-full bg-green-600 text-white font-black uppercase py-4 hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                            >
                                Sim, Quero Vitalício
                            </button>
                            <button
                                onClick={handleDeclineBump}
                                className="w-full bg-transparent text-gray-400 font-bold uppercase py-2 hover:text-gray-600 text-xs tracking-widest transition-colors"
                            >
                                Não, vou continuar pagando por semana
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg relative z-0">

                {/* Brand Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter flex items-center justify-center gap-3">
                        <Lock className="h-8 w-8" />
                        Checkout
                    </h1>
                </div>

                <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

                    <div className="p-8">
                        {/* Summary Section */}
                        <div className="bg-gray-100 p-6 mb-8 border-2 border-black">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest">
                                    <Star className="h-3 w-3 fill-white" />
                                    Selecionado
                                </span>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900 text-xl uppercase">{PLANS[plan].name}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-black text-gray-900 tracking-tighter">R$ {(PLANS[plan].price / 100).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t-2 border-gray-200">
                                {PLANS[plan].features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                                        <div className="bg-black text-white p-0.5">
                                            <Check className="h-3 w-3" />
                                        </div>
                                        {feat}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {step === 'form' ? (
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-900 uppercase mb-1 ml-1">Nome Completo</label>
                                        <input
                                            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder-gray-400"
                                            placeholder="SEU NOME"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-900 uppercase mb-1 ml-1">Whatsapp</label>
                                            <input
                                                className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder-gray-400"
                                                placeholder="(11) 99999-9999"
                                                required
                                                value={formData.cellphone}
                                                onChange={e => setFormData({ ...formData, cellphone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-900 uppercase mb-1 ml-1">CPF</label>
                                            <input
                                                className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder-gray-400"
                                                placeholder="000.000.000-00"
                                                required
                                                value={formData.cpf}
                                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-900 uppercase mb-1 ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder-gray-400"
                                            placeholder="SEU@EMAIL.COM"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 border-2 border-red-100 text-center">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-900 text-white font-black uppercase text-lg py-4 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                        <>
                                            <QrCode className="h-5 w-5" />
                                            Gerar Pagamento
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center pt-2 pb-6 animate-in fade-in zoom-in-95 duration-500">
                                <div className="text-center mb-6">
                                    <h3 className="font-black text-gray-900 text-xl uppercase">Escaneie o QR Code</h3>
                                    <p className="text-gray-500 text-sm font-bold mt-1">Aprovação Imediata</p>
                                </div>

                                <div className="bg-white p-4 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                                    <QRCodeSVG value={paymentUrl || 'error'} size={200} />
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="bg-gray-100 p-3 flex items-center justify-between gap-3 border-2 border-black">
                                        <code className="text-xs text-gray-900 truncate flex-1 font-mono">{paymentUrl}</code>
                                        <button
                                            className="text-gray-400 hover:text-black transition-colors"
                                            onClick={() => navigator.clipboard.writeText(paymentUrl || '')}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        className="w-full bg-black text-white font-black uppercase py-4 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                        onClick={() => navigator.clipboard.writeText(paymentUrl || '')}
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copiar Código PIX
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-400 text-xs font-mono">
                        Enem.Pro Educação Ltda • Ambiente Seguro SSL
                    </p>
                </div>

            </div>
        </div>
    );
}
