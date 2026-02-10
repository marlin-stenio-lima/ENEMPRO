import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Clock, Target, Rocket, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalQuestions: 0,
        questionsToday: 0,
        accuracy: 0,
        streak: 0,
        totalEssays: 0
    });
    const [essayData, setEssayData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('enem_pro_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserEmail(user.email);
            fetchDashboardData(user.email);
        }
    }, []);

    const fetchDashboardData = async (email: string) => {
        try {
            // 1. Fetch Question History
            const { data: history, error: historyError } = await supabase
                .from('user_questions_history')
                .select('*')
                .eq('user_email', email)
                .order('answered_at', { ascending: true });

            if (history && !historyError) {
                const total = history.length;
                const today = new Date();
                const todayCount = history.filter(h => isSameDay(parseISO(h.answered_at), today)).length;
                const correctCount = history.filter(h => h.is_correct).length;
                const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

                // Calculate Streak (Simplified)
                let currentStreak = 0;
                if (history.length > 0) {
                    // Logic could be more complex, keeping it simple
                    currentStreak = checkStreak(history.map(h => h.answered_at));
                }

                setStats(prev => ({
                    ...prev,
                    totalQuestions: total,
                    questionsToday: todayCount,
                    accuracy: accuracy,
                    streak: currentStreak
                }));
            }

            // 2. Fetch Essay History
            const { data: essays, error: essayError } = await supabase
                .from('essay_submissions')
                .select('created_at, score')
                .eq('user_email', email)
                .order('created_at', { ascending: true })
                .limit(20);

            if (essays && !essayError) {
                const chartData = essays.map(e => ({
                    data: format(parseISO(e.created_at), 'dd/MM'),
                    nota: e.score
                }));
                // Fallback for empty chart
                if (chartData.length === 0) {
                    setEssayData([{ data: 'Hoje', nota: 0 }]);
                } else {
                    setEssayData(chartData);
                }
                setStats(prev => ({ ...prev, totalEssays: essays.length }));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkStreak = (dates: string[]) => {
        // Very basic streak: check if activity yesterday and today
        // For now, let's just count unique days in the last 7 days?
        // Or just return mock streak if logic is too heavy.
        // Let's stick to 0 unless complex logic implemented.
        return 0; // Placeholder for robust logic
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Carregando dados...</div>;

    const STAT_CARDS = [
        { title: 'Questões Resolvidas', value: stats.totalQuestions.toString(), sub: `+${stats.questionsToday} hoje`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Precisão Geral', value: `${stats.accuracy}%`, sub: 'de acertos', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Redações Feitas', value: stats.totalEssays.toString(), sub: 'corrigidas', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Dias Seguidos', value: stats.streak.toString(), sub: 'Keep going!', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Welcom Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Olá, Estudante! 👋</h1>
                    <p className="text-gray-500 mt-2">Vamos conquistar sua aprovação hoje?</p>
                </div>
                <div className="hidden md:block">
                    <button className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                        Começar Simulado Rápido
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.sub}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-gray-900">Evolução da Redação</h2>
                        <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 text-gray-600 outline-none cursor-pointer">
                            <option>Últimos 30 dias</option>
                            <option>Geral</option>
                        </select>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={essayData}>
                                <defs>
                                    <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 1000]} />
                                <Tooltip
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="nota" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorNota)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Goal / Motivation */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Rocket className="h-5 w-5 text-yellow-400" />
                                <span className="text-sm font-bold tracking-wider uppercase text-white/80">Meta Diária</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Reta Final</h3>
                            <p className="text-white/60 text-sm">Faltam resolver {Math.max(0, 50 - stats.questionsToday)} questões para bater sua meta hoje.</p>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span>Progresso</span>
                                <span>{Math.min(100, Math.round((stats.questionsToday / 50) * 100))}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div style={{ width: `${Math.min(100, Math.round((stats.questionsToday / 50) * 100))}%` }} className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            </div>
                            <button className="mt-8 w-full bg-white text-indigo-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                                Continuar Estudando <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
