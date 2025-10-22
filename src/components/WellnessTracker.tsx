import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Heart, Brain, Activity, Plus, X, Trash2, TrendingUp, Lightbulb, Edit2 } from 'lucide-react';

interface Inspiration {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: string | null;
  created_at: string;
}

interface Affirmation {
  id: string;
  affirmation: string;
  category: string;
  times_used: number;
  last_used: string | null;
}

interface Meditation {
  id: string;
  title: string;
  duration_minutes: number;
  meditation_type: string;
  notes: string | null;
  meditation_date: string;
}

interface Workout {
  id: string;
  title: string;
  workout_type: string;
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  calories_burned: number | null;
  notes: string | null;
  workout_date: string;
}

interface Reflection {
  id: string;
  title: string;
  what_went_well: string;
  improvements: string;
  future_vision: string | null;
  category: string | null;
  reflection_date: string;
  created_at: string;
}

export function WellnessTracker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inspiration' | 'affirmations' | 'meditation' | 'workout' | 'reflections'>('inspiration');

  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const [showInspirationForm, setShowInspirationForm] = useState(false);
  const [showAffirmationForm, setShowAffirmationForm] = useState(false);
  const [showMeditationForm, setShowMeditationForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);

  const [inspirationForm, setInspirationForm] = useState({
    title: '',
    content: '',
    source: '',
    category: ''
  });

  const [affirmationForm, setAffirmationForm] = useState({
    affirmation: '',
    category: ''
  });

  const [meditationForm, setMeditationForm] = useState({
    title: '',
    duration_minutes: '',
    meditation_type: '',
    notes: '',
    meditation_date: new Date().toISOString().split('T')[0]
  });

  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    workout_type: '',
    duration_minutes: '',
    intensity: 'medium' as 'low' | 'medium' | 'high',
    calories_burned: '',
    notes: '',
    workout_date: new Date().toISOString().split('T')[0]
  });

  const [reflectionForm, setReflectionForm] = useState({
    title: '',
    what_went_well: '',
    improvements: '',
    future_vision: '',
    category: '',
    reflection_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [inspirationsData, affirmationsData, meditationsData, workoutsData, reflectionsData] = await Promise.all([
      supabase.from('inspirations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('affirmations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('meditations').select('*').eq('user_id', user.id).order('meditation_date', { ascending: false }),
      supabase.from('workouts').select('*').eq('user_id', user.id).order('workout_date', { ascending: false }),
      supabase.from('reflections').select('*').eq('user_id', user.id).order('reflection_date', { ascending: false })
    ]);

    if (inspirationsData.data) setInspirations(inspirationsData.data);
    if (affirmationsData.data) setAffirmations(affirmationsData.data);
    if (meditationsData.data) setMeditations(meditationsData.data);
    if (workoutsData.data) setWorkouts(workoutsData.data);
    if (reflectionsData.data) setReflections(reflectionsData.data);
  };

  const handleAddInspiration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data } = await supabase
      .from('inspirations')
      .insert([{
        user_id: user.id,
        title: inspirationForm.title,
        content: inspirationForm.content,
        source: inspirationForm.source || null,
        category: inspirationForm.category || null
      }])
      .select()
      .single();

    if (data) {
      setInspirations([data, ...inspirations]);
      setShowInspirationForm(false);
      setInspirationForm({ title: '', content: '', source: '', category: '' });
    }
  };

  const handleAddAffirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data } = await supabase
      .from('affirmations')
      .insert([{
        user_id: user.id,
        affirmation: affirmationForm.affirmation,
        category: affirmationForm.category
      }])
      .select()
      .single();

    if (data) {
      setAffirmations([data, ...affirmations]);
      setShowAffirmationForm(false);
      setAffirmationForm({ affirmation: '', category: '' });
    }
  };

  const handleAddMeditation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data } = await supabase
      .from('meditations')
      .insert([{
        user_id: user.id,
        title: meditationForm.title,
        duration_minutes: parseInt(meditationForm.duration_minutes),
        meditation_type: meditationForm.meditation_type,
        notes: meditationForm.notes || null,
        meditation_date: meditationForm.meditation_date
      }])
      .select()
      .single();

    if (data) {
      setMeditations([data, ...meditations]);
      setShowMeditationForm(false);
      setMeditationForm({
        title: '',
        duration_minutes: '',
        meditation_type: '',
        notes: '',
        meditation_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data } = await supabase
      .from('workouts')
      .insert([{
        user_id: user.id,
        title: workoutForm.title,
        workout_type: workoutForm.workout_type,
        duration_minutes: parseInt(workoutForm.duration_minutes),
        intensity: workoutForm.intensity,
        calories_burned: workoutForm.calories_burned ? parseInt(workoutForm.calories_burned) : null,
        notes: workoutForm.notes || null,
        workout_date: workoutForm.workout_date
      }])
      .select()
      .single();

    if (data) {
      setWorkouts([data, ...workouts]);
      setShowWorkoutForm(false);
      setWorkoutForm({
        title: '',
        workout_type: '',
        duration_minutes: '',
        intensity: 'medium',
        calories_burned: '',
        notes: '',
        workout_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const practiceAffirmation = async (id: string) => {
    const affirmation = affirmations.find(a => a.id === id);
    if (!affirmation) return;

    const { data } = await supabase
      .from('affirmations')
      .update({
        times_used: (affirmation.times_used || 0) + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      setAffirmations(affirmations.map(a => a.id === id ? data : a));
    }
  };

  const deleteItem = async (table: string, id: string, setState: Function, items: any[]) => {
    if (!confirm('Er du sikker på at du vil slette dette?')) return;

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      setState(items.filter((item: any) => item.id !== id));
    }
  };

  const handleAddReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingReflection) {
      const { data } = await supabase
        .from('reflections')
        .update({
          title: reflectionForm.title,
          what_went_well: reflectionForm.what_went_well,
          improvements: reflectionForm.improvements,
          future_vision: reflectionForm.future_vision || null,
          category: reflectionForm.category || null,
          reflection_date: reflectionForm.reflection_date
        })
        .eq('id', editingReflection.id)
        .select()
        .single();

      if (data) {
        setReflections(reflections.map(r => r.id === data.id ? data : r));
        setShowReflectionForm(false);
        setEditingReflection(null);
        setReflectionForm({
          title: '',
          what_went_well: '',
          improvements: '',
          future_vision: '',
          category: '',
          reflection_date: new Date().toISOString().split('T')[0]
        });
      }
    } else {
      const { data } = await supabase
        .from('reflections')
        .insert([{
          user_id: user.id,
          title: reflectionForm.title,
          what_went_well: reflectionForm.what_went_well,
          improvements: reflectionForm.improvements,
          future_vision: reflectionForm.future_vision || null,
          category: reflectionForm.category || null,
          reflection_date: reflectionForm.reflection_date
        }])
        .select()
        .single();

      if (data) {
        setReflections([data, ...reflections]);
        setShowReflectionForm(false);
        setReflectionForm({
          title: '',
          what_went_well: '',
          improvements: '',
          future_vision: '',
          category: '',
          reflection_date: new Date().toISOString().split('T')[0]
        });
      }
    }
  };

  const editReflection = (reflection: Reflection) => {
    setEditingReflection(reflection);
    setReflectionForm({
      title: reflection.title,
      what_went_well: reflection.what_went_well,
      improvements: reflection.improvements,
      future_vision: reflection.future_vision || '',
      category: reflection.category || '',
      reflection_date: reflection.reflection_date
    });
    setShowReflectionForm(true);
  };

  const affirmationCategories = ['Suksess', 'Helse', 'Selvtillit', 'Kjærlighet', 'Velstand', 'Fred', 'Vekst'];
  const meditationTypes = ['Mindfulness', 'Pusteøvelser', 'Visualisering', 'Body scan', 'Loving-kindness', 'Guidet'];
  const workoutTypes = ['Cardio', 'Styrke', 'Yoga', 'Stretching', 'HIIT', 'Løping', 'Sykling', 'Svømming'];
  const reflectionCategories = ['Personlig', 'Business', 'Helse', 'Relasjoner', 'Økonomi', 'Karriere'];

  const totalMeditationMinutes = meditations.reduce((sum, m) => sum + m.duration_minutes, 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Velvære & Utvikling</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setActiveTab('inspiration')}
          className={`p-4 rounded-xl transition-all ${
            activeTab === 'inspiration'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Inspirasjon</span>
        </button>
        <button
          onClick={() => setActiveTab('affirmations')}
          className={`p-4 rounded-xl transition-all ${
            activeTab === 'affirmations'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Affirmasjoner</span>
        </button>
        <button
          onClick={() => setActiveTab('meditation')}
          className={`p-4 rounded-xl transition-all ${
            activeTab === 'meditation'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Meditasjon</span>
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`p-4 rounded-xl transition-all ${
            activeTab === 'workout'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Trening</span>
        </button>
        <button
          onClick={() => setActiveTab('reflections')}
          className={`p-4 rounded-xl transition-all ${
            activeTab === 'reflections'
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Refleksjoner</span>
        </button>
      </div>

      {activeTab === 'inspiration' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowInspirationForm(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Legg til inspirasjon
          </button>

          {inspirations.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Ingen inspirasjon lagt til ennå</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {inspirations.map((insp) => (
                <div key={insp.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{insp.title}</h3>
                    <button
                      onClick={() => deleteItem('inspirations', insp.id, setInspirations, inspirations)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-300 mb-3 whitespace-pre-wrap">{insp.content}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    {insp.source && <span>— {insp.source}</span>}
                    {insp.category && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                        {insp.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'affirmations' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAffirmationForm(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Legg til affirmasjon
          </button>

          {affirmations.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Ingen affirmasjoner lagt til ennå</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {affirmations.map((aff) => (
                <div key={aff.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-lg text-white mb-2">{aff.affirmation}</p>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                          {aff.category}
                        </span>
                        <span className="text-sm text-slate-400">
                          Praktisert {aff.times_used} ganger
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem('affirmations', aff.id, setAffirmations, affirmations)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => practiceAffirmation(aff.id)}
                    className="w-full mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Praktiser nå
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'meditation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowMeditationForm(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Logg meditasjon
            </button>
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
              <p className="text-sm text-slate-400">Total tid</p>
              <p className="text-xl font-bold text-cyan-400">{totalMeditationMinutes} min</p>
            </div>
          </div>

          {meditations.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Ingen meditasjonsøkter logget ennå</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {meditations.map((med) => (
                <div key={med.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{med.title}</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                          {med.meditation_type}
                        </span>
                        <span className="text-sm text-slate-400">{med.duration_minutes} minutter</span>
                        <span className="text-sm text-slate-400">
                          {new Date(med.meditation_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                      {med.notes && <p className="text-slate-300 text-sm">{med.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteItem('meditations', med.id, setMeditations, meditations)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'workout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => setShowWorkoutForm(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Logg trening
            </button>
            <div className="flex gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                <p className="text-sm text-slate-400">Total tid</p>
                <p className="text-xl font-bold text-cyan-400">{totalWorkoutMinutes} min</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                <p className="text-sm text-slate-400">Kalorier</p>
                <p className="text-xl font-bold text-orange-400">{totalCaloriesBurned} kcal</p>
              </div>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Ingen treningsøkter logget ennå</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <div key={workout.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{workout.title}</h3>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                          {workout.workout_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          workout.intensity === 'high' ? 'bg-red-500/20 text-red-300' :
                          workout.intensity === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {workout.intensity === 'high' ? 'Høy' : workout.intensity === 'medium' ? 'Middels' : 'Lav'} intensitet
                        </span>
                        <span className="text-sm text-slate-400">{workout.duration_minutes} min</span>
                        {workout.calories_burned && (
                          <span className="text-sm text-slate-400">{workout.calories_burned} kcal</span>
                        )}
                        <span className="text-sm text-slate-400">
                          {new Date(workout.workout_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                      {workout.notes && <p className="text-slate-300 text-sm">{workout.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteItem('workouts', workout.id, setWorkouts, workouts)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reflections' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingReflection(null);
              setShowReflectionForm(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny refleksjon
          </button>

          {reflections.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Ingen refleksjoner lagt til ennå</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reflections.map((reflection) => (
                <div key={reflection.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{reflection.title}</h3>
                        {reflection.category && (
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                            {reflection.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        {new Date(reflection.reflection_date).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editReflection(reflection)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem('reflections', reflection.id, setReflections, reflections)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Hva gikk bra
                      </h4>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{reflection.what_went_well}</p>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-orange-300 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Kan gjøres bedre
                      </h4>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{reflection.improvements}</p>
                    </div>

                    {reflection.future_vision && (
                      <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Framtidsvisjon
                        </h4>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{reflection.future_vision}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showInspirationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Legg til inspirasjon</h3>
              <button onClick={() => setShowInspirationForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddInspiration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tittel *</label>
                <input
                  type="text"
                  required
                  value={inspirationForm.title}
                  onChange={(e) => setInspirationForm({ ...inspirationForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Innhold *</label>
                <textarea
                  required
                  rows={4}
                  value={inspirationForm.content}
                  onChange={(e) => setInspirationForm({ ...inspirationForm, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kilde (valgfritt)</label>
                <input
                  type="text"
                  value={inspirationForm.source}
                  onChange={(e) => setInspirationForm({ ...inspirationForm, source: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori (valgfritt)</label>
                <input
                  type="text"
                  value={inspirationForm.category}
                  onChange={(e) => setInspirationForm({ ...inspirationForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setShowInspirationForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAffirmationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Legg til affirmasjon</h3>
              <button onClick={() => setShowAffirmationForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddAffirmation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Affirmasjon *</label>
                <textarea
                  required
                  rows={3}
                  value={affirmationForm.affirmation}
                  onChange={(e) => setAffirmationForm({ ...affirmationForm, affirmation: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Jeg er sterk, kapabel og verdig"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori *</label>
                <select
                  required
                  value={affirmationForm.category}
                  onChange={(e) => setAffirmationForm({ ...affirmationForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg kategori</option>
                  {affirmationCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setShowAffirmationForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMeditationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Logg meditasjon</h3>
              <button onClick={() => setShowMeditationForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMeditation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tittel *</label>
                <input
                  type="text"
                  required
                  value={meditationForm.title}
                  onChange={(e) => setMeditationForm({ ...meditationForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Morgenmeditasjon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                <select
                  required
                  value={meditationForm.meditation_type}
                  onChange={(e) => setMeditationForm({ ...meditationForm, meditation_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg type</option>
                  {meditationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Varighet (minutter) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={meditationForm.duration_minutes}
                  onChange={(e) => setMeditationForm({ ...meditationForm, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={meditationForm.meditation_date}
                  onChange={(e) => setMeditationForm({ ...meditationForm, meditation_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notater (valgfritt)</label>
                <textarea
                  rows={2}
                  value={meditationForm.notes}
                  onChange={(e) => setMeditationForm({ ...meditationForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Lagre
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeditationForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWorkoutForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Logg trening</h3>
              <button onClick={() => setShowWorkoutForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tittel *</label>
                <input
                  type="text"
                  required
                  value={workoutForm.title}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Morgenløp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                <select
                  required
                  value={workoutForm.workout_type}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, workout_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg type</option>
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Varighet (minutter) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={workoutForm.duration_minutes}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Intensitet *</label>
                <select
                  value={workoutForm.intensity}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, intensity: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Lav</option>
                  <option value="medium">Middels</option>
                  <option value="high">Høy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kalorier brent (valgfritt)</label>
                <input
                  type="number"
                  min="0"
                  value={workoutForm.calories_burned}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, calories_burned: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={workoutForm.workout_date}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, workout_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notater (valgfritt)</label>
                <textarea
                  rows={2}
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Lagre
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkoutForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReflectionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full p-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingReflection ? 'Rediger refleksjon' : 'Ny refleksjon'}
              </h3>
              <button
                onClick={() => {
                  setShowReflectionForm(false);
                  setEditingReflection(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddReflection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tittel *</label>
                <input
                  type="text"
                  required
                  value={reflectionForm.title}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Ukens refleksjon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori (valgfritt)</label>
                <select
                  value={reflectionForm.category}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg kategori</option>
                  {reflectionCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={reflectionForm.reflection_date}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, reflection_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">Hva gikk bra? *</label>
                <textarea
                  required
                  rows={4}
                  value={reflectionForm.what_went_well}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, what_went_well: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="Beskriv hva som fungerte godt..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-300 mb-1">Hva kan gjøres bedre? *</label>
                <textarea
                  required
                  rows={4}
                  value={reflectionForm.improvements}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, improvements: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Identifiser forbedringsområder..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-1">Framtidsvisjon (valgfritt)</label>
                <textarea
                  rows={4}
                  value={reflectionForm.future_vision}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, future_vision: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Beskriv dine mål og visjoner for fremtiden..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingReflection ? 'Oppdater' : 'Lagre'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReflectionForm(false);
                    setEditingReflection(null);
                  }}
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
