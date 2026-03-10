import { useState } from 'react';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

export default function AccountsPayableCalendar() {
    const { payables } = useAccountsPayable();
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({
        start: monthStart,
        end: monthEnd
    });

    const getPayablesForDay = (day: Date) => {
        return payables.filter(p => isSameDay(new Date(p.due_date), day));
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 capitalize leading-none">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">CALENDARIO DE VENCIMIENTOS</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900 active:scale-90">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-black text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-95 uppercase tracking-wide">
                        Hoy
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900 active:scale-90">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-300/30 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[120px] md:auto-rows-[160px]">
                    {calendarDays.map((day, idx) => {
                        const dayPayables = getPayablesForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDay = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`p-2 border-r border-b border-gray-50 relative group transition-colors hover:bg-indigo-50/30 ${!isCurrentMonth ? 'bg-gray-50/30 opacity-40' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`w-8 h-8 flex items-center justify-center text-sm font-black rounded-full transition-all ${isTodayDay ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-pulse' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayPayables.length > 0 && (
                                        <div className="flex -space-x-1">
                                            {dayPayables.slice(0, 3).map((p, i) => (
                                                <div key={p.id} className={`w-2 h-2 rounded-full border border-white ${p.status === 'paid' ? 'bg-green-500' : p.balance_due > 0 && isPast(new Date(p.due_date)) && !isToday(new Date(p.due_date)) ? 'bg-red-500 animate-bounce' : 'bg-amber-500'}`}></div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] md:max-h-[110px] thin-scrollbar">
                                    {dayPayables.map(payable => (
                                        <div
                                            key={payable.id}
                                            className={`text-[9px] md:text-[10px] p-1.5 rounded-lg border-l-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${payable.status === 'paid' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-amber-500 text-gray-700 shadow-gray-200/50'}`}
                                        >
                                            <div className="font-black line-clamp-1 uppercase leading-tight">{payable.supplier?.nombreComercial || 'Esp'}</div>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <span className="font-mono">${Number(payable.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                {payable.balance_due > 0 && isPast(new Date(payable.due_date)) && !isToday(new Date(payable.due_date)) && (
                                                    <AlertCircle size={8} className="text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary Tooltip On Hover (Pseudo-UI) */}
                                {dayPayables.length > 3 && (
                                    <div className="absolute bottom-1 right-2 text-[8px] font-black text-gray-400 uppercase">
                                        +{dayPayables.length - 3} más
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 px-4 py-3 bg-white/50 rounded-2xl border border-gray-100 w-max shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pagados</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pendientes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vencidos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Programados</span>
                </div>
            </div>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
