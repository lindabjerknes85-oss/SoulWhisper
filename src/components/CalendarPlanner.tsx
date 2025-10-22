import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Trash2, Edit2, Target, CheckCircle2, Circle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  color: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

interface YearWheelGoal {
  id: string;
  year: number;
  quarter: number | null;
  month: number | null;
  category: string;
  goal: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes: string | null;
}

export function CalendarPlanner() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'calendar' | 'yearwheel'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [yearGoals, setYearGoals] = useState<YearWheelGoal[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingGoal, setEditingGoal] = useState<YearWheelGoal | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'task',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: '',
    all_day: false,
    color: '#06b6d4',
    status: 'planned' as 'planned' | 'in_progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [goalForm, setGoalForm] = useState({
    quarter: '',
    month: '',
    category: '',
    goal: '',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchYearGoals();
    }
  }, [user, currentDate, selectedYear]);

  const fetchEvents = async () => {
    if (!user) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', startOfMonth.toISOString())
      .lte('start_date', endOfMonth.toISOString())
      .order('start_date', { ascending: true });

    if (data) setEvents(data);
  };

  const fetchYearGoals = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('year_wheel_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', selectedYear)
      .order('quarter', { ascending: true });

    if (data) setYearGoals(data);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingEvent) {
      const { data } = await supabase
        .from('calendar_events')
        .update({
          title: eventForm.title,
          description: eventForm.description || null,
          event_type: eventForm.event_type,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date || null,
          all_day: eventForm.all_day,
          color: eventForm.color,
          status: eventForm.status,
          priority: eventForm.priority
        })
        .eq('id', editingEvent.id)
        .select()
        .single();

      if (data) {
        setEvents(events.map(e => e.id === data.id ? data : e));
      }
    } else {
      const { data } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: user.id,
          title: eventForm.title,
          description: eventForm.description || null,
          event_type: eventForm.event_type,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date || null,
          all_day: eventForm.all_day,
          color: eventForm.color,
          status: eventForm.status,
          priority: eventForm.priority
        }])
        .select()
        .single();

      if (data) {
        setEvents([...events, data]);
      }
    }

    setShowEventForm(false);
    setEditingEvent(null);
    resetEventForm();
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingGoal) {
      const { data } = await supabase
        .from('year_wheel_goals')
        .update({
          quarter: goalForm.quarter ? parseInt(goalForm.quarter) : null,
          month: goalForm.month ? parseInt(goalForm.month) : null,
          category: goalForm.category,
          goal: goalForm.goal,
          status: goalForm.status,
          notes: goalForm.notes || null
        })
        .eq('id', editingGoal.id)
        .select()
        .single();

      if (data) {
        setYearGoals(yearGoals.map(g => g.id === data.id ? data : g));
      }
    } else {
      const { data } = await supabase
        .from('year_wheel_goals')
        .insert([{
          user_id: user.id,
          year: selectedYear,
          quarter: goalForm.quarter ? parseInt(goalForm.quarter) : null,
          month: goalForm.month ? parseInt(goalForm.month) : null,
          category: goalForm.category,
          goal: goalForm.goal,
          status: goalForm.status,
          notes: goalForm.notes || null
        }])
        .select()
        .single();

      if (data) {
        setYearGoals([...yearGoals, data]);
      }
    }

    setShowGoalForm(false);
    setEditingGoal(null);
    resetGoalForm();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne hendelsen?')) return;

    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (!error) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette målet?')) return;

    const { error } = await supabase.from('year_wheel_goals').delete().eq('id', id);
    if (!error) {
      setYearGoals(yearGoals.filter(g => g.id !== id));
    }
  };

  const editEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_date: new Date(event.start_date).toISOString().slice(0, 16),
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      all_day: event.all_day,
      color: event.color,
      status: event.status,
      priority: event.priority
    });
    setShowEventForm(true);
  };

  const editGoal = (goal: YearWheelGoal) => {
    setEditingGoal(goal);
    setGoalForm({
      quarter: goal.quarter?.toString() || '',
      month: goal.month?.toString() || '',
      category: goal.category,
      goal: goal.goal,
      status: goal.status,
      notes: goal.notes || ''
    });
    setShowGoalForm(true);
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'task',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: '',
      all_day: false,
      color: '#06b6d4',
      status: 'planned',
      priority: 'medium'
    });
  };

  const resetGoalForm = () => {
    setGoalForm({
      quarter: '',
      month: '',
      category: '',
      goal: '',
      status: 'not_started',
      notes: ''
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const eventTypes = ['task', 'meeting', 'goal', 'wellness', 'reflection'];
  const goalCategories = ['Business', 'Helse', 'Personlig', 'Økonomi', 'Karriere', 'Relasjoner'];
  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Okt-Des)' }
  ];
  const months = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthName = currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Planlegging</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'calendar'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Kalender
          </button>
          <button
            onClick={() => setActiveView('yearwheel')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'yearwheel'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Årshjul
          </button>
        </div>
      </div>

      {activeView === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <button onClick={previousMonth} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-xl font-bold text-white capitalize">{monthName}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingEvent(null);
              resetEventForm();
              setShowEventForm(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny hendelse
          </button>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isToday = day === new Date().getDate() &&
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border transition-all ${
                      day
                        ? isToday
                          ? 'bg-cyan-900/20 border-cyan-500'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                        : 'bg-transparent border-transparent'
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: event.color + '40', borderLeft: `3px solid ${event.color}` }}
                              onClick={() => editEvent(event)}
                            >
                              <div className="truncate text-white">{event.title}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Hendelser denne måneden</h3>
            {events.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Ingen hendelser planlagt</p>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                          <h4 className="text-white font-semibold">{event.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            event.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            event.priority === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {event.priority === 'high' ? 'Høy' : event.priority === 'medium' ? 'Middels' : 'Lav'}
                          </span>
                        </div>
                        {event.description && <p className="text-slate-400 text-sm mb-2">{event.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{new Date(event.start_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="px-2 py-0.5 bg-slate-800 rounded">{event.event_type}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            event.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            event.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                            event.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {event.status === 'completed' ? 'Fullført' :
                             event.status === 'in_progress' ? 'Pågår' :
                             event.status === 'cancelled' ? 'Avlyst' : 'Planlagt'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editEvent(event)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteEvent(event.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'yearwheel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <button onClick={() => setSelectedYear(selectedYear - 1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-xl font-bold text-white">{selectedYear}</h3>
            <button onClick={() => setSelectedYear(selectedYear + 1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              resetGoalForm();
              setShowGoalForm(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nytt mål
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quarters.map(quarter => {
              const quarterGoals = yearGoals.filter(g => g.quarter === quarter.value);
              return (
                <div key={quarter.value} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{quarter.label}</h3>
                  {quarterGoals.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">Ingen mål satt</p>
                  ) : (
                    <div className="space-y-3">
                      {quarterGoals.map(goal => (
                        <div key={goal.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {goal.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : goal.status === 'in_progress' ? (
                                  <Circle className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500" />
                                )}
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                                  {goal.category}
                                </span>
                                {goal.month && (
                                  <span className="text-xs text-slate-400">{months[goal.month - 1]}</span>
                                )}
                              </div>
                              <p className="text-white mb-2">{goal.goal}</p>
                              {goal.notes && <p className="text-slate-400 text-sm">{goal.notes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editGoal(goal)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteGoal(goal.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 my-8 self-start">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingEvent ? 'Rediger hendelse' : 'Ny hendelse'}
              </h3>
              <button onClick={() => setShowEventForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tittel *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beskrivelse</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={eventForm.event_type}
                  onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Starttid *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.start_date}
                  onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Prioritet</label>
                <select
                  value={eventForm.priority}
                  onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Lav</option>
                  <option value="medium">Middels</option>
                  <option value="high">Høy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="planned">Planlagt</option>
                  <option value="in_progress">Pågår</option>
                  <option value="completed">Fullført</option>
                  <option value="cancelled">Avlyst</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Farge</label>
                <input
                  type="color"
                  value={eventForm.color}
                  onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingEvent ? 'Oppdater' : 'Lagre'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 my-8 self-start">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingGoal ? 'Rediger mål' : 'Nytt mål'}
              </h3>
              <button onClick={() => setShowGoalForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kvartal *</label>
                <select
                  required
                  value={goalForm.quarter}
                  onChange={(e) => setGoalForm({ ...goalForm, quarter: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg kvartal</option>
                  {quarters.map(q => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Måned (valgfritt)</label>
                <select
                  value={goalForm.month}
                  onChange={(e) => setGoalForm({ ...goalForm, month: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg måned</option>
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori *</label>
                <select
                  required
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg kategori</option>
                  {goalCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mål *</label>
                <textarea
                  required
                  rows={3}
                  value={goalForm.goal}
                  onChange={(e) => setGoalForm({ ...goalForm, goal: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Beskriv ditt mål..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={goalForm.status}
                  onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="not_started">Ikke startet</option>
                  <option value="in_progress">Pågår</option>
                  <option value="completed">Fullført</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notater</label>
                <textarea
                  rows={2}
                  value={goalForm.notes}
                  onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingGoal ? 'Oppdater' : 'Lagre'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
