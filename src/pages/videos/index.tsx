import { useState, useEffect } from 'react';
import { searchYouTubeVideos } from '../../lib/youtube';
import { Loader2, PlayCircle, Search, X, Sparkles, FileText, Save, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { analyzeVideoContent } from '../../lib/ai-service';

const SUBJECTS = [
    { id: 'matematica enem', label: 'Matemática', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { id: 'fisica enem', label: 'Física', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { id: 'quimica enem', label: 'Química', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { id: 'biologia enem', label: 'Biologia', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
    { id: 'historia enem', label: 'História', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    { id: 'geografia enem', label: 'Geografia', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { id: 'portugues enem', label: 'Linguagens', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { id: 'redacao enem', label: 'Redação', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
];

export default function VideoLessons() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('matematica enem');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    // Analysis State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Sidebar State
    const [sidebarMode, setSidebarMode] = useState<'analysis' | 'notes' | null>(null);
    const [note, setNote] = useState('');
    const [allNotes, setAllNotes] = useState<Record<string, string>>({});
    const [allSummaries, setAllSummaries] = useState<Record<string, string>>({});
    const [allMeta, setAllMeta] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Load notes and summaries from local storage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('enem_pro_video_notes');
        const savedSummaries = localStorage.getItem('enem_pro_video_summaries');
        const savedMeta = localStorage.getItem('enem_pro_video_meta');

        if (savedNotes) { try { setAllNotes(JSON.parse(savedNotes)); } catch (e) { console.error("Failed to parse notes", e); } }
        if (savedSummaries) { try { setAllSummaries(JSON.parse(savedSummaries)); } catch (e) { console.error("Failed to parse summaries", e); } }
        if (savedMeta) { try { setAllMeta(JSON.parse(savedMeta)); } catch (e) { console.error("Failed to parse meta", e); } }
    }, []);

    useEffect(() => {
        handleSearch();
    }, [selectedSubject]);

    // Reset analysis and load note/summary when changing video
    useEffect(() => {
        if (!selectedVideo) {
            setAnalysis(null);
            setIsAnalyzing(false);
        } else {
            const videoId = selectedVideo.id.videoId || selectedVideo.id;
            setNote(allNotes[videoId] || '');

            // Check for cached summary
            if (allSummaries[videoId]) {
                setAnalysis(allSummaries[videoId]);
            } else {
                setAnalysis(null);
            }
        }
    }, [selectedVideo]);

    const saveVideoMeta = (video: any) => {
        const videoId = video.id.videoId || video.id;
        const subjectLabel = SUBJECTS.find(s => s.id === selectedSubject)?.label || 'Geral';

        const meta = {
            title: video.snippet.title,
            channel: video.snippet.channelTitle,
            thumb: video.snippet.thumbnails.medium.url,
            subject: subjectLabel
        };
        const newMeta = { ...allMeta, [videoId]: meta };
        setAllMeta(newMeta);
        localStorage.setItem('enem_pro_video_meta', JSON.stringify(newMeta));
    };

    const handleSaveNote = () => {
        if (!selectedVideo) return;
        setIsSaving(true);
        const videoId = selectedVideo.id.videoId || selectedVideo.id;
        const updatedNotes = { ...allNotes, [videoId]: note };

        setAllNotes(updatedNotes);
        localStorage.setItem('enem_pro_video_notes', JSON.stringify(updatedNotes));
        saveVideoMeta(selectedVideo);

        setTimeout(() => setIsSaving(false), 2000);
    };

    const handleSearch = async (overrideQuery?: string) => {
        setLoading(true);

        // Handle "Saved" filter specifically
        if (selectedSubject === 'saved') {
            // Need to mock this slightly since we don't store full video objects in localstorage, 
            // but for a demo we can just filter the current view or show a message.
            // Better approach for now: Just show the badges on the existing grid.
            // Let's stick to subject search but we could implement a 'favorites' system later.
            // For now, re-triggering search but we will rely on VISUAL BADGES.
        }

        const query = overrideQuery || (searchQuery ? `${searchQuery} enem` : selectedSubject);
        const results = await searchYouTubeVideos(query);
        setVideos(results);
        setLoading(false);
    };

    const handleInputReturn = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch(searchQuery);
    }

    const handleAnalyze = async (forceRegenerate = false) => {
        if (!selectedVideo) return;

        const videoId = selectedVideo.id.videoId || selectedVideo.id;

        // Use Cache if available and not forcing regeneration
        if (!forceRegenerate && allSummaries[videoId]) {
            setAnalysis(allSummaries[videoId]);
            return;
        }

        setIsAnalyzing(true);
        const result = await analyzeVideoContent(selectedVideo.snippet.title, selectedVideo.snippet.channelTitle);
        setAnalysis(result);

        // Save to Cache
        const updatedSummaries = { ...allSummaries, [videoId]: result };
        setAllSummaries(updatedSummaries);
        localStorage.setItem('enem_pro_video_summaries', JSON.stringify(updatedSummaries));
        saveVideoMeta(selectedVideo);

        setIsAnalyzing(false);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 font-sans space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vídeo Aulas</h1>
                    <p className="text-gray-500 text-sm">Os melhores conteúdos do YouTube selecionados para você.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar aula específica..."
                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-black transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleInputReturn}
                    />
                </div>
            </div>

            {/* Subject Filters (Pills) */}
            <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(subj => (
                    <button
                        key={subj.id}
                        onClick={() => { setSelectedSubject(subj.id); setSearchQuery(''); }}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent",
                            selectedSubject === subj.id
                                ? "bg-black text-white shadow-md transform scale-105"
                                : `${subj.color} opacity-80 hover:opacity-100`
                        )}
                    >
                        {subj.label}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => {
                        const videoId = video.id.videoId || video.id;
                        const hasNote = !!allNotes[videoId];
                        const hasSummary = !!allSummaries[videoId];

                        return (
                            <div
                                key={videoId}
                                onClick={() => setSelectedVideo(video)}
                                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer block relative"
                            >
                                {/* Badges for Saved Content */}
                                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                                    {hasNote && (
                                        <div className="bg-amber-100 text-amber-700 p-1.5 rounded-md border border-amber-200 shadow-sm" title="Tem anotação">
                                            <FileText className="h-3 w-3" />
                                        </div>
                                    )}
                                    {hasSummary && (
                                        <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md border border-indigo-200 shadow-sm" title="Resumo IA disponível">
                                            <Sparkles className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    <img
                                        src={video.snippet.thumbnails.medium.url}
                                        alt={video.snippet.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="h-12 w-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                            <PlayCircle className="h-6 w-6 text-red-600 fill-current" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors text-sm">
                                        {video.snippet.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{video.snippet.channelTitle}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {videos.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            Nenhuma aula encontrada. Tente outra busca.
                        </div>
                    )}
                </div>
            )}

            {/* Video Player Modal - BRUTALIST REFACTOR */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 md:p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full h-full max-w-[1600px] flex flex-col md:flex-row border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] relative animate-in zoom-in-95 duration-200">

                        {/* Close Button - Brutalist Square */}
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute -top-4 -right-4 md:-top-6 md:-right-6 z-50 w-12 h-12 flex items-center justify-center bg-red-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            <X className="h-6 w-6 stroke-[3]" />
                        </button>

                        {/* Video Column */}
                        <div className="flex-1 flex flex-col h-full bg-black relative min-h-[40%] md:min-h-0 border-r-0 md:border-r-4 border-black">
                            <div className="flex-1 relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                                <iframe
                                    className="w-full h-full absolute inset-0"
                                    src={`https://www.youtube.com/embed/${selectedVideo.id.videoId || selectedVideo.id}?autoplay=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Toolbar below video */}
                            <div className="bg-white p-4 border-t-4 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                                <h2 className="font-bold text-gray-900 truncate flex-1 text-lg mr-4 font-mono" title={selectedVideo.snippet.title}>
                                    {selectedVideo.snippet.title.toUpperCase()}
                                </h2>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setSidebarMode(sidebarMode === 'notes' ? null : 'notes')}
                                        className={cn(
                                            "flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-1 active:shadow-none uppercase tracking-wide",
                                            sidebarMode === 'notes' ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-gray-50"
                                        )}
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span className="hidden md:inline">Anotações</span>
                                    </button>

                                    {!analysis && !isAnalyzing ? (
                                        <button
                                            onClick={() => {
                                                setSidebarMode('analysis');
                                                handleAnalyze();
                                            }}
                                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white border-2 border-black font-bold text-sm hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none uppercase tracking-wide"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            <span className="hidden md:inline">Gerar Resumo IA</span>
                                            <span className="md:hidden">IA</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSidebarMode(sidebarMode === 'analysis' ? null : 'analysis')}
                                            className={cn(
                                                "flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none uppercase tracking-wide",
                                                sidebarMode === 'analysis' ? "bg-indigo-200 text-indigo-900" : "bg-white text-black hover:bg-gray-50"
                                            )}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            <span className="hidden md:inline">Ver Resumo</span>
                                            <span className="md:hidden">Resumo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column (Fixed Width on Desktop, Overlay/Stack on Mobile) */}
                        {sidebarMode && (
                            <div className="w-full md:w-[450px] shrink-0 bg-white flex flex-col animate-in slide-in-from-right duration-300 z-20 h-1/2 md:h-full border-t-4 md:border-t-0 border-black shadow-none">
                                {/* Sidebar Header */}
                                <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-50">
                                    <h3 className="font-black text-black uppercase tracking-tight flex items-center gap-2 text-lg">
                                        {sidebarMode === 'analysis' ? (
                                            <><Sparkles className="h-5 w-5 text-indigo-600" /> Resumo Inteligente</>
                                        ) : (
                                            <><FileText className="h-5 w-5 text-amber-600" /> Minhas Anotações</>
                                        )}
                                    </h3>
                                    <button onClick={() => setSidebarMode(null)} className="md:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Sidebar Content */}
                                <div className="flex-1 overflow-y-auto p-6 bg-white">
                                    {sidebarMode === 'analysis' ? (
                                        isAnalyzing ? (
                                            <div className="flex flex-col items-center justify-center h-full text-black gap-6 text-center p-8">
                                                <div className="h-16 w-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <div className="font-mono text-sm font-bold bg-yellow-300 p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    ANALISANDO CONTEÚDO...
                                                </div>
                                            </div>
                                        ) : analysis ? (
                                            <div className="prose prose-sm prose-p:text-black prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-black prose-li:text-black leading-relaxed">
                                                {analysis.split('\n').map((line, i) => (
                                                    <div key={i}>
                                                        {line.startsWith('## ') ? (
                                                            <h3 className="text-xl font-black mt-6 mb-3 text-black border-b-4 border-indigo-200 inline-block px-1 bg-indigo-50 transform -rotate-1">{line.replace('## ', '')}</h3>
                                                        ) : line.startsWith('* **') ? (
                                                            <div className="mt-4 font-bold text-black bg-gray-100 p-2 border-l-4 border-black">{line.replace('* **', '').replace('**', '')}</div>
                                                        ) : line.startsWith('  * ') ? (
                                                            <div className="ml-4 text-gray-700 text-sm pl-4 border-l-2 border-dashed border-gray-300 my-2 italic">{line.replace('  * ', '')}</div>
                                                        ) : line.startsWith('- **') ? (
                                                            <li className="ml-4 list-square marker:text-black mb-2 font-medium">
                                                                <span className="bg-yellow-100 px-1 border border-black">{line.split('**')[1]}</span> {line.split('**')[2]}
                                                            </li>
                                                        ) : (
                                                            <p className="mb-2 font-medium">{line}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <textarea
                                                className="flex-1 w-full bg-yellow-50 border-4 border-black p-4 text-base text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-white resize-none font-mono leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                                placeholder="DIGITE SUAS OBSERVAÇÕES AQUI..."
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    onClick={handleSaveNote}
                                                    disabled={isSaving}
                                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black border-2 border-black font-black text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                                                >
                                                    {isSaving ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                                                    {isSaving ? 'SALVO!' : 'SALVAR NOTA'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
