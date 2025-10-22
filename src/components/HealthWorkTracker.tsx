import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Briefcase, Plus, X, Trash2, Edit2, Calendar } from 'lucide-react';

interface SickLeave {
  id: string;
  reason: string;
  symptoms: string | null;
  severity: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface WorkLog {
  id: string;
  project_name: string;
  description: string;
  hours_worked: number;
  work_type: string;
  status: 'in_progress' | 'completed' | 'blocked';
  work_date: string;
  notes: string | null;
}

export function HealthWorkTracker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sick' | 'work'>('sick');
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [showSickForm, setShowSickForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [editingSick, setEditingSick] = useState<SickLeave | null>(null);
  const [editingWork, setEditingWork] = useState<WorkLog | null>(null);

  const [sickForm, setSickForm] = useState({
    reason: '',
    symptoms: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  const [workForm, setWorkForm] = useState({
    project_name: '',
    description: '',
    hours_worked: '',
    work_type: '',
    status: 'in_progress' as 'in_progress' | 'completed' | 'blocked',
    work_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchSickLeaves();
      fetchWorkLogs();
    }
  }, [user]);

  const fetchSickLeaves = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sick_leave')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
    if (data) setSickLeaves(data);
  };

  const fetchWorkLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('work_date', { ascending: false });
    if (data) setWorkLogs(data);
  };

  const handleAddSick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingSick) {
      const { data } = await supabase
        .from('sick_leave')
        .update({
          reason: sickForm.reason,
          symptoms: sickForm.symptoms || null,
          severity: sickForm.severity,
          start_date: sickForm.start_date,
          end_date: sickForm.end_date || null,
          notes: sickForm.notes || null
        })
        .eq('id', editingSick.id)
        .select()
        .single();

      if (data) {
        setSickLeaves(sickLeaves.map(s => s.id === data.id ? data : s));
      }
    } else {
      const { data } = await supabase
        .from('sick_leave')
        .insert([{
          user_id: user.id,
          reason: sickForm.reason,
          symptoms: sickForm.symptoms || null,
          severity: sickForm.severity,
          start_date: sickForm.start_date,
          end_date: sickForm.end_date || null,
          notes: sickForm.notes || null
        }])
        .select()
        .single();

      if (data) {
        setSickLeaves([data, ...sickLeaves]);
      }
    }

    resetSickForm();
    setShowSickForm(false);
    setEditingSick(null);
  };

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingWork) {
      const { data } = await supabase
        .from('work_logs')
        .update({
          project_name: workForm.project_name,
          description: workForm.description,
          hours_worked: parseFloat(workForm.hours_worked),
          work_type: workForm.work_type,
          status: workForm.status,
          work_date: workForm.work_date,
          notes: workForm.notes || null
        })
        .eq('id', editingWork.id)
        .select()
        .single();

      if (data) {
        setWorkLogs(workLogs.map(w => w.id === data.id ? data : w));
      }
    } else {
      const { data } = await supabase
        .from('work_logs')
        .insert([{
          user_id: user.id,
          project_name: workForm.project_name,
          description: workForm.description,
          hours_worked: parseFloat(workForm.hours_worked),
          work_type: workForm.work_type,
          status: workForm.status,
          work_date: workForm.work_date,
          notes: workForm.notes || null
        }])
        .select()
        .single();

      if (data) {
        setWorkLogs([data, ...workLogs]);
      }
    }

    resetWorkForm();
    setShowWorkForm(false);
    setEditingWork(null);
  };

  const deleteSick = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne sykmeldingen?')) return;
    const { error } = await supabase.from('sick_leave').delete().eq('id', id);
    if (!error) setSickLeaves(sickLeaves.filter(s => s.id !== id));
  };

  const deleteWork = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne arbeidsloggen?')) return;
    const { error } = await supabase.from('work_logs').delete().eq('id', id);
    if (!error) setWorkLogs(workLogs.filter(w => w.id !== id));
  };

  const editSick = (sick: SickLeave) => {
    setEditingSick(sick);
    setSickForm({
      reason: sick.reason,
      symptoms: sick.symptoms || '',
      severity: sick.severity,
      start_date: sick.start_date,
      end_date: sick.end_date || '',
      notes: sick.notes || ''
    });
    setShowSickForm(true);
  };

  const editWork = (work: WorkLog) => {
    setEditingWork(work);
    setWorkForm({
      project_name: work.project_name,
      description: work.description,
      hours_worked: work.hours_worked.toString(),
      work_type: work.work_type,
      status: work.status,
      work_date: work.work_date,
      notes: work.notes || ''
    });
    setShowWorkForm(true);
  };

  const resetSickForm = () => {
    setSickForm({
      reason: '',
      symptoms: '',
      severity: 'medium',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    });
  };

  const resetWorkForm = () => {
    setWorkForm({
      project_name: '',
      description: '',
      hours_worked: '',
      work_type: '',
      status: 'in_progress',
      work_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const workTypes = ['Utvikling', 'Møte', 'Planlegging', 'Design', 'Testing', 'Dokumentasjon', 'Support'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Sykdom & Jobb</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('sick')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'sick'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Sykdom
          </button>
          <button
            onClick={() => setActiveTab('work')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'work'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Arbeid
          </button>
        </div>
      </div>

      {activeTab === 'sick' && (
        <>
          <button
            onClick={() => {
              setEditingSick(null);
              resetSickForm();
              setShowSickForm(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrer sykdom
          </button>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sykdomshistorikk</h3>
            {sickLeaves.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Ingen sykmeldinger registrert</p>
            ) : (
              <div className="space-y-3">
                {sickLeaves.map((sick) => (
                  <div key={sick.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-red-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{sick.reason}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            sick.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                            sick.severity === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {sick.severity === 'high' ? 'Alvorlig' : sick.severity === 'medium' ? 'Middels' : 'Lett'}
                          </span>
                        </div>
                        {sick.symptoms && <p className="text-slate-400 text-sm mb-2">Symptomer: {sick.symptoms}</p>}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sick.start_date).toLocaleDateString('nb-NO')}
                            {sick.end_date && ` - ${new Date(sick.end_date).toLocaleDateString('nb-NO')}`}
                          </span>
                        </div>
                        {sick.notes && <p className="text-slate-400 text-sm mt-2">{sick.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editSick(sick)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteSick(sick.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'work' && (
        <>
          <button
            onClick={() => {
              setEditingWork(null);
              resetWorkForm();
              setShowWorkForm(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Logg arbeid
          </button>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Arbeidslogg</h3>
            {workLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Ingen arbeidslogger registrert</p>
            ) : (
              <div className="space-y-3">
                {workLogs.map((work) => (
                  <div key={work.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{work.project_name}</h4>
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                            {work.work_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            work.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            work.status === 'blocked' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {work.status === 'completed' ? 'Fullført' :
                             work.status === 'blocked' ? 'Blokkert' : 'Pågår'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{work.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{work.hours_worked} timer</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(work.work_date).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                        {work.notes && <p className="text-slate-400 text-sm mt-2">{work.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editWork(work)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteWork(work.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showSickForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingSick ? 'Rediger sykmelding' : 'Registrer sykdom'}
              </h3>
              <button onClick={() => setShowSickForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSick} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Årsak *</label>
                <input
                  type="text"
                  required
                  value={sickForm.reason}
                  onChange={(e) => setSickForm({ ...sickForm, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  placeholder="F.eks. Forkjølelse, Influensa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Symptomer</label>
                <textarea
                  rows={2}
                  value={sickForm.symptoms}
                  onChange={(e) => setSickForm({ ...sickForm, symptoms: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  placeholder="Beskriv symptomer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Alvorlighetsgrad</label>
                <select
                  value={sickForm.severity}
                  onChange={(e) => setSickForm({ ...sickForm, severity: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="low">Lett</option>
                  <option value="medium">Middels</option>
                  <option value="high">Alvorlig</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Startdato *</label>
                <input
                  type="date"
                  required
                  value={sickForm.start_date}
                  onChange={(e) => setSickForm({ ...sickForm, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sluttdato</label>
                <input
                  type="date"
                  value={sickForm.end_date}
                  onChange={(e) => setSickForm({ ...sickForm, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notater</label>
                <textarea
                  rows={2}
                  value={sickForm.notes}
                  onChange={(e) => setSickForm({ ...sickForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingSick ? 'Oppdater' : 'Lagre'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSickForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWorkForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingWork ? 'Rediger arbeidslogg' : 'Logg arbeid'}
              </h3>
              <button onClick={() => setShowWorkForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddWork} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Prosjekt/Oppgave *</label>
                <input
                  type="text"
                  required
                  value={workForm.project_name}
                  onChange={(e) => setWorkForm({ ...workForm, project_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beskrivelse *</label>
                <textarea
                  rows={2}
                  required
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Timer arbeidet *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={workForm.hours_worked}
                  onChange={(e) => setWorkForm({ ...workForm, hours_worked: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type arbeid *</label>
                <select
                  required
                  value={workForm.work_type}
                  onChange={(e) => setWorkForm({ ...workForm, work_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg type</option>
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={workForm.status}
                  onChange={(e) => setWorkForm({ ...workForm, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="in_progress">Pågår</option>
                  <option value="completed">Fullført</option>
                  <option value="blocked">Blokkert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={workForm.work_date}
                  onChange={(e) => setWorkForm({ ...workForm, work_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notater</label>
                <textarea
                  rows={2}
                  value={workForm.notes}
                  onChange={(e) => setWorkForm({ ...workForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingWork ? 'Oppdater' : 'Lagre'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkForm(false)}
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
