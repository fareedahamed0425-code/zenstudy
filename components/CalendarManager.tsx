import React, { useState } from 'react';
import { UserProfile, Exam, DailyEvent } from '../types';
import { Smartphone, Calendar, Clock, ChevronLeft, ChevronRight, Plus, GraduationCap, BookOpen, Activity } from 'lucide-react';

interface CalendarManagerProps {
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const CalendarManager: React.FC<CalendarManagerProps> = ({ userProfile, onUpdateProfile }) => {
    const [activeTab, setActiveTab] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // State for adding exam
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const [newExamSubject, setNewExamSubject] = useState('');

    // State for adding routine
    const [newRoutineDay, setNewRoutineDay] = useState('Monday');
    const [newRoutineTime, setNewRoutineTime] = useState('09:00');
    const [newRoutineTitle, setNewRoutineTitle] = useState('');
    const [newRoutineType, setNewRoutineType] = useState<'class' | 'study' | 'leisure'>('class');

    // --- CALENDAR SYNC LOGIC ---
    const handleSyncCalendar = () => {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ILMORA//Schedule v1.0//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

        const formatDateTime = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        // 1. Export Exams
        userProfile.exams.forEach(exam => {
            // Exam date is YYYY-MM-DD.
            const dateParts = exam.date.split('-');
            // Set exam to start at 9:00 AM local time on that day
            const startDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 9, 0, 0);
            const endDate = new Date(startDate);
            endDate.setHours(12, 0, 0); // Default 3 hours duration

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `UID:${exam.id}@ilmora.app\n`;
            icsContent += `DTSTAMP:${formatDateTime(new Date())}\n`;
            icsContent += `DTSTART:${formatDateTime(startDate)}\n`;
            icsContent += `DTEND:${formatDateTime(endDate)}\n`;
            icsContent += `SUMMARY:Exam: ${exam.subject}\n`;
            icsContent += `DESCRIPTION:Good luck! You got this.\n`;
            icsContent += "END:VEVENT\n";
        });

        // 2. Export Routine
        const dayMap: { [key: string]: string } = {
            'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA'
        };

        if (userProfile.dailySchedule) {
            userProfile.dailySchedule.forEach(event => {
                const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(event.day);
                const [hours, minutes] = event.time.split(':').map(Number);

                const startDate = new Date();
                const currentDayIndex = startDate.getDay();

                // Calculate days until the next occurrence
                let distance = dayIndex - currentDayIndex;
                if (distance < 0) distance += 7;

                startDate.setDate(startDate.getDate() + distance);
                startDate.setHours(hours, minutes, 0, 0);

                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

                icsContent += "BEGIN:VEVENT\n";
                icsContent += `UID:${event.id}@ilmora.app\n`;
                icsContent += `DTSTAMP:${formatDateTime(new Date())}\n`;
                icsContent += `DTSTART:${formatDateTime(startDate)}\n`;
                icsContent += `DTEND:${formatDateTime(endDate)}\n`;
                icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[event.day]}\n`;
                icsContent += `SUMMARY:${event.title}\n`;
                icsContent += `DESCRIPTION:Type: ${event.type}\n`;
                icsContent += "END:VEVENT\n";
            });
        }

        icsContent += "END:VCALENDAR";

        // Trigger Download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'ilmora_schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- MONTH VIEW LOGIC ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { daysInMonth, firstDay };
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const handleDayClick = (day: number) => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        setSelectedDateStr(dateStr);
        setIsExamModalOpen(true);
    };

    const addExam = () => {
        if (!newExamSubject || !selectedDateStr) return;
        const newExam: Exam = {
            id: Date.now().toString(),
            subject: newExamSubject,
            date: selectedDateStr
        };
        const updatedExams = [...userProfile.exams, newExam];
        onUpdateProfile({ ...userProfile, exams: updatedExams });
        setNewExamSubject('');
        setIsExamModalOpen(false);
    };

    const deleteExam = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedExams = userProfile.exams.filter(ex => ex.id !== id);
        onUpdateProfile({ ...userProfile, exams: updatedExams });
    };

    // --- WEEK VIEW LOGIC ---
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const addRoutineEvent = () => {
        if (!newRoutineTitle) return;
        const newEvent: DailyEvent = {
            id: Date.now().toString(),
            day: newRoutineDay,
            time: newRoutineTime,
            title: newRoutineTitle,
            type: newRoutineType
        };
        // Sort events by time automatically
        const updatedSchedule = [...(userProfile.dailySchedule || []), newEvent].sort((a, b) => a.time.localeCompare(b.time));
        onUpdateProfile({ ...userProfile, dailySchedule: updatedSchedule });
        setNewRoutineTitle('');
    };

    const deleteRoutineEvent = (id: string) => {
        const updatedSchedule = (userProfile.dailySchedule || []).filter(e => e.id !== id);
        onUpdateProfile({ ...userProfile, dailySchedule: updatedSchedule });
    };

    const handleToggleRoutineComplete = (id: string) => {
        let countDiff = 0;
        const updatedSchedule = (userProfile.dailySchedule || []).map(event => {
            if (event.id === id) {
                const completed = !event.completed;
                countDiff = completed ? 1 : -1;
                return { ...event, completed };
            }
            return event;
        });
        const currentTasksCount = userProfile.tasksCompletedCount || 0;
        onUpdateProfile({ 
            ...userProfile, 
            dailySchedule: updatedSchedule,
            tasksCompletedCount: Math.max(0, currentTasksCount + countDiff)
        });
    };

    // Render Helpers
    const { daysInMonth, firstDay } = getDaysInMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-5 animate-slide-up">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                        Master Schedule
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Update your exams or set your daily routine.</p>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                    <button
                        onClick={handleSyncCalendar}
                        className="bg-slate-100 dark:bg-surface-container text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-surface-bright transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-outline-variant/10 shadow-sm"
                    >
                        <Smartphone size={14} /> Sync
                    </button>

                    <div className="flex bg-white dark:bg-surface-container p-1 rounded-xl shadow-sm border border-slate-200 dark:border-outline-variant/10 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('month')}
                            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 whitespace-nowrap ${activeTab === 'month' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <Calendar size={14} /> Calendar
                        </button>
                        <button
                            onClick={() => setActiveTab('week')}
                            className={`flex items-center justify-center gap-1.5 flex-1 sm:px-6 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 transform ${activeTab === 'week' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-102' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-surface-bright'}`}
                        >
                            <Clock size={14} /> Routine
                        </button>
                    </div>
                </div>
            </div>

            {/* MONTH VIEW */}
            {activeTab === 'month' && (
                <div className="bento-card overflow-hidden">
                    {/* Calendar Controls */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-outline-variant/10 bg-slate-50/50 dark:bg-surface-container/30">
                        <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-surface-bright rounded-full transition-colors text-slate-500 dark:text-slate-400"><ChevronLeft size={16} /></button>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-surface-bright rounded-full transition-colors text-slate-500 dark:text-slate-400"><ChevronRight size={16} /></button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        <div className="grid grid-cols-7 mb-1 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider pb-1.5">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {/* Empty padding days */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-16 md:h-22 bg-transparent"></div>
                            ))}

                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const dayExams = userProfile.exams.filter(e => e.date === dateString);
                                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                    h-16 md:h-22 border rounded-lg p-1.5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-sm relative group
                                    ${isToday ? 'bg-slate-50 dark:bg-surface-container border-slate-900 dark:border-white' : 'bg-white dark:bg-background border-slate-100 dark:border-outline-variant/10 hover:border-slate-300 dark:hover:border-slate-500'}
                                `}
                                    >
                                        <span className={`text-xs font-bold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>

                                        {/* Exam Dots */}
                                        <div className="mt-0.5 flex flex-col gap-0.5 overflow-y-auto max-h-[70%] scrollbar-hide">
                                            {dayExams.map(exam => (
                                                <div key={exam.id} className="text-[8px] bg-slate-100 dark:bg-surface-bright text-slate-800 dark:text-white px-1 py-0.5 rounded font-bold truncate border border-slate-200 dark:border-outline-variant/50 flex justify-between items-center group/item">
                                                    <span className="truncate">{exam.subject}</span>
                                                    <button
                                                        onClick={(e) => deleteExam(exam.id, e)}
                                                        className="hidden group-hover/item:block ml-1 hover:text-red-900 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none text-slate-400 dark:text-slate-500">
                                            <Plus size={20} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* WEEK ROUTINE VIEW */}
            {activeTab === 'week' && (
                <div className="space-y-4">
                    {/* Add Routine Form */}
                    <div className="bento-card p-3 md:p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
                        <div className="flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Day</label>
                            <select
                                value={newRoutineDay}
                                onChange={(e) => setNewRoutineDay(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                            >
                                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="w-28">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Time</label>
                            <input
                                type="time"
                                value={newRoutineTime}
                                onChange={(e) => setNewRoutineTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                            />
                        </div>
                        <div className="flex-1 sm:flex-[2] min-w-[120px]">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Activity</label>
                            <input
                                type="text"
                                placeholder="e.g. Math Class"
                                value={newRoutineTitle}
                                onChange={(e) => setNewRoutineTitle(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                            />
                        </div>
                        <div className="w-28">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Type</label>
                            <select
                                value={newRoutineType}
                                onChange={(e) => setNewRoutineType(e.target.value as any)}
                                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                            >
                                <option value="class">Class</option>
                                <option value="study">Study</option>
                                <option value="leisure">Other</option>
                            </select>
                        </div>
                        <button
                            onClick={addRoutineEvent}
                            className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold shadow-sm transition-all h-[36px] mt-1 sm:mt-0 text-xs"
                        >
                            Add
                        </button>
                    </div>

                    {/* Weekly Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
                        {daysOfWeek.map(day => {
                            const dayEvents = (userProfile.dailySchedule || []).filter(e => e.day === day);
                            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                            return (
                                <div key={day} className={`rounded-xl p-3 min-h-[220px] border ${isToday ? 'bg-slate-50 dark:bg-surface-container border-slate-300 dark:border-slate-600' : 'bg-white/60 dark:bg-surface-container/40 border-slate-100 dark:border-outline-variant/10'}`}>
                                    <h4 className={`text-xs font-bold mb-2 ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</h4>
                                    <div className="space-y-1.5">
                                        {dayEvents.length === 0 && (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-600 italic">No events</p>
                                        )}
                                        {dayEvents.map(event => (
                                            <div key={event.id} className={`bg-white dark:bg-background p-2 rounded-lg shadow-sm border group relative transition-all ${event.completed ? 'opacity-50 border-transparent' : 'border-slate-100 dark:border-outline-variant/10'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-1.5">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!event.completed} 
                                                            onChange={() => handleToggleRoutineComplete(event.id)}
                                                            className="w-3 h-3 rounded text-slate-900 dark:text-white focus:ring-slate-900 dark:focus:ring-white cursor-pointer accent-slate-900 dark:accent-white"
                                                        />
                                                        <span className={`text-[8px] font-bold bg-slate-100 dark:bg-surface-bright px-1 py-0.5 rounded text-slate-600 dark:text-slate-300 ${event.completed ? 'line-through opacity-60' : ''}`}>{event.time}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteRoutineEvent(event.id)}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <p className={`font-semibold text-xs text-slate-800 dark:text-white mt-1 leading-tight ${event.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{event.title}</p>
                                                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                                                    {event.type === 'class' ? <><GraduationCap size={10}/> Class</> : event.type === 'study' ? <><BookOpen size={10}/> Study</> : <><Activity size={10}/> Activity</>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Exam Modal */}
            {isExamModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bento-card p-8 shadow-2xl max-w-md w-full animate-slide-up">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Add Event</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For {selectedDateStr}</p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Event/Subject Name</label>
                            <input
                                type="text"
                                autoFocus
                                value={newExamSubject}
                                onChange={(e) => setNewExamSubject(e.target.value)}
                                placeholder="e.g. Physics Final or Study Group"
                                className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-800 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && addExam()}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsExamModalOpen(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-container rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addExam}
                                disabled={!newExamSubject}
                                className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};