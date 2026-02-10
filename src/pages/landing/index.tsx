import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Star, Brain, BookOpen, BarChart, ShieldCheck, Play } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">

            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Enem.Pro</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition-colors">Planos</a>
                        <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Depoimentos</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Login</button>
                        <button onClick={() => navigate('/checkout')} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                            Começar Agora
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Star className="h-3 w-3 fill-indigo-700" />
                        Plataforma #1 em Aprovação
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-5xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Não estude mais sozinho. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sua Máquina de Aprovação com Inteligência Artificial.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        Diferente de cursos gravados onde você fica com a dúvida, aqui a nossa IA entende sua dificuldade específica em Física ou Redação e te explica até você aprender.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                        <button onClick={() => navigate('/checkout')} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                            Quero ser Aprovado
                            <ArrowRight className="h-5 w-5" />
                        </button>

                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-gray-400 animate-in fade-in duration-1000 delay-500">
                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Garantia de 7 dias</div>
                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Acesso Imediato</div>
                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pagamento Seguro</div>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Benefits vs Malefics Section */}
            <section className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que o Enem.Pro é diferente?</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Compare e veja por que milhares de alunos estão migrando para nossa plataforma.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* The Old Way / Malefics */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-xl">✕</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">Estudando Sozinho</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-500">
                                    <span className="text-red-400 mt-1">✕</span>
                                    <span>Perdido sem saber o que estudar primeiro</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-500">
                                    <span className="text-red-400 mt-1">✕</span>
                                    <span>Dúvidas acumuladas sem ninguém para ajudar</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-500">
                                    <span className="text-red-400 mt-1">✕</span>
                                    <span>Correção de redação demorada e genérica</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-500">
                                    <span className="text-red-400 mt-1">✕</span>
                                    <span>Procrastinação por falta de um plano claro</span>
                                </li>
                            </ul>
                        </div>

                        {/* The New Way / Benefits */}
                        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-600 shadow-xl relative overflow-hidden transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMENDADO</div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Com Enem.Pro</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span>Cronograma adaptativo que diz exatamente o que estudar</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span>Tutores IA 24h para tirar qualquer dúvida na hora</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span>Correção de redação instantânea e detalhada</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700 font-medium">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                                    <span>Foco total e evolução visível dia após dia</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>



            {/* Features Grid */}
            <section id="features" className="py-24 max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo o que você precisa em um só lugar.</h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">Esqueça os cursinhos tradicionais. Nossa metodologia foca no que realmente importa: sua evolução constante.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Brain className="h-8 w-8 text-indigo-600" />}
                        title="Professores IA 24h"
                        description="Tire dúvidas de Matemática, Física, Humanas e Redação a qualquer hora com nossos assistentes treinados."
                    />
                    <FeatureCard
                        icon={<BookOpen className="h-8 w-8 text-pink-600" />}
                        title="Correção Ilimitada"
                        description="Receba feedback detalhado sobre competências, gramática e estrutura da sua redação em segundos."
                    />
                    <FeatureCard
                        icon={<BarChart className="h-8 w-8 text-green-600" />}
                        title="Cronograma Adaptativo"
                        description="Um plano de estudos que se adapta à sua rotina e realoca matérias conforme seu desempenho."
                    />
                    <FeatureCard
                        icon={<Check className="h-8 w-8 text-blue-600" />}
                        title="10k+ Questões"
                        description="Banco de questões focado no ENEM e vestibulares, com resolução passo a passo."
                    />
                    <FeatureCard
                        icon={<Star className="h-8 w-8 text-yellow-500" />}
                        title="Dashboards de Evolução"
                        description="Acompanhe seu progresso por matéria, assunto e competência com gráficos detalhados."
                    />
                    <FeatureCard
                        icon={<Play className="h-8 w-8 text-red-600" />}
                        title="Videoaulas e Resumos"
                        description="Aulas completas para cada área de conhecimento com resumos automáticos gerados por IA."
                    />
                </div>
            </section>

            {/* Testimonials (Moved & Improved) */}
            <section id="testimonials" className="py-24 bg-gray-50/50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Depoimentos Reais</h2>
                    <h3 className="text-3xl font-bold text-gray-900 mb-12">O que nossos alunos estão dizendo</h3>

                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        {/* Coluna Esquerda (Instagram - Rafaela) */}
                        <div className="space-y-6">
                            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <img src="/testimonials/t2.jpg" alt="Depoimento Rafaela" className="w-full h-auto rounded-xl" loading="lazy" />
                            </div>
                        </div>

                        {/* Coluna do Meio (WhatsApp - Beatriz, Ricardo, Fernando) */}
                        <div className="space-y-6">
                            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <img src="/testimonials/t4.jpg" alt="Depoimento Beatriz" className="w-full h-auto rounded-xl" loading="lazy" />
                            </div>
                            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <img src="/testimonials/t3.jpg" alt="Depoimento Ricardo" className="w-full h-auto rounded-xl" loading="lazy" />
                            </div>
                            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <img src="/testimonials/t5.jpg" alt="Depoimento Fernando" className="w-full h-auto rounded-xl" loading="lazy" />
                            </div>
                        </div>

                        {/* Coluna Direita (Instagram - Diego) */}
                        <div className="space-y-6">
                            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <img src="/testimonials/t1.jpg" alt="Depoimento Diego" className="w-full h-auto rounded-xl" loading="lazy" />
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                        Mais de 10.000 alunos estudando hoje
                    </p>
                </div>
            </section>

            {/* Pricing Section - Formal & Organized */}
            <section id="pricing" className="py-20 bg-white text-gray-900 border-t border-gray-100">
                <div className="max-w-3xl mx-auto px-4 text-center">

                    <div className="mb-10 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight leading-tight">
                            Sua Aprovação no Próximo Nível <br className="hidden md:block" />
                            <span className="text-indigo-600">Começa Agora!</span>
                        </h2>
                        <p className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Garanta acesso EXCLUSIVO aos Tutores IA, Correção de Redação e Banco de Questões. Comece a estudar do jeito certo hoje!
                        </p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden max-w-lg mx-auto">
                        {/* Discount Badge */}
                        <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                            Desconto de 80%
                        </div>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <span className="text-gray-400 text-lg font-medium line-through mb-1">De R$ 49,90</span>
                            <div className="flex items-center gap-1 text-indigo-600 leading-none">
                                <span className="text-xl font-bold">Por R$</span>
                                <span className="text-6xl md:text-7xl font-extrabold tracking-tighter">9,90</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout?plan=start')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 uppercase tracking-wide mb-6 flex items-center justify-center gap-2"
                        >
                            Quero Acesso Imediato
                        </button>

                        <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Compra Segura</span>
                            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Acesso Imediato</span>
                        </div>

                        {/* Features List (Compact) */}
                        <div className="pt-6 border-t border-gray-100 text-left space-y-3">
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Professores IA para cada área do ENEM</div>
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Correção de Redação Ilimitada</div>
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Cronograma de Estudos Adaptativo</div>
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Banco de 10k+ Questões</div>
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Dashboards de Evolução</div>
                            <div className="flex items-center gap-3 text-gray-700 font-medium text-sm"><Check className="h-4 w-4 text-indigo-500" /> Videoaulas com Resumos Automáticos</div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 text-center">
                            <p className="text-[10px] text-gray-400">
                                Pagamento Semanal • Cancela quando quiser
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-900 rounded flex items-center justify-center">
                            <Brain className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Enem.Pro</span>
                    </div>
                    <p className="text-sm text-gray-500">© 2024 Enem.Pro. Todos os direitos reservados.</p>
                </div>
            </footer>

        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group">
            <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}


