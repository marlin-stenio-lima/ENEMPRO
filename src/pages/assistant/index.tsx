import { useState, useEffect } from 'react';
import { Brain, Calculator, Library, Sprout, Globe, MessageSquare } from 'lucide-react';
import ChatInterface from './ChatInterface';
import PlanGuard from '../../components/PlanGuard';

const PERSONAS = [
    {
        id: 'redacao',
        name: 'Sophia',
        role: 'Redação',
        description: 'Especialista em redação nota 1000. Foco em estrutura, gramática e competências.',
        icon: Brain,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'hover:border-rose-200'
    },
    {
        id: 'exatas',
        name: 'Newton',
        role: 'Matemática e Física',
        description: 'Mestre da lógica. Explico fórmulas e resolvo problemas passo a passo.',
        icon: Calculator,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'hover:border-blue-200'
    },
    {
        id: 'humanas',
        name: 'Dante',
        role: 'Humanas',
        description: 'Historiador e filósofo. Conecto fatos históricos e contextos sociais.',
        icon: Library,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'hover:border-amber-200'
    },
    {
        id: 'natureza',
        name: 'Darwin',
        role: 'Natureza',
        description: 'Cientista curioso. Desvendo a biologia e a química do mundo.',
        icon: Sprout,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'hover:border-emerald-200'
    },
    {
        id: 'geografia',
        name: 'Atlas',
        role: 'Geo e Atualidades',
        description: 'Analista global. Entenda geopolítica, economia e meio ambiente.',
        icon: Globe,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'hover:border-indigo-200'
    }
];

export default function AssistantHub() {
    const [selectedPersona, setSelectedPersona] = useState<typeof PERSONAS[0] | null>(null);
    const [userPlan, setUserPlan] = useState('start');

    useEffect(() => {
        const userStr = localStorage.getItem('enem_pro_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserPlan(user.plan || 'start');
        }
    }, []);

    // If redirected from other pages with a pre-selected persona (via URL state or context - simplified here)
    // In a real app we might check location.state

    if (selectedPersona) {
        return (
            <ChatInterface
                personaId={selectedPersona.id}
                personaName={selectedPersona.name}
                description={selectedPersona.description}
                onBack={() => setSelectedPersona(null)}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Central de Assistentes IA</h1>
                <p className="text-gray-500 mt-2">Escolha um especialista para tirar suas dúvidas e aprender mais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PERSONAS.map((persona) => {
                    const isRestricted = persona.id !== 'redacao';

                    const CardContent = (
                        <button
                            onClick={() => setSelectedPersona(persona)}
                            className={`w-full text-left bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group bg-white ${persona.border}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${persona.bg} p-4 rounded-xl transition-colors group-hover:scale-105 duration-300`}>
                                    <persona.icon className={`h-8 w-8 ${persona.color}`} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                    {persona.role}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-black mb-1">
                                {persona.name}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {persona.description}
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-black transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                Iniciar Conversa
                            </div>
                        </button>
                    );

                    if (isRestricted) {
                        return (
                            <PlanGuard
                                key={persona.id}
                                requiredPlan="pro"
                                userPlan={userPlan}
                                featureName={`Agent ${persona.name}`}
                            >
                                {CardContent}
                            </PlanGuard>
                        );
                    }

                    return <div key={persona.id}>{CardContent}</div>;
                })}
            </div>
        </div>
    );
}
