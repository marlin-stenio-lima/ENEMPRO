import { useState, useEffect } from 'react';
import { FileText, Sparkles, AlertCircle, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SavedContent {
    id: string; // Video ID
    title: string;
    channel: string;
    thumb: string;
    subject?: string;
    note?: string;
    summary?: string;
}

export default function Notebook() {
    const [items, setItems] = useState<SavedContent[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        // Load all data sources
        const notesRaw = localStorage.getItem('enem_pro_video_notes');
        const summariesRaw = localStorage.getItem('enem_pro_video_summaries');
        const metaRaw = localStorage.getItem('enem_pro_video_meta');

        const notes = notesRaw ? JSON.parse(notesRaw) : {};
        const summaries = summariesRaw ? JSON.parse(summariesRaw) : {};
        const meta = metaRaw ? JSON.parse(metaRaw) : {};

        // Merge into a single list
        const allIds = new Set([...Object.keys(notes), ...Object.keys(summaries)]);
        const mergedItems: SavedContent[] = [];

        allIds.forEach(id => {
            if (notes[id] || summaries[id]) { // Only if there is content
                mergedItems.push({
                    id,
                    title: meta[id]?.title || 'Aula Salva',
                    channel: meta[id]?.channel || 'Canal Desconhecido',
                    thumb: meta[id]?.thumb, // logic to fallback if needed
                    subject: meta[id]?.subject || 'Geral',
                    note: notes[id],
                    summary: summaries[id]
                });
            }
        });

        setItems(mergedItems.reverse()); // Newest first (if keys preserve insertion order roughly, or technically just arbitrary)
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const openVideo = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 font-sans space-y-8">
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Meu Caderno Inteligente</h1>
                <p className="text-gray-500 mt-2 text-lg">Seus resumos e anotações.</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-white px-4 py-3 rounded-full inline-flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                        <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Seu caderno está vazio</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Assista às aulas na aba <strong>Vídeos</strong> e gere resumos ou faça anotações para vê-los aqui.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {items.map((item) => {
                        const isExpanded = expandedId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "bg-white border-2 border-black transition-all duration-300 overflow-hidden",
                                    isExpanded ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "hover:bg-gray-50 shadow-sm"
                                )}
                            >
                                {/* Minimalist Header (Always Visible) */}
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="p-4 flex items-center gap-4 cursor-pointer select-none"
                                >
                                    {/* Thumb Icon or Small Img */}
                                    <div className="h-16 w-24 bg-gray-100 shrink-0 border border-gray-200 relative overflow-hidden group">
                                        {item.thumb ? (
                                            <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                                        ) : <PlayCircle className="p-6 text-gray-300 w-full h-full" />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm">
                                                {item.subject}
                                            </span>
                                            <h3 className="font-bold text-gray-900 truncate text-sm md:text-base uppercase flex-1">{item.title}</h3>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="font-medium">{item.channel}</span>
                                            <div className="h-3 w-px bg-gray-300"></div>

                                            {/* Indicators */}
                                            {item.note && (
                                                <span className="flex items-center gap-1 text-amber-600 font-bold">
                                                    <FileText className="h-3 w-3" /> Nota
                                                </span>
                                            )}
                                            {item.summary && (
                                                <span className="flex items-center gap-1 text-indigo-600 font-bold">
                                                    <Sparkles className="h-3 w-3" /> Resumo
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Toggle Icon */}
                                    <div className="text-gray-400 pl-2">
                                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t-2 border-black p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Personal Note */}
                                            {item.note && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 font-bold text-amber-600 uppercase text-xs tracking-wider border-b border-amber-200 pb-2">
                                                        <FileText className="h-4 w-4" /> Minha Anotação
                                                    </div>
                                                    <div className="bg-amber-50 p-4 border-l-4 border-amber-400 text-gray-800 text-sm italic leading-relaxed whitespace-pre-wrap shadow-sm">
                                                        "{item.note}"
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Summary */}
                                            {item.summary && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 font-bold text-indigo-600 uppercase text-xs tracking-wider border-b border-indigo-200 pb-2">
                                                        <Sparkles className="h-4 w-4" /> Resumo Inteligente
                                                    </div>
                                                    <div className="bg-indigo-50 p-4 border-l-4 border-indigo-400 text-gray-800 text-sm leading-relaxed max-h-[400px] overflow-y-auto pr-2 shadow-sm custom-scrollbar">
                                                        <div className="opacity-90 prose prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                                                            {item.summary.split('\n').map((line, i) => (
                                                                <p key={i} className="mb-1">{line.replace(/#|\*/g, '')}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                onClick={(e) => openVideo(e, item.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                            >
                                                <PlayCircle className="h-4 w-4" /> Ver Aula Completa
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
