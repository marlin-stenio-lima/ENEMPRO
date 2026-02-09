import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RenewPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="flex justify-center mb-6">
                    <div className="bg-red-600/20 p-6 rounded-full border-2 border-red-600 animate-pulse">
                        <Lock className="h-12 w-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                        Acesso <span className="text-red-500">Pausado</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        Seu plano semanal expirou. Para continuar acessando os Tutores IA e suas correções, renove agora.
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-left space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-600 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-bl-xl">
                        Oferta de Renovação
                    </div>

                    <h3 className="text-2xl font-black uppercase">Plano Medicina</h3>
                    <p className="text-sm text-gray-500">Acesso VITALÍCIO sem mensalidades.</p>

                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-white">R$ 98,90</span>
                        <span className="text-sm text-gray-500 line-through mb-1">R$ 499,90</span>
                    </div>

                    <button
                        onClick={() => navigate('/checkout?plan=medicina')}
                        className="w-full bg-green-600 text-white font-black uppercase py-4 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        Quero Vitalício <ArrowRight className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => navigate('/checkout?plan=start')}
                        className="w-full bg-transparent border border-gray-700 text-gray-400 font-bold uppercase py-3 hover:bg-gray-800 hover:text-white transition-all text-xs tracking-widest"
                    >
                        Pagar Apenas R$ 9,90 (Mais uma semana)
                    </button>
                </div>

                <p className="text-xs text-gray-600 flex justify-center items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Seus dados estão salvos e seguros.
                </p>
            </div>
        </div>
    );
}
