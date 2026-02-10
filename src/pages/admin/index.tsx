import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Brain, Activity, Lock, Unlock, Search, ArrowLeft, Plus, X } from 'lucide-react';
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
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

    // Add User Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        plan: 'pro',
        status: 'active' as const
    });

    // Metrics
    const totalSales = leads.reduce((acc, lead) => acc + (lead.purchase_price || 0), 0);
    const activeUsers = leads.filter(l => l.status === 'active').length;
    const blockedUsers = leads.filter(l => l.status === 'blocked').length;

    useEffect(() => {
        if (authLoading) return;

        // Security Check
        if (user?.role !== 'admin') {
            navigate('/app/dashboard');
            return;
        }

        fetchLeads();
    }, [user, authLoading]);

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
                    purchase_price: PLAN_PRICES[newUser.plan] || 0
                }
            ]);

            if (error) throw error;

            setIsModalOpen(false);
            setNewUser({ name: '', email: '', plan: 'pro', status: 'active' }); // Reset
            fetchLeads(); // Refresh list to show new user
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erro ao criar usuário. Verifique se o email já existe ou permissões.');
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
            <div className="bg-black text-white p-4 sticky top-0 z-10 border-b-4 border-yellow-400 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/app/dashboard')} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-xl font-black uppercase tracking-wider">Admin<span className="text-yellow-400">Panel</span></h1>
                    </div>
                    <div className="text-xs font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700">
                        {user?.email}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Faturamento Total</p>
                            <p className="text-2xl font-black text-green-600">R$ {totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-100 p-3 border-2 border-black">
                            <DollarSign className="h-6 w-6 text-green-700" />
                        </div>
                    </div>

                    <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Usuários Ativos</p>
                            <p className="text-2xl font-black text-blue-600">{activeUsers}</p>
                        </div>
                        <div className="bg-blue-100 p-3 border-2 border-black">
                            <Users className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>

                    <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Bloqueados</p>
                            <p className="text-2xl font-black text-red-600">{blockedUsers}</p>
                        </div>
                        <div className="bg-red-100 p-3 border-2 border-black">
                            <Lock className="h-6 w-6 text-red-700" />
                        </div>
                    </div>

                    <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Uso de IA (Hoje)</p>
                            <p className="text-2xl font-black text-purple-600">1,240</p>
                        </div>
                        <div className="bg-purple-100 p-3 border-2 border-black">
                            <Brain className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                            <Activity className="h-6 w-6" /> Controle de Leads
                        </h2>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-black text-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,200,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,200,0,1)] active:shadow-none active:translate-y-1"
                        >
                            <span className="text-xl leading-none">+</span> Adicionar Aluno
                        </button>

                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por email ou nome..."
                                    className="w-full bg-gray-50 border-2 border-black pl-10 pr-4 py-2.5 text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-gray-100 border-2 border-black p-1 gap-1">
                                <button onClick={() => setFilter('all')} className={cn("px-3 py-1.5 text-xs font-bold uppercase transition-all", filter === 'all' ? "bg-black text-white" : "text-gray-500 hover:text-black")}>Todos</button>
                                <button onClick={() => setFilter('active')} className={cn("px-3 py-1.5 text-xs font-bold uppercase transition-all", filter === 'active' ? "bg-green-600 text-white" : "text-gray-500 hover:text-black")}>Ativos</button>
                                <button onClick={() => setFilter('blocked')} className={cn("px-3 py-1.5 text-xs font-bold uppercase transition-all", filter === 'blocked' ? "bg-red-600 text-white" : "text-gray-500 hover:text-black")}>Blocks</button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-black text-white text-left uppercase text-xs tracking-wider border-b-4 border-black">
                                    <th className="p-4 border-r border-gray-700">Aluno</th>
                                    <th className="p-4 border-r border-gray-700">Plano</th>
                                    <th className="p-4 border-r border-gray-700">Data Compra</th>
                                    <th className="p-4 border-r border-gray-700">Valor</th>
                                    <th className="p-4 border-r border-gray-700">Status</th>
                                    <th className="p-4 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-100">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className={cn("hover:bg-yellow-50 transition-colors font-medium border-b border-gray-100", lead.status === 'blocked' ? 'bg-red-50/50' : '')}>
                                        <td className="p-4 border-r border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{lead.name || 'Sem Nome'}</span>
                                                <span className="text-xs text-gray-500">{lead.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            <span className={cn(
                                                "px-2 py-1 rounded border-2 text-[10px] uppercase font-black tracking-wider",
                                                lead.plan === 'pro' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                    lead.plan === 'advanced' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                        "bg-gray-100 text-gray-600 border-gray-200"
                                            )}>
                                                {lead.plan}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r border-gray-100 text-sm text-gray-600">
                                            {lead.purchase_date ? format(new Date(lead.purchase_date), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="p-4 border-r border-gray-100 text-gray-900 font-bold">
                                            R$ {lead.purchase_price?.toFixed(2)}
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            {lead.status === 'active' ? (
                                                <span className="flex items-center gap-1.5 text-green-700 font-bold text-xs uppercase">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase">
                                                    <div className="h-2 w-2 rounded-full bg-red-500" /> Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(lead.id, lead.status)}
                                                className={cn(
                                                    "p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all",
                                                    lead.status === 'active' ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                                                )}
                                                title={lead.status === 'active' ? "Bloquear Acesso" : "Liberar Acesso"}
                                            >
                                                {lead.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
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
                                        onChange={e => setNewUser({ ...newUser, plan: e.target.value })}
                                    >
                                        <option value="start">Start (R$ 49,90)</option>
                                        <option value="pro">Pro (R$ 129,90)</option>
                                        <option value="advanced">Advanced (R$ 199,90)</option>
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
