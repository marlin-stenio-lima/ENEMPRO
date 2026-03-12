import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold">G</span>
                    </div>
                    <span className="font-semibold text-sm text-gray-900">Gabas</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Sidebar with mobile state */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-white/50 pt-16 lg:pt-0">
                <Outlet />
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

// WAIT: The user asked to "configurar a tela de redação e dash".
// They want a DASHBOARD VISUALIZATION.
// Currently logic sets /app -> Redirect to Questions.
// I need to change App.tsx to point /app -> "DashboardHome" component.

// Let's create `pages/DashboardHome.tsx` first with the nice stats.
