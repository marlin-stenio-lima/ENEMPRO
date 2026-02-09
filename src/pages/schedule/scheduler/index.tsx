
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- MOCK DATA ---
const SUBJECT_COLORS: Record<string, string> = {
    'Matemática': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    'Física': 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
    'Química': 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
    'Biologia': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200',
    'História': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
    'Geografia': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
    'Linguagens': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
    'Redação': 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200',
    'Revisão': 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
};

const MOCK_EVENTS = [
    { id: 1, title: 'Geometria Espacial', subject: 'Matemática', start: '08:00', duration: 2, dayOffset: 1 }, // Seg
    { id: 2, title: 'Revolução Francesa', subject: 'História', start: '10:30', duration: 1.5, dayOffset: 1 }, // Seg
    { id: 3, title: 'Prática de Redação', subject: 'Redação', start: '14:00', duration: 2, dayOffset: 1 }, // Seg

    { id: 4, title: 'Termodinâmica', subject: 'Física', start: '08:00', duration: 2, dayOffset: 2 }, // Ter
    { id: 5, title: 'Eletroquímica', subject: 'Química', start: '10:30', duration: 1.5, dayOffset: 2 }, // Ter

    { id: 6, title: 'Funções de Linguagem', subject: 'Linguagens', start: '09:00', duration: 2, dayOffset: 3 }, // Qua
    { id: 7, title: 'Genética', subject: 'Biologia', start: '14:00', duration: 2, dayOffset: 3 }, // Qua

    { id: 8, title: 'Geopolítica Agrária', subject: 'Geografia', start: '08:00', duration: 1.5, dayOffset: 4 }, // Qui
    { id: 9, title: 'Simulado Parcial', subject: 'Revisão', start: '14:00', duration: 4, dayOffset: 5 }, // Sex
];

// --- COMPONENTS ---

export default function StudySchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calendar logic
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 15 }).map((_, i) => i + 7); // 07:00 to 21:00

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    // Helper to position events
    const getEventStyle = (event: any) => {
        const [startHour, startMin] = event.start.split(':').map(Number);
        const top = (startHour - 7) * 60 + startMin; // 60px per hour
        const height = event.duration * 60;
        return {
            top: `${top}px`,
            height: `${height}px`,
        };
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col font-sans bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-indigo-600" />
                        <span className="capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                    </h1>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                        <button onClick={prevWeek} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={today} className="px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded">Hoje</button>
                        <button onClick={nextWeek} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                        + Novo Evento
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50 overflow-y-hidden pt-12">
                    {hours.map(hour => (
                        <div key={hour} className="h-[60px] text-xs text-gray-400 text-right pr-2 -mt-2.5 relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Days Grid - Scrollable Area */}
                <div className="flex-1 overflow-y-auto relative">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 sticky top-0 bg-white z-20 border-b border-gray-200 shadow-sm">
                        {weekDays.map((day, i) => (
                            <div key={i} className={cn(
                                "py-3 text-center border-r border-gray-100 last:border-0",
                                isSameDay(day, new Date()) ? "bg-indigo-50/30" : ""
                            )}>
                                <span className="block text-xs uppercase text-gray-500 font-semibold mb-1">
                                    {format(day, 'EEE', { locale: ptBR })}
                                </span>
                                <div className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold",
                                    isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-gray-900"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Week Content */}
                    <div className="relative grid grid-cols-7 min-h-[900px]">
                        {/* Grid Lines */}
                        {hours.map(hour => (
                            <div key={hour} className="absolute w-full border-b border-gray-100 pointer-events-none" style={{ top: `${(hour - 7) * 60}px` }} />
                        ))}

                        {/* Day Columns */}
                        {weekDays.map((_, dayIndex) => (
                            <div key={dayIndex} className="relative border-r border-gray-100 last:border-0 min-h-full">
                                {/* Events */}
                                {MOCK_EVENTS.filter(e => e.dayOffset === dayIndex + 1).map((event) => (
                                    <div
                                        key={event.id}
                                        style={getEventStyle(event)}
                                        className={cn(
                                            "absolute inset-x-1 rounded-lg p-2 text-xs border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group",
                                            SUBJECT_COLORS[event.subject] || SUBJECT_COLORS['Revisão']
                                        )}
                                    >
                                        <div className="font-bold line-clamp-1">{event.title}</div>
                                        <div className="opacity-80 mb-1">{event.subject}</div>
                                        <div className="flex items-center gap-1 opacity-70 text-[10px]">
                                            <Clock className="h-3 w-3" />
                                            {event.start} - {parseInt(event.start) + Math.floor(event.duration)}:{(parseInt(event.start.split(':')[1]) + (event.duration % 1) * 60).toString().padStart(2, '0')}
                                        </div>
                                        <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 hover:bg-black/10 p-1 rounded">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
