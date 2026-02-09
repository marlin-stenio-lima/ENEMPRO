import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { sendMessageToAssistant } from '../../lib/ai-service';
import { cn } from '../../lib/utils';

interface ChatInterfaceProps {
    personaId: string;
    personaName: string;
    description: string;
    onBack: () => void;
    context?: {
        topic?: string;
        essayText?: string;
        correction?: any;
    };
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    feedback?: 'like' | 'dislike';
}

// Simple Markdown Parser (unchanged)
const SimpleMarkdown = ({ content }: { content: string }) => {
    // ... (same as before, keeping it brief for diff)
    const parts = content.split(/```/);
    return (
        <div className="space-y-2">
            {parts.map((part, i) => {
                if (i % 2 === 1) {
                    return <pre key={i} className="bg-black/90 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono my-2"><code>{part.trim()}</code></pre>;
                }
                return (
                    <div key={i} className="whitespace-pre-wrap">
                        {part.split('\n').map((line, j) => {
                            const boldParts = line.split(/(\*\*.*?\*\*)/);
                            return (
                                <div key={j} className="min-h-[1.2em]">
                                    {boldParts.map((subPart, k) => {
                                        if (subPart.startsWith('**') && subPart.endsWith('**')) {
                                            return <strong key={k}>{subPart.slice(2, -2)}</strong>;
                                        }
                                        return <span key={k}>{subPart}</span>;
                                    })}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default function ChatInterface({ personaId, personaName, description, onBack, context }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: context?.correction
                ? `Olá! Vi que você já tem uma correção para o tema **"${context.topic}"**. Quer tirar dúvidas sobre ela ou falar sobre outra coisa?`
                : context?.essayText
                    ? `Olá! Vejo que você começou a escrever sobre **"${context.topic || 'um tema'}"**. Quer ajuda com argumentos ou estrutura?`
                    : `Olá! Sou **${personaName}**. ${description} Como posso te ajudar hoje?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, feedback: type } : msg
        ));

        if (type === 'like') {
            // "Learn" from this interaction
            const msg = messages.find(m => m.id === messageId);
            if (msg) {
                const learned = localStorage.getItem('enem_pro_learned_context') || '';
                // Clean greeting and keep a snippet
                const contentWithoutGreeting = msg.content.replace(/^(Olá|Oi|Ei).*?[.!?:;]\s*/i, '').trim();
                // Append this as a good example (limit size)
                const newContext = (learned + `\n- EXEMPLO DE BOA FORMATAÇÃO: "${contentWithoutGreeting.substring(0, 300)}..."`).slice(-3000);
                localStorage.setItem('enem_pro_learned_context', newContext);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Inject learned context
            const learnedContext = localStorage.getItem('enem_pro_learned_context') || '';

            const responseText = await sendMessageToAssistant(input, personaId as any, {
                ...context,
                learnedContext
            });

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        {personaName} <span className="text-xs font-normal text-gray-500 py-0.5 px-2 bg-gray-200 rounded-full">IA Tutor</span>
                    </h2>
                    <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                            msg.role === 'user' ? "bg-black text-white" : "bg-indigo-100 text-indigo-600"
                        )}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col gap-1 max-w-[80%]">
                            <div className={cn(
                                "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? "bg-black text-white rounded-tr-none"
                                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none"
                            )}>
                                <SimpleMarkdown content={msg.content} />
                            </div>

                            {/* Feedback Buttons for Assistant */}
                            {msg.role === 'assistant' && (
                                <div className="flex items-center gap-2 mt-1 ml-2">
                                    <button
                                        onClick={() => handleFeedback(msg.id, 'like')}
                                        className={cn(
                                            "p-1 rounded-full transition-colors",
                                            msg.feedback === 'like' ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-100"
                                        )}
                                        title="Gostei da resposta"
                                    >
                                        <ThumbsUp className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(msg.id, 'dislike')}
                                        className={cn(
                                            "p-1 rounded-full transition-colors",
                                            msg.feedback === 'dislike' ? "bg-red-100 text-red-600" : "text-gray-400 hover:bg-gray-100"
                                        )}
                                        title="Não gostei"
                                    >
                                        <ThumbsDown className="h-3 w-3" />
                                    </button>
                                    {msg.feedback === 'like' && <span className="text-[10px] text-green-600 font-medium">Aprendido!</span>}
                                    {msg.feedback === 'dislike' && <span className="text-[10px] text-red-600 font-medium">Registrado.</span>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Digite sua dúvida..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none resize-none max-h-32 min-h-[50px]"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="h-[50px] w-[50px] flex items-center justify-center bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                    IA pode aprender com seu feedback.
                </p>
            </div>
        </div>
    );
}
