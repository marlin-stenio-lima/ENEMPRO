import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Brain, Activity, Lock, Unlock, Search, ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Lead {
    id: string;
    email: string;
    name: string;
    plan: string;
    status: 'active' | 'blocked';
    purchase_price: number;
    purchase_date: string;
    interaction_count?: number; // Mock or joined
}
const PLAN_PRICES: Record<string, number> = {
    'start': 49.90,
    'pro': 129.90,
    'advanced': 199.90
};

export default function AdminDashboard() {
    const { user, login, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

    // Gatekeeper State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gatekeeperEmail, setGatekeeperEmail] = useState('');
    const [gatekeeperPassword, setGatekeeperPassword] = useState('');
    const [gatekeeperError, setGatekeeperError] = useState('');

    // Add User Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        plan: 'pro',
        customPrice: 129.90, // Default for 'pro'
        status: 'active' as const
    });

    // Metrics
    const totalSales = leads.reduce((acc, lead) => acc + (lead.purchase_price || 0), 0);
    const activeUsers = leads.filter(l => l.status === 'active').length;
    const blockedUsers = leads.filter(l => l.status === 'blocked').length;

    useEffect(() => {
        // No auto-redirect here anymore, we rely on the Gatekeeper
        if (isAuthenticated) {
            fetchLeads();
        }
    }, [isAuthenticated]);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('saas_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching leads:", error);
                // Don't use mock data on error anymore
                setLeads([]);
            } else {
                setLeads(data || []);
            }
        } catch (e) {
            console.error("Critical fetch error:", e);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('saas_leads').insert([
                {
                    name: newUser.name,
                    email: newUser.email,
                    plan: newUser.plan,
                    status: newUser.status,
                    purchase_date: new Date().toISOString(),
                    purchase_price: newUser.customPrice
                }
            ]);

            if (error) throw error;

            setIsModalOpen(false);
            setNewUser({ name: '', email: '', plan: 'pro', status: 'active', customPrice: 129.90 }); // Reset
            fetchLeads(); // Refresh list to show new user
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erro ao criar usuário. Verifique se o email já existe ou permissões.');
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

        // Optimistic
        setLeads(leads.filter(l => l.id !== id));

        try {
            const { error } = await supabase.from('saas_leads').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error('Error deleting lead:', e);
            fetchLeads(); // Revert
            alert('Erro ao excluir aluno.');
        }
    };

    const toggleStatus = async (leadId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

        // Optimistic update
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        try {
            await supabase
                .from('saas_leads')
                .update({ status: newStatus })
                .eq('id', leadId);
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert on fail
            fetchLeads();
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.email.toLowerCase().includes(search.toLowerCase()) || lead.name?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || lead.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8 text-center border-b border-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
                        <p className="text-sm text-gray-500 mt-1">Acesso exclusivo para administradores</p>
                    </div>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (gatekeeperEmail === 'marlinstenio0312@gmail.com' && gatekeeperPassword === 'Senha@1234') {
                            const result = await login(gatekeeperEmail);
                            if (result.success) {
                                setIsAuthenticated(true);
                                setGatekeeperError('');
                            } else {
                                setGatekeeperError(result.message || 'Erro ao conectar.');
                            }
                        } else {
                            setGatekeeperError('Credenciais inválidas.');
                        }
                    }} className="p-8 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                type="email"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                value={gatekeeperEmail}
                                onChange={e => setGatekeeperEmail(e.target.value)}
                                placeholder="admin@gabas.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Senha</label>
                            <input
                                type="password"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                value={gatekeeperPassword}
                                onChange={e => setGatekeeperPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        {gatekeeperError && (
                            <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <Lock className="h-4 w-4" /> {gatekeeperError}
                            </div>
                        )}
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm mt-2">
                            Acessar Painel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/app')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Gabas <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full text-xs font-medium uppercase tracking-wide">Admin</span>
                        </h1>
                    </div>
                    <div className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full">
                        {user?.email}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faturamento Total</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuários Ativos</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{activeUsers}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bloqueados</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{blockedUsers}</p>
                        </div>
                        <div className="bg-rose-50 p-3 rounded-lg">
                            <Lock className="h-6 w-6 text-rose-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Uso de IA (Hoje)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">1,240</p>
                        </div>
                        <div className="bg-violet-50 p-3 rounded-lg">
                            <Brain className="h-6 w-6 text-violet-600" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" /> Controle de Leads
                        </h2>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <Plus className="h-4 w-4" /> Adicionar Aluno
                        </button>

                        <div className="flex gap-4 w-full md:w-auto items-center">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por email ou nome..."
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-gray-100/50 p-1 rounded-lg gap-1">
                                <button onClick={() => setFilter('all')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}>Todos</button>
                                <button onClick={() => setFilter('active')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'active' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-green-600")}>Ativos</button>
                                <button onClick={() => setFilter('blocked')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'blocked' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-red-600")}>Blocks</button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Compra</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{lead.name || 'Sem Nome'}</span>
                                                <span className="text-xs text-gray-500">{lead.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                lead.plan === 'pro' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    lead.plan === 'advanced' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                        "bg-gray-50 text-gray-600 border-gray-100"
                                            )}>
                                                {lead.plan === 'pro' ? 'Pro' : lead.plan === 'advanced' ? 'Advanced' : 'Start'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.purchase_date ? format(new Date(lead.purchase_date), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            R$ {lead.purchase_price?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => toggleStatus(lead.id, lead.status)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all border",
                                                    lead.status === 'active'
                                                        ? "text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100"
                                                        : "text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-100"
                                                )}
                                                title={lead.status === 'active' ? "Bloquear Acesso" : "Liberar Acesso"}
                                            >
                                                {lead.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => deleteLead(lead.id)}
                                                className="p-1.5 rounded-lg transition-all border border-transparent hover:bg-gray-100 hover:border-gray-200 text-gray-400 hover:text-red-500"
                                                title="Excluir Aluno"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredLeads.length === 0 && (
                            <div className="text-center py-12 text-gray-400 font-medium italic">
                                Nenhum lead encontrado.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-2">
                            <h3 className="text-xl font-black uppercase">Novo Aluno</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="text-2xl font-bold">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border-2 border-gray-200 p-2 text-sm font-bold focus:border-black focus:outline-none transition-colors"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Ex: Ana Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Email (Login)</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full border-2 border-gray-200 p-2 text-sm font-bold focus:border-black focus:outline-none transition-colors"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="ana@exemplo.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Plano</label>
                                    <select
                                        className="w-full border-2 border-gray-200 p-2 text-sm font-bold focus:border-black focus:outline-none bg-white"
                                        value={newUser.plan}
                                        onChange={e => {
                                            const newPlan = e.target.value;
                                            setNewUser({
                                                ...newUser,
                                                plan: newPlan,
                                                customPrice: PLAN_PRICES[newPlan] || 0
                                            });
                                        }}
                                    >
                                        <option value="start">Start</option>
                                        <option value="pro">Pro</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Status Inicial</label>
                                    <select
                                        className="w-full border-2 border-gray-200 p-2 text-sm font-bold focus:border-black focus:outline-none bg-white"
                                        value={newUser.status}
                                        onChange={e => setNewUser({ ...newUser, status: e.target.value as any })}
                                    >
                                        <option value="active">Ativo (Liberado)</option>
                                        <option value="blocked">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Valor (R$)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full border-2 border-gray-200 p-2 text-sm font-bold focus:border-black focus:outline-none transition-colors"
                                    value={newUser.customPrice}
                                    onChange={e => setNewUser({ ...newUser, customPrice: parseFloat(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold uppercase text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-3 text-sm font-bold uppercase hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,255,0,0.5)] active:translate-y-0.5 active:shadow-none"
                                >
                                    Criar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
