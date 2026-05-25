import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, GripVertical, Tag } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  tags: string[];
  starred?: boolean;
  reminder?: {
    type: 'none' | '1hour' | '1day' | 'custom';
    date?: string;
    time?: string;
  };
  createdAt: string;
}

type ColumnKey = 'yesterday' | 'today' | 'tomorrow';

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

const ComparePage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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
        console.error('Failed to load tasks for compare page:', error);
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

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const columns = useMemo(
    () => ({
      yesterday: {
        label: 'Yesterday',
        date: fmt(yesterday),
        tasks: tasks.filter((task) => task.dueDate.split('T')[0] === fmt(yesterday)),
      },
      today: {
        label: 'Today',
        date: fmt(today),
        tasks: tasks.filter((task) => task.dueDate.split('T')[0] === fmt(today)),
      },
      tomorrow: {
        label: 'Tomorrow',
        date: fmt(tomorrow),
        tasks: tasks.filter((task) => task.dueDate.split('T')[0] === fmt(tomorrow)),
      },
    }),
    [tasks]
  );

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

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (columnKey: ColumnKey) => {
    if (!draggedTaskId) {
      return;
    }

    const targetDate = columns[columnKey].date;
    const nextTasks = tasks.map((task): Task =>
      task.id === draggedTaskId ? { ...task, dueDate: targetDate } : task
    );

    updateTasks(nextTasks);
    setDraggedTaskId(null);
  };

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={() => handleDragStart(task.id)}
      onDragEnd={() => setDraggedTaskId(null)}
      className={`bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleComplete(task.id);
          }}
          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.status === 'done'
              ? 'bg-[#03396c] border-[#03396c] text-white'
              : 'border-gray-300 hover:border-[#03396c]'
          }`}
          aria-label={task.status === 'done' ? 'Mark task as todo' : 'Mark task as done'}
          title={task.status === 'done' ? 'Mark task as todo' : 'Mark task as done'}
        >
          {task.status === 'done' && <CheckCircle2 size={10} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-gray-400">
              <GripVertical size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {task.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
                {task.starred && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                    Important
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-gray-500 truncate">{task.dueDate}</p>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-100">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare View</h1>
        <p className="text-gray-500 text-sm mt-1">Drag tasks between days to reschedule them</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.entries(columns) as Array<[ColumnKey, typeof columns.yesterday]>).map(([key, column]) => (
          <div
            key={key}
            className="min-h-[400px] rounded-xl border border-gray-200 bg-gray-50/70 p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(key)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{column.label}</h2>
                <p className="text-xs text-gray-500">
                  {new Date(`${column.date}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700">
                {column.tasks.length}
              </span>
            </div>

            <div className="min-h-[120px] space-y-2">
              {column.tasks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                  Drop tasks here
                </div>
              ) : null}

              {column.tasks.map((task) => renderTask(task))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparePage;