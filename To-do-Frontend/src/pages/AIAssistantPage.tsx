import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, Clock, Zap, Trophy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface Subtask { id: number; title: string; motivation: string; }
interface Plan {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
  subtasks: Subtask[];
  progress_messages: Record<string, string>;
  combo_messages: string[];
  daily_reflections: string[];
}

const examples = [
  'Plan a birthday party for 20 people',
  'Launch my personal portfolio site',
  'Write a 5-page research paper',
  'Clean and organize my apartment',
];

const difficultyStyles: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  hard: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
};

const AIAssistantPage = () => {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [addedAll, setAddedAll] = useState(false);

  const generate = async (input?: string) => {
    const value = (input ?? task).trim();
    if (!value) return;
    setLoading(true);
    setPlan(null);
    setCompleted(new Set());
    setAddedAll(false);

    // Fallback fake plan generation so the page works without a backend
    setTimeout(() => {
      const fake: Plan = {
        title: `Plan for: ${value}`,
        difficulty: 'medium',
        estimated_time: '2-4 hours',
        subtasks: [
          { id: 1, title: `${value} — Step 1`, motivation: 'Start small and schedule time' },
          { id: 2, title: `${value} — Step 2`, motivation: 'Gather resources and notes' },
          { id: 3, title: `${value} — Step 3`, motivation: 'Execute the first draft / attempt' },
        ],
        progress_messages: { '100': 'You finished! Reward time.', '80': 'Almost there — keep going.' },
        combo_messages: ['Do two quick tasks back-to-back', 'Batch similar items'],
        daily_reflections: ['What went well today?', 'What could be improved tomorrow?'],
      };
      setPlan(fake);
      toast.success('Your plan is ready!');
      setLoading(false);
    }, 800);
  };

  const toggleSubtask = (id: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const progressPct = plan ? Math.round((completed.size / plan.subtasks.length) * 100) : 0;
  const milestoneMsg = (() => {
    if (!plan) return null;
    const thresholds = [100, 90, 80, 70];
    const hit = thresholds.find(t => progressPct >= t);
    return hit ? plan.progress_messages[String(hit)] : null;
  })();

  const addAllAsTasks = () => {
    if (!plan) return;
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('tasks');
    let tasks = [] as any[];
    if (stored) {
      try { tasks = JSON.parse(stored); } catch { tasks = []; }
    }
    // create a parent task to group these AI-generated subtasks
    const parentId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    tasks.push({
      id: parentId,
      title: plan.title,
      description: `AI-generated plan (${plan.subtasks.length} items)`,
      priority: 'Medium',
      dueDate: today,
      status: 'todo',
      tags: ['AI','Plan'],
      createdAt: new Date().toISOString(),
    });

    plan.subtasks.forEach(s => {
      tasks.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        title: s.title,
        description: s.motivation,
        priority: 'Medium',
        dueDate: today,
        status: 'todo',
        tags: ['AI'],
        parentId,
        createdAt: new Date().toISOString(),
      });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    setAddedAll(true);
    window.dispatchEvent(new Event('tasks-updated'));
    toast.success(`Added ${plan.subtasks.length} subtasks to your list`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#03396c] flex items-center justify-center shadow-sm">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#03396c]">Planify AI</h1>
          <p className="text-base text-gray-600">Turn overwhelm into momentum — one tiny win at a time.</p>
        </div>
      </div>

      {/* Input */}
      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <label className="block text-base font-semibold mb-2 text-[#03396c]">What's on your plate?</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. Prepare for my job interview next week"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03396c] text-base"
            disabled={loading}
          />
          <button
            onClick={() => generate()}
            disabled={loading || !task.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#03396c] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Thinking...' : 'Break it down'}
          </button>
        </div>
        {!plan && !loading && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map(ex => (
                <button
                  key={ex}
                  onClick={() => { setTask(ex); generate(ex); }}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white border border-gray-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Plan */}
      {plan && (
        <div className="mt-6 animate-fade-in space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#03396c]">{plan.title}</h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${difficultyStyles[plan.difficulty] || difficultyStyles.medium}`}>
                    <Zap className="w-3 h-3" /> {plan.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {plan.estimated_time}
                  </span>
                </div>
              </div>
              <button
                onClick={addAllAsTasks}
                disabled={addedAll}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#03396c]/30 bg-[#03396c]/10 text-[#03396c] text-sm font-medium hover:bg-[#03396c]/20 transition-colors disabled:opacity-50"
              >
                {addedAll ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {addedAll ? 'Added' : 'Add all as tasks'}
              </button>
            </div>

            {/* Progress */}
              <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{completed.size} of {plan.subtasks.length} complete</span>
                <span className="font-semibold text-[#03396c]">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#03396c] to-[#03396c] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {milestoneMsg && (
                <div className="mt-3 p-3 rounded-lg bg-[#03396c]/5 border border-[#03396c]/20 text-sm font-medium text-gray-900 flex items-start gap-2 animate-fade-in">
                  <Trophy className="w-4 h-4 text-[#03396c] flex-shrink-0 mt-0.5" />
                  <span>{milestoneMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            {plan.subtasks.map(s => {
              const done = completed.has(s.id);
              return (
                <div
                  key={s.id}
                  className={`group flex items-start gap-4 p-4 rounded-xl border bg-white transition-all ${done ? 'border-[#03396c]/40 bg-[#03396c]/5' : 'border-gray-200 hover:border-[#03396c]/30 hover:shadow-sm'}`}
                >
                  <button
                    onClick={() => toggleSubtask(s.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${done ? 'bg-[#03396c] border-[#03396c]' : 'border-gray-300 hover:border-[#03396c]'}`}
                  >
                    {done && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">#{s.id}</span>
                      <h3 className={`font-medium ${done ? 'line-through text-gray-500' : ''}`}>{s.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 italic">✨ {s.motivation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combo + reflections */}
          {(plan.combo_messages?.length || plan.daily_reflections?.length) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.combo_messages?.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Streak boosters</h4>
                  <ul className="space-y-1.5 text-sm">
                    {plan.combo_messages.map((m, i) => (
                      <li key={i} className="flex gap-2"><span>🔥</span><span>{m}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.daily_reflections?.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Daily reflections</h4>
                  <ul className="space-y-1.5 text-sm">
                    {plan.daily_reflections.map((m, i) => (
                      <li key={i} className="flex gap-2"><span>🌱</span><span>{m}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
