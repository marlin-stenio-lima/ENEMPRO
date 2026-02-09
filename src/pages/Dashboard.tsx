import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Target, Plus, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: If recharts is removed, use simple CSS bars. But user approved "best" way.

// Mock stats for dashboard
const STATS = [
    { title: 'Questões Hoje', value: '12', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Precisão Geral', value: '68%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Tempo Médio', value: '2m 15s', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Sequência', value: '3 Dias', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const DATA = [
  { name: 'Mat', acertos: 65, total: 100 },
  { name: 'Hum', acertos: 40, total: 100 },
  { name: 'Nat', acertos: 55, total: 100 },
  { name: 'Ling', acertos: 75, total: 100 },
];

export default function Dashboard() {
    const location = useLocation();
    
    // If not in root /sub-route, show dashboard content. 
    // Wait, the router structure in App.tsx renders Dashboard as parent layout.
    // We need to split "Layout" vs "Dashboard Home".
    // Currently App.tsx says: /app -> Dashboard Layout.
    // And /app/questions, /app/videos etc.
    // The user wants a "Dashboard" home screen at /app/dashboard or similar?
    // Let's check App.tsx again. 
    // Ah, App.tsx has:
    /*
        <Route path="/app" element={<Dashboard />}>
           <Route index element={<Navigate to="/app/questions" replace />} />
    */
    // This means "Dashboard.tsx" acts as the Layout wrapper. 
    // And there is NO dedicated "Home/Stats" page currently. It redirects to Questions.
    
    // STRATEGY: 
    // 1. Rename current `pages/Dashboard.tsx` to `components/Layout.tsx` (or keep as DashboardLayout).
    // 2. Create `pages/Home.tsx` (The stats dashboard).
    // 3. Update App.tsx logic.
    
    // FOR NOW, to respect the file overwrite in place without breaking routing:
    // I will write the "Layout" logic here.
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white/50">
               <Outlet /> {/* Renders Questions, Essay, etc */}
            </main>
        </div>
    );
}

// WAIT: The user asked to "configurar a tela de redação e dash".
// They want a DASHBOARD VISUALIZATION.
// Currently logic sets /app -> Redirect to Questions.
// I need to change App.tsx to point /app -> "DashboardHome" component.

// Let's create `pages/DashboardHome.tsx` first with the nice stats.
