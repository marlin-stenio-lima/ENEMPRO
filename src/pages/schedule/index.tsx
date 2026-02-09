import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, Pencil } from 'lucide-react';
import { cn } from '../../lib/utils';
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- STYLES ---
const SUBJECT_COLORS: Record<string, string> = {
    'Matemática': 'bg-blue-100/80 text-blue-700 border-l-4 border-blue-500',
    'Física': 'bg-green-100/80 text-green-700 border-l-4 border-green-500',
    'Química': 'bg-emerald-100/80 text-emerald-700 border-l-4 border-emerald-500',
    'Biologia': 'bg-teal-100/80 text-teal-700 border-l-4 border-teal-500',
    'História': 'bg-orange-100/80 text-orange-700 border-l-4 border-orange-500',
    'Geografia': 'bg-amber-100/80 text-amber-700 border-l-4 border-amber-500',
    'Linguagens': 'bg-purple-100/80 text-purple-700 border-l-4 border-purple-500',
    'Redação': 'bg-rose-100/80 text-rose-700 border-l-4 border-rose-500',
    'Revisão': 'bg-gray-100 text-gray-700 border-l-4 border-gray-500',
};

// Initial data...
const INITIAL_EVENTS = [
    { id: 1, title: 'Geometria Espacial', subject: 'Matemática', start: '08:00', duration: 2, date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0) }, // Seg
    { id: 2, title: 'Revolução Francesa', subject: 'História', start: '10:30', duration: 1.5, date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0) }, // Seg
    { id: 3, title: 'Prática de Redação', subject: 'Redação', start: '14:00', duration: 2, date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0) }, // Seg
    { id: 4, title: 'Termodinâmica', subject: 'Física', start: '08:00', duration: 2, date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1) }, // Ter
    { id: 5, title: 'Eletroquímica', subject: 'Química', start: '10:30', duration: 1.5, date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1) }, // Ter
];

export default function StudySchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState(INITIAL_EVENTS);

    // UI States
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    // Form/Editing State
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        subject: 'Matemática',
        date: format(new Date(), 'yyyy-MM-dd'),
        start: '08:00',
        duration: 1
    });

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

    const handleOpenAddModal = () => {
        setEditingEventId(null);
        setEventForm({
            title: '',
            subject: 'Matemática',
            date: format(new Date(), 'yyyy-MM-dd'),
            start: '08:00',
            duration: 1
        });
        setIsEventModalOpen(true);
    };

    const handleEditEvent = (event: any) => {
        setEditingEventId(event.id);
        const eventDateStr = format(event.date, 'yyyy-MM-dd');
        setEventForm({
            title: event.title,
            subject: event.subject,
            date: eventDateStr,
            start: event.start,
            duration: event.duration
        });
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = () => {
        const eventDate = parse(eventForm.date, 'yyyy-MM-dd', new Date());
        const newEventObj = {
            id: editingEventId || Date.now(),
            title: eventForm.title || 'Estudo Agendado',
            subject: eventForm.subject,
            start: eventForm.start,
            duration: Number(eventForm.duration),
            date: eventDate
        };

        if (editingEventId) {
            setEvents(events.map(e => e.id === editingEventId ? newEventObj : e));
        } else {
            setEvents([...events, newEventObj]);
        }
        setIsEventModalOpen(false);
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col font-sans bg-white rounded-3xl shadow-xl overflow-hidden relative border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl">
                            <CalendarIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span className="capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                    </h1>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                        <button onClick={prevWeek} className="p-2 text-gray-500 hover:bg-white hover:text-indigo-600 rounded-lg transition-all shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={today} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all shadow-sm">Hoje</button>
                        <button onClick={nextWeek} className="p-2 text-gray-500 hover:bg-white hover:text-indigo-600 rounded-lg transition-all shadow-sm"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Evento
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 overflow-y-hidden pt-12">
                    {hours.map(hour => (
                        <div key={hour} className="h-[60px] text-xs font-medium text-gray-400 text-right pr-3 -mt-2.5 relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Days Grid - Scrollable Area */}
                <div className="flex-1 overflow-y-auto relative">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 sticky top-0 bg-white z-20 border-b border-gray-100 shadow-sm">
                        {weekDays.map((day, i) => (
                            <div key={i} className="py-4 text-center border-r border-gray-50 last:border-0">
                                <span className={cn(
                                    "block text-xs uppercase font-bold mb-1 tracking-wider",
                                    isSameDay(day, new Date()) ? "text-indigo-600" : "text-gray-400"
                                )}>
                                    {format(day, 'EEE', { locale: ptBR })}
                                </span>
                                <div className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
                                    isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-700"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Week Content */}
                    <div className="relative grid grid-cols-7 min-h-[900px] bg-white">
                        {/* Grid Lines */}
                        {hours.map(hour => (
                            <div key={hour} className="absolute w-full border-b border-gray-50 pointer-events-none" style={{ top: `${(hour - 7) * 60}px` }} />
                        ))}

                        {/* Day Columns */}
                        {weekDays.map((date, dayIndex) => (
                            <div key={dayIndex} className="relative border-r border-gray-50 last:border-0 min-h-full hover:bg-gray-50/30 transition-colors">
                                {/* Events */}
                                {events.filter(e => isSameDay(e.date, date)).map((event) => (
                                    <div
                                        key={event.id}
                                        style={getEventStyle(event)}
                                        onClick={() => handleEditEvent(event)}
                                        className={cn(
                                            "absolute inset-x-1 p-3 text-xs rounded-xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:z-10 group flex flex-col overflow-hidden border border-transparent hover:border-black/5",
                                            SUBJECT_COLORS[event.subject] || 'bg-gray-100 text-gray-700'
                                        )}
                                    >
                                        <div className="font-bold text-gray-900 line-clamp-2 leading-tight pr-4 text-sm mb-1">{event.title}</div>
                                        <div className="font-medium opacity-75 text-[10px] uppercase tracking-wide">{event.subject}</div>

                                        <div className="flex items-center gap-1 font-medium mt-auto text-[10px] opacity-60">
                                            <Clock className="h-3 w-3" />
                                            {event.start}
                                        </div>

                                        {/* Edit Pencil Icon */}
                                        <button
                                            className="absolute top-2 right-2 p-1.5 bg-white/50 hover:bg-white rounded-lg text-gray-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                            title="Editar"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clean Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingEventId ? 'Editar Evento' : 'Novo Agendamento'}
                            </h2>
                            <button
                                onClick={() => setIsEventModalOpen(false)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">O que vamos estudar?</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Geometria Analítica"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                                    value={eventForm.title}
                                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Matéria</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={eventForm.subject}
                                        onChange={e => setEventForm({ ...eventForm, subject: e.target.value })}
                                    >
                                        {Object.keys(SUBJECT_COLORS).map(subj => (
                                            <option key={subj} value={subj}>{subj}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Data</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        value={eventForm.date}
                                        onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Início</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        value={eventForm.start}
                                        onChange={e => setEventForm({ ...eventForm, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Duração (h)</label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        value={eventForm.duration}
                                        onChange={e => setEventForm({ ...eventForm, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEventModalOpen(false)}
                                className="px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl transition-all hover:-translate-y-0.5"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
