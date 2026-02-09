import { useState, useEffect } from 'react';
import { PenTool, Send, Sparkles, BookOpen, X, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateEssayTopic, gradeEssay } from '../../lib/ai-service';
import ChatInterface from '../assistant/ChatInterface';
import ExtraEssayModal from '../../components/ExtraEssayModal';
import { supabase } from '../../lib/supabase';

const PLAN_LIMITS = {
    'start': 2,
    'pro': 4,
    'advanced': 15
};

export default function EssayGrader() {
    const [essay, setEssay] = useState('');
    const [topic, setTopic] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showAssistant, setShowAssistant] = useState(false);
    const [showExtraModal, setShowExtraModal] = useState(false);

    // User State
    const [userPlan, setUserPlan] = useState('start');
    const [essaysUsed, setEssaysUsed] = useState(0);
    const [extraBalance, setExtraBalance] = useState(0);

    useEffect(() => {
        fetchUserUsage();
    }, []);

    const fetchUserUsage = async () => {
        try {
            const userStr = localStorage.getItem('enem_pro_user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            setUserPlan(user.plan || 'start');

            const { data, error } = await supabase
                .from('saas_leads')
                .select('essays_current_month, essays_extra_balance')
                .eq('email', user.email)
                .single();

            if (data) {
                setEssaysUsed(data.essays_current_month || 0);
                setExtraBalance(data.essays_extra_balance || 0);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleGenerateTopic = async () => {
        setIsGeneratingTopic(true);
        const newTopic = await generateEssayTopic();
        setTopic(newTopic);
        setIsGeneratingTopic(false);
    };

    const handleAnalyze = async () => {
        // Limit Check
        const limit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || 2;
        const hasPlanBalance = essaysUsed < limit;
        const hasExtraBalance = extraBalance > 0;

        if (!hasPlanBalance && !hasExtraBalance) {
            setShowExtraModal(true);
            return;
        }

        setIsAnalyzing(true);

        // Decrement logic (Simulated for frontend, ideally backend)
        try {
            const userStr = localStorage.getItem('enem_pro_user');
            const user = JSON.parse(userStr || '{}');

            if (hasPlanBalance) {
                await supabase.rpc('increment_essay_usage', { user_email: user.email });
                setEssaysUsed(prev => prev + 1);
            } else {
                await supabase.rpc('decrement_extra_balance', { user_email: user.email });
                setExtraBalance(prev => prev - 1);
            }

            // Call AI Service
            const aiResult = await gradeEssay(topic, essay);

            if (!aiResult) {
                throw new Error("Falha na correção");
            }

            setResult(aiResult);
        } catch (e) {
            console.error(e);
            alert("Erro ao processar uso. Tente novamente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col gap-6 font-sans pb-10 relative">
            {showExtraModal && (
                <ExtraEssayModal
                    onClose={() => setShowExtraModal(false)}
                    onSuccess={() => {
                        fetchUserUsage(); // Refresh balance
                        // Optionally auto-trigger analyze, but better let user click again
                    }}
                />
            )}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Tema da Redação
                        </label>
                        <input
                            type="text"
                            placeholder="Digite o tema ou gere um com IA..."
                            className="w-full text-lg font-medium text-gray-900 placeholder:text-gray-300 border-b-2 border-gray-200 focus:border-black outline-none py-2 transition-colors bg-transparent"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleGenerateTopic}
                        disabled={isGeneratingTopic}
                        className="w-full md:w-auto px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50 min-w-[160px]"
                    >
                        {isGeneratingTopic ? (
                            <Sparkles className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        {isGeneratingTopic ? "Gerando..." : "Gerar Tema IA"}
                    </button>
                    {/* Assistant Button */}
                    <button
                        onClick={() => setShowAssistant(true)}
                        className="w-full md:w-auto px-6 py-3 bg-rose-50 text-rose-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors min-w-[160px]"
                    >
                        <BookOpen className="h-4 w-4" />
                        Falar com Sophia
                    </button>
                </div>
            </div>

            {/* Writing Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative min-h-[500px]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-500">
                        <PenTool className="h-4 w-4" />
                        <span className="text-sm font-medium">Folha de Redação</span>
                    </div>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded",
                        essay.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                    )}>
                        {essay.split(/\s+/).filter(Boolean).length} palavras
                    </span>
                </div>

                <textarea
                    className="flex-1 p-8 text-lg leading-relaxed resize-none outline-none font-serif text-gray-800 focus:bg-yellow-50/10 transition-colors placeholder:text-gray-300 placeholder:font-sans"
                    placeholder="Comece seu texto aqui..."
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    spellCheck={false}
                />

                <div className="p-4 border-t border-gray-100 bg-white z-10">
                    <button
                        onClick={handleAnalyze}
                        disabled={essay.length < 50 || isAnalyzing || !topic.trim()}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                    >
                        {isAnalyzing ? (
                            <>Analisando Redação...</>
                        ) : (
                            <>
                                <Send className="h-4 w-4" /> Enviar para Correção IA
                            </>
                        )}
                    </button>
                </div>

                {/* Result Overlay */}
                {result && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 overflow-y-auto p-8 animate-in fade-in duration-300">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 text-green-600 rounded-full mb-4 shadow-lg shadow-green-100">
                                    <span className="text-3xl font-bold">{result.score}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Correção Concluída!</h2>
                                <p className="text-gray-500">Veja abaixo o detalhamento por competência.</p>
                            </div>

                            <div className="grid gap-4">
                                {result.competencies.map((comp: any) => (
                                    <div key={comp.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-gray-800">{comp.name}</h4>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                comp.score >= 160 ? "bg-green-100 text-green-700" :
                                                    comp.score >= 120 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {comp.score} / 200
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{comp.feedback}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full border border-gray-300 py-3 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Escrever Nova Redação
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Assistant Slide-over */}
            {showAssistant && (
                <div className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-30 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
                    <ChatInterface
                        personaId="redacao"
                        personaName="Sophia"
                        description="Corretora Especialista. Tire suas dúvidas sobre redação."
                        onBack={() => setShowAssistant(false)}
                        context={{
                            topic,
                            essayText: essay,
                            correction: result
                        }}
                    />
                </div>
            )}
        </div>
    );
}
