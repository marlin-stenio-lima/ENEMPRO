import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, Loader2, Lock } from 'lucide-react';


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
                // Check if admin to redirect correctly (optional, or just go to /app)
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Gabas</h1>
                    <p className="text-gray-500 text-sm font-medium">Plataforma de Alta Performance</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900">Bem-vindo de volta</h2>
                        <p className="text-gray-500 text-sm mt-1">Digite seu e-mail para acessar sua conta</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">E-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-sm font-medium"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    Entrar na Plataforma
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-xs text-gray-400 font-medium">Acesso protegido e seguro.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <a href="#" className="text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors">Precisa de Ajuda?</a>
                </div>
            </div>
        </div>
    );
}
