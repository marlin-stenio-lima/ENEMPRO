import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Star, Crown, Calendar } from 'lucide-react';

export default function PlansPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('enem_pro_user') || '{}');
    const isMedicina = user.plan === 'medicina';

    const purchaseDate = new Date(user.purchase_date || new Date().toISOString());
    const nextBillingDate = new Date(purchaseDate);
    nextBillingDate.setDate(purchaseDate.getDate() + 7);

    return (
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-8 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-black" />
                Minha Assinatura
            </h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl">

                {/* Current Plan Card */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-gray-100 px-4 py-1 rounded-br-xl text-xs font-bold uppercase tracking-wider text-gray-500">
                        Seu Plano Atual
                    </div>

                    <div className="mt-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {isMedicina ? 'Plano Medicina' : 'Plano Semanal'}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            {isMedicina ? 'Vitalício • Sem renovação' : `Renova em: ${nextBillingDate.toLocaleDateString()}`}
                        </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-sm text-gray-500 font-bold">R$</span>
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">
                            {isMedicina ? '0,00' : '9,90'}
                        </span>
                        <span className="text-gray-400 font-bold">/{isMedicina ? 'sempre' : 'semana'}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                            <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="h-3 w-3" /></div>
                            Acesso à plataforma
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                            <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="h-3 w-3" /></div>
                            Tutores IA 24h
                        </div>
                        {isMedicina && (
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="h-3 w-3" /></div>
                                Prioridade em Correções
                            </div>
                        )}
                    </div>


                </div>

                {/* Upgrade Card (Only if not Medicina) */}
                {!isMedicina && (
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(200,200,200,0.5)] transform hover:-translate-y-1 transition-transform">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 rounded-bl-xl text-xs font-black uppercase tracking-wider">
                            Recomendado
                        </div>

                        <div className="mt-8 mb-6 relative z-10">
                            <h2 className="text-2xl font-black uppercase text-yellow-400 mb-1 flex items-center gap-2">
                                <Crown className="h-6 w-6" />
                                Upgrade Medicina
                            </h2>
                            <p className="text-gray-400 text-sm font-medium">
                                Pare de pagar mensalidades. Acesso Vitalício.
                            </p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8 relative z-10">
                            <span className="text-sm text-gray-500 font-bold uppercase">De R$ 499 por</span>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8 -mt-6 relative z-10">
                            <span className="text-sm text-gray-400 font-bold">1x</span>
                            <span className="text-5xl font-black text-white tracking-tighter">98,90</span>
                        </div>

                        <ul className="space-y-3 mb-8 relative z-10">
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Acesso VITALÍCIO
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Foco em Medicina
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Economize R$ 400/ano
                            </li>
                        </ul>

                        <button
                            onClick={() => navigate('/checkout?plan=medicina')}
                            className="w-full bg-yellow-400 text-black font-black uppercase py-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20 relative z-10"
                        >
                            Fazer Upgrade Agora
                        </button>

                        {/* Background Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>
                )}

            </div>
        </div>
    );
}
