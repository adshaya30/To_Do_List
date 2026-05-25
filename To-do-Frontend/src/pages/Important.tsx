import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Star } from 'lucide-react';

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

const Important = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
        console.error('Failed to load important tasks:', error);
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

  const importantTasks = useMemo(() => tasks.filter((task) => task.starred), [tasks]);

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

  const toggleStar = (taskId: string) => {
    const nextTasks = tasks.map((task): Task =>
      task.id === taskId ? { ...task, starred: !task.starred } : task
    );

    updateTasks(nextTasks);
  };

  const priorityClass: Record<Task['priority'], string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (!dateString.includes('T')) {
      return dateFormatted;
    }

    const timeFormatted = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateFormatted} at ${timeFormatted}`;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
          <h1 className="text-4xl font-bold text-gray-900">Important</h1>
        </div>
        <p className="text-gray-500 text-lg">Starred tasks appear here</p>
        <p className="text-sm text-gray-500">
          {importantTasks.length} task{importantTasks.length === 1 ? '' : 's'}
        </p>
      </div>

      {importantTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-900">No important tasks yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Mark any task as important from All Tasks to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {importantTasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleStar(task.id)}
                  className="mt-0.5 flex-shrink-0 text-yellow-500"
                  title="Remove from important"
                  aria-label="Remove from important"
                >
                  <Star className="h-5 w-5" fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0"
                  title="Toggle completion"
                  aria-label="Toggle completion"
                >
                  {task.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-[#03396c]" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-lg font-semibold ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {task.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                          #{tag}
                        </span>
                    ))}
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    Due: {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Important;