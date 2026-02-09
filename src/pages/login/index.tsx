import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(email);
            if (result.success) {
                navigate('/app/dashboard');
            } else {
                setError(result.message || 'Erro ao fazer login');
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                {/* Logo / Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">ENEM<span className="text-indigo-600">.PRO</span></h1>
                    <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">Plataforma de Alta Performance</p>
                </div>

                {/* Card */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden">
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-300 border-l-4 border-b-4 border-black -mr-8 -mt-8 transform rotate-45"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login</h2>
                        <p className="text-gray-500 text-sm">Digite seu e-mail de compra para acessar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-900">E-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 border-2 border-black p-4 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 font-bold"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-sm font-bold flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-black uppercase tracking-wider p-4 border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    Entrar na Plataforma
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-medium">Acesso restrito a alunos.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <a href="#" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Precisa de Ajuda?</a>
                </div>
            </div>
        </div>
    );
}
