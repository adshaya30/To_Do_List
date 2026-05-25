import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  tags: string[];
  reminder?: {
    type: 'none' | '1hour' | '1day' | 'custom';
    date?: string;
    time?: string;
  };
  createdAt: string;
}

const CalendarPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem('tasks');
      if (!storedTasks) {
        setTasks([]);
        return;
      }

      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Failed to load tasks for calendar:', error);
      }
    };

    loadTasks();

    const handleTasksUpdated = () => loadTasks();
    window.addEventListener('tasks-updated', handleTasksUpdated);
    window.addEventListener('storage', handleTasksUpdated);

    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
      window.removeEventListener('storage', handleTasksUpdated);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigate = (dir: number) => {
    const date = new Date(currentDate);
    if (mode === 'month') {
      date.setMonth(date.getMonth() + dir);
    } else {
      date.setDate(date.getDate() + dir * 7);
    }
    setCurrentDate(date);
  };

  const getDateKey = (dateString: string) => dateString.split('T')[0];

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const key = getDateKey(task.dueDate);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  const updateTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    localStorage.setItem('tasks', JSON.stringify(nextTasks));
    window.dispatchEvent(new Event('tasks-updated'));
  };

  const toggleComplete = (taskId: string) => {
    const nextTasks = tasks.map((task): Task =>
      task.id === taskId
        ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
        : task
    );
    updateTasks(nextTasks);
  };

  const fmt = (date: Date) => date.toISOString().split('T')[0];

  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const renderTaskChip = (task: Task) => (
    <button
      key={task.id}
      type="button"
      onClick={() => toggleComplete(task.id)}
      className={`text-left text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors ${getPriorityClass(task.priority)} ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
      title={`Toggle ${task.title}`}
    >
      {task.title}
    </button>
  );

  const renderMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = fmt(new Date());
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(<div key={`empty-${i}`} className="h-24 md:h-32" />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = fmt(new Date(year, month, day));
      const dayTasks = tasksByDate[dateStr] || [];
      const isToday = dateStr === today;

      cells.push(
        <div
          key={dateStr}
          className={`h-24 md:h-32 border border-border rounded-lg p-1.5 overflow-hidden ${isToday ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}
        >
          <span className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            {day}
          </span>
          <div className="mt-1 space-y-0.5">
            {dayTasks.slice(0, 3).map(renderTaskChip)}
            {dayTasks.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</span>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  const renderWeek = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const today = fmt(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);
      const dateStr = fmt(date);
      const dayTasks = tasksByDate[dateStr] || [];
      const isToday = dateStr === today;

      return (
        <div
          key={dateStr}
          className={`min-h-[200px] border border-border rounded-lg p-3 ${isToday ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}
        >
          <div className="text-center mb-2">
            <div className="text-xs text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
              {date.getDate()}
            </div>
          </div>
          <div className="space-y-1.5">
            {dayTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleComplete(task.id)}
                className={`w-full text-left text-xs p-2 rounded-lg cursor-pointer transition-colors ${getPriorityClass(task.priority)} ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                title={`Toggle ${task.title}`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      );
    });
  };

  const headerLabel =
    mode === 'month'
      ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : (() => {
          const start = new Date(currentDate);
          start.setDate(start.getDate() - start.getDay());
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        })();

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-lg mt-1">View tasks by due date</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('month')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${mode === 'month' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setMode('week')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${mode === 'week' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} title="Previous period" aria-label="Previous period" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[140px] text-center">{headerLabel}</span>
            <button type="button" onClick={() => navigate(1)} title="Next period" aria-label="Next period" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {mode === 'month' ? (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div key={label} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderMonth()}</div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">{renderWeek()}</div>
      )}
    </div>
  );
};

export default CalendarPage;