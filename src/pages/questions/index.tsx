import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Filter, Search, BookOpen, Bot, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

// Dynamic import for AI to keep bundle size optimized if we expand it later
// import { generateExplanation } from '../../lib/ai-service';

interface Question {
    id: string;
    exam_name: string;
    year: number | null;
    day: number | null;
    question_number: string;
    text: string;
    answer: string | null;
    images: string[];
    // Derived
    area?: string;
    subject?: string;
}

const AREAS = [
    { id: 'matematica', label: 'Matemática' },
    { id: 'natureza', label: 'Ciências da Natureza' },
    { id: 'humanas', label: 'Ciências Humanas' },
    { id: 'linguagens', label: 'Linguagens e Códigos' },
];

export default function QuestionBank() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<any | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Filters
    const [yearFilter, setYearFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Reset state when question changes
    useEffect(() => {
        setSelectedOption(null);
        setIsVerified(false);
        setAiExplanation(null);
        setLoadingAI(false);
    }, [currentIndex]);

    // Apply Client-Side Filters when filter state changes
    useEffect(() => {
        // In a real app with pagination, this would re-fetch. 
        // For this demo with 1000 limit, client-side filtering of the "questions" array 
        // is tricky if valid questions are filtered out.
        // Let's re-fetch to be safe and simple.
        fetchQuestions();
    }, [yearFilter, dayFilter, areaFilter, searchText]);

    const cleanQuestionText = (text: string) => {
        if (!text) return null;
        let cleaned = text;
        cleaned = cleaned.replace(/(ENEM\d{4})+/g, '');
        const footerRegex = /•\s*(CIÊNCIAS|LINGUAGENS|MATEMÁTICA).*/i;
        cleaned = cleaned.replace(footerRegex, '');
        cleaned = cleaned.replace(/^QUESTÃO\s+\d+\s*/i, '');
        cleaned = cleaned.replace(/\*\d+[A-Z]+\d+\*/g, '');
        return cleaned.trim();
    };

    const classifyQuestion = (q: Question) => {
        const num = parseInt(q.question_number);
        const day = q.day;
        if (day === 1) {
            if (num >= 1 && num <= 45) return 'linguagens';
            if (num >= 46 && num <= 90) return 'humanas';
        } else if (day === 2) {
            if (num >= 91 && num <= 135) return 'natureza';
            if (num >= 136 && num <= 180) return 'matematica';
        }
        const text = q.text.toLowerCase();
        if (text.includes("matemática") || text.includes("cálculo")) return 'matematica';
        if (text.includes("biologia") || text.includes("química") || text.includes("física")) return 'natureza';
        return 'outros';
    };

    const fetchQuestions = async () => {
        setLoading(true);
        let query = supabase
            .from('questions')
            .select('*')
            .order('year', { ascending: false })
            .order('id', { ascending: true })
            .limit(1000);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching questions:', error);
        } else {
            let processed = (data || []).map(q => ({
                ...q,
                area: classifyQuestion(q)
            }));

            // Filter in memory for responsiveness demo
            if (yearFilter) processed = processed.filter(q => q.year === parseInt(yearFilter));
            if (dayFilter) processed = processed.filter(q => q.day === parseInt(dayFilter));
            if (areaFilter) processed = processed.filter(q => q.area === areaFilter);
            if (searchText) processed = processed.filter(q => q.text.toLowerCase().includes(searchText.toLowerCase()));

            setQuestions(processed);
            setCurrentIndex(0);
        }
        setLoading(false);
    };

    const handleVerify = async () => {
        if (!selectedOption) return;
        setIsVerified(true);
        // AI is NOT triggered automatically anymore
    };

    const handleGenerateAI = async () => {
        setLoadingAI(true);
        try {
            const { generateExplanation } = await import('../../lib/ai-service');
            const explanation = await generateExplanation(questions[currentIndex].text, questions[currentIndex].answer || 'A', selectedOption || 'A');
            setAiExplanation(explanation);
        } catch (e) {
            console.error(e);
        }
        setLoadingAI(false);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const currentQuestion = questions[currentIndex];
    const options = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="max-w-4xl mx-auto pb-12 font-sans space-y-6">
            {/* Header: Progress & Filters Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Modo Simulado</h1>
                    {!loading && questions.length > 0 && (
                        <p className="text-sm text-gray-500">Questão {currentIndex + 1} de {questions.length}</p>
                    )}
                </div>

                {/* Filters - Compact Row */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-black w-full"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                    >
                        <option value="">Área</option>
                        {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                    <select
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="">Ano</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </div>
            ) : !currentQuestion ? (
                <div className="text-center p-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">Nenhuma questão encontrada com esses filtros.</p>
                    <button onClick={() => { setYearFilter(''); setAreaFilter(''); setSearchText(''); }} className="mt-4 text-blue-600 hover:underline">Limpar Filtros</button>
                </div>
            ) : (
                <>
                    {/* Question Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        {/* Meta */}
                        <div className="flex gap-2 mb-6">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{currentQuestion.year}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Q.{currentQuestion.question_number}</span>
                            {currentQuestion.area && (
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide",
                                    currentQuestion.area === 'natureza' ? "bg-green-50 text-green-600" :
                                        currentQuestion.area === 'humanas' ? "bg-orange-50 text-orange-600" :
                                            currentQuestion.area === 'matematica' ? "bg-blue-50 text-blue-600" :
                                                "bg-purple-50 text-purple-600"
                                )}>
                                    {currentQuestion.area}
                                </span>
                            )}
                        </div>

                        {/* Text */}
                        <div className="prose prose-slate max-w-none mb-8 text-gray-800 leading-relaxed font-normal">
                            {cleanQuestionText(currentQuestion.text)?.split('\n').map((p, i) => p.trim() && <p key={i} className="mb-4">{p}</p>)}
                        </div>

                        {/* Images */}
                        {currentQuestion.images && currentQuestion.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                {currentQuestion.images.map((img, idx) => (
                                    <img key={idx} src={img} className="max-h-[400px] object-contain mx-auto border border-gray-100 rounded-lg bg-gray-50 p-2" loading="lazy" />
                                ))}
                            </div>
                        )}

                        {/* Options */}
                        <div className="space-y-3">
                            {options.map((opt) => {
                                const isSelected = selectedOption === opt;
                                const isCorrect = currentQuestion.answer === opt;

                                // Styles
                                let containerClass = "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ";
                                if (isVerified) {
                                    if (isCorrect) containerClass += "border-green-500 bg-green-50/50 shadow-[0_0_0_1px_rgba(34,197,94,1)]";
                                    else if (isSelected && !isCorrect) containerClass += "border-red-500 bg-red-50/50";
                                    else containerClass += "border-gray-100 opacity-60";
                                } else {
                                    if (isSelected) containerClass += "border-black bg-gray-50 shadow-sm";
                                    else containerClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                                }

                                return (
                                    <div
                                        key={opt}
                                        onClick={() => !isVerified && setSelectedOption(opt)}
                                        className={containerClass}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors shrink-0",
                                            isVerified && isCorrect ? "bg-green-500 text-white border-green-500" :
                                                isVerified && isSelected && !isCorrect ? "bg-red-500 text-white border-red-500" :
                                                    isSelected ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-300"
                                        )}>
                                            {opt}
                                        </div>
                                        <span className="font-medium text-gray-700">Alternativa {opt}</span>
                                        {isVerified && isCorrect && <span className="ml-auto text-green-600 font-bold text-xs uppercase tracking-wider">Correta</span>}
                                        {isVerified && isSelected && !isCorrect && <span className="ml-auto text-red-600 font-bold text-xs uppercase tracking-wider">Sua escolha</span>}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-50">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <span className="flex items-center gap-2"><ChevronDown className="rotate-90 h-4 w-4" /> Anterior</span>
                            </button>

                            {!isVerified ? (
                                <button
                                    onClick={handleVerify}
                                    disabled={!selectedOption}
                                    className="px-8 py-2.5 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                                >
                                    Verificar Resposta
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-2.5 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 shadow-md flex items-center gap-2 transition-all hover:pr-6"
                                >
                                    Próxima <ChevronDown className="rotate-[-90deg] h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* AI Assistant Section */}
                    {isVerified && (
                        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm animate-in slide-in-from-bottom-4 duration-500">

                            {/* Header or CTA */}
                            {!aiExplanation && !loadingAI ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-indigo-900">
                                        <Bot className="h-5 w-5" />
                                        <span className="font-semibold">Ficou com dúvida?</span>
                                    </div>

                                    {/* Only show button if WRONG answer, as per request */}
                                    {selectedOption !== currentQuestion.answer && (
                                        <button
                                            onClick={handleGenerateAI}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Gerar Análise IA
                                        </button>
                                    )}
                                    {selectedOption === currentQuestion.answer && (
                                        <p className="text-sm text-green-600 font-medium">Você acertou! Nenhuma análise necessária.</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-4">
                                        <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <Bot className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-indigo-950">Tutor IA</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <p className="text-indigo-600/80 text-xs font-semibold uppercase tracking-wider">Análise em Tempo Real</p>
                                            </div>
                                        </div>
                                    </div>

                                    {loadingAI ? (
                                        <div className="space-y-4 max-w-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="h-2 w-2 bg-indigo-300 rounded-full animate-bounce"></div>
                                            </div>
                                            <div className="h-4 bg-indigo-100/50 rounded w-3/4 animate-pulse" />
                                            <div className="h-4 bg-indigo-100/50 rounded w-full animate-pulse" />
                                        </div>
                                    ) : aiExplanation ? (
                                        <div className="space-y-6 text-indigo-900/80">
                                            {/* Context */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-gray-400" />
                                                    Contexto
                                                </h4>
                                                <p className="leading-relaxed text-sm bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">{aiExplanation.context}</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                                                    <h4 className="font-bold text-green-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        Alternativa {currentQuestion.answer} (Correta)
                                                    </h4>
                                                    <p className="text-green-900 text-sm leading-relaxed">{aiExplanation.correctAnalysis}</p>
                                                </div>

                                                <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                                                    <h4 className="font-bold text-red-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                        Por que as outras falham?
                                                    </h4>
                                                    {typeof aiExplanation.alternativesAnalysis === 'string' ? (
                                                        <p className="text-red-900 text-sm leading-relaxed">{aiExplanation.alternativesAnalysis}</p>
                                                    ) : (
                                                        <ul className="text-red-900 text-sm leading-relaxed space-y-2 mt-2">
                                                            {Object.entries(aiExplanation.alternativesAnalysis).map(([key, value]) => (
                                                                <li key={key} className="flex gap-2">
                                                                    <span className="font-bold">{key}:</span>
                                                                    <span>{value as string}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
