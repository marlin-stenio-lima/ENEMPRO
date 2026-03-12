import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PenTool, Calendar, Bot, LogOut, Search, ChevronDown, PlayCircle, Archive, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Questões', href: '/app/questions', icon: BookOpen },
    { name: 'Redação', href: '/app/essay', icon: PenTool },
    { name: 'Cronograma', href: '/app/schedule', icon: Calendar },
    { name: 'Vídeo Aulas', href: '/app/videos', icon: PlayCircle },
    { name: 'Assistente IA', href: '/app/assistant', icon: Bot },
    { name: 'Meu Caderno', href: '/app/notebook', icon: Archive },
    { name: 'Minha Assinatura', href: '/app/plans', icon: CreditCard },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100/80 font-sans transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Header / Brand */}
            <div className="px-6 py-6 pb-2">
                <div className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold">G</span>
                    </div>
                    <span className="font-semibold text-sm text-gray-900">Gabas</span>
                    <ChevronDown className="h-3 w-3 text-gray-400 ml-auto lg:block hidden" />

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden ml-auto p-1 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-200 rounded-lg py-2 pl-9 pr-8 text-sm transition-all outline-none"
                    />
                    <kbd className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-mono border rounded px-1">/</kbd>
                </div>
            </div>


            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
                <div className="px-2 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href ||
                        (item.href !== '/app' && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024 && onClose) onClose();
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all border border-transparent",
                                isActive
                                    ? "bg-gray-100 text-gray-900 font-semibold"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-gray-900" : "text-gray-400")} />
                            {item.name}
                        </Link>
                    );
                })}

                {user?.role === 'admin' && (
                    <div className="pt-2 mt-2 border-t border-gray-100">
                        <div className="px-2 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                        <Link
                            to="/admin"
                            onClick={() => {
                                if (window.innerWidth < 1024 && onClose) onClose();
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all border border-transparent text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 font-bold"
                            )}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Painel Administrativo
                        </Link>
                    </div>
                )}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-50 space-y-1">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}
