import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock3, TriangleAlert } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  tags: string[];
  parentId?: string;
  reminder?: {
    type: 'none' | '1hour' | '1day' | 'custom';
    date?: string;
    time?: string;
  };
  createdAt: string;
}

type FilterType = 'today' | 'upcoming' | 'overdue' | 'completed';

interface TaskDateListProps {
  title: string;
  subtitle: string;
  filterType: FilterType;
}

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!dateString.includes('T')) {
    return datePart;
  }

  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart} at ${timePart}`;
};

const priorityClass: Record<Task['priority'], string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const TaskDateList = ({ title, subtitle, filterType }: TaskDateListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem('tasks');
      if (!storedTasks) {
        setTasks([]);
        return;
      }

      try {
        const parsed: Task[] = JSON.parse(storedTasks);

        // Cleanup orphan subtasks: remove tasks that reference a non-existent parent
        const idSet = new Set(parsed.map((t) => t.id));
        const cleaned = parsed.filter((t) => !t.parentId || idSet.has(t.parentId));

        if (cleaned.length !== parsed.length) {
          console.warn('Removed orphan subtasks during load:', parsed.length - cleaned.length);
          localStorage.setItem('tasks', JSON.stringify(cleaned));
          setTasks(cleaned);
          window.dispatchEvent(new Event('tasks-updated'));
          return;
        }

        setTasks(parsed);
      } catch (error) {
        console.error('Failed to load tasks:', error);
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

  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const filteredTasks = useMemo(() => {
    const getDueKey = (task: Task) => task.dueDate.split('T')[0];

    return tasks
      .filter((task) => {
        if (selectedTag && !task.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())) {
          return false;
        }

        const dueKey = getDueKey(task);

        if (filterType === 'completed') {
          return task.status === 'done';
        }

        if (filterType === 'today') {
          return dueKey === todayKey;
        }

        if (filterType === 'upcoming') {
          return dueKey > todayKey;
        }

        return dueKey < todayKey && task.status !== 'done';
      })
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
  }, [tasks, filterType, selectedTag, todayKey]);

  const topLevelTasks = useMemo(
    () => filteredTasks.filter((task) => !task.parentId || !filteredTasks.some((parent) => parent.id === task.parentId)),
    [filteredTasks]
  );

  const availableTags = useMemo(() => {
    const uniqueTags = new Set<string>();

    tasks.forEach((task) => {
      task.tags.forEach((tag) => uniqueTags.add(tag));
    });

    return Array.from(uniqueTags).sort((left, right) => left.localeCompare(right));
  }, [tasks]);

  const updateTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    localStorage.setItem('tasks', JSON.stringify(nextTasks));
    window.dispatchEvent(new Event('tasks-updated'));
  };

  const toggleParentExpanded = (taskId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  const toggleComplete = (taskId: string) => {
    const nextTasks = tasks.map((task): Task =>
      task.id === taskId
        ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
        : task
    );

    updateTasks(nextTasks);
  };

  const getHeaderIcon = () => {
    switch (filterType) {
      case 'today':
        return <Clock3 className="h-5 w-5 text-[#03396c]" />;
      case 'upcoming':
        return <CheckCircle2 className="h-5 w-5 text-[#03396c]" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-[#03396c]" />;
      default:
        return <TriangleAlert className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {getHeaderIcon()}
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        </div>
        <p className="text-gray-500 text-lg">{subtitle}</p>
        <p className="text-sm text-gray-500">
          {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}
        </p>
        {availableTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Tags:</span>
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTag === '' ? 'bg-[#03396c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTag === tag ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className="rounded-full px-3 py-1 text-xs font-medium text-gray-500 underline underline-offset-2"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-900">No tasks found</p>
          <p className="mt-2 text-sm text-gray-500">
            {filterType === 'completed'
              ? 'Complete a task to see it here.'
              : filterType === 'overdue'
              ? 'You are all caught up.'
              : 'Add tasks with matching due dates to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 max-w-5xl">
          {topLevelTasks.map((task) => {
            const children = filteredTasks.filter((child) => child.parentId === task.id);
            const isExpanded = expandedParents.has(task.id);

            return (
            <div key={task.id} className="mx-auto w-full max-w-3xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0"
                  title={task.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
                  aria-label={task.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
                >
                  {task.status === 'done' ? (
                    <div className="w-6 h-6 bg-[#03396c] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center">
                      <Circle className="w-4 h-4 text-gray-400" />
                    </div>
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
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100 hover:bg-blue-100"
                          title={`Filter by ${tag}`}
                          aria-label={`Filter by ${tag}`}
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    Due: {formatDisplayDate(task.dueDate)}
                  </p>

                  {children.length > 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => toggleParentExpanded(task.id)}
                        className="text-sm font-medium text-[#03396c] hover:underline"
                      >
                        {isExpanded ? `Hide subtasks (${children.length})` : `Show subtasks (${children.length})`}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {children.map((child) => (
                            <div key={child.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleComplete(child.id)}
                                  className="mt-0.5 flex-shrink-0"
                                  title={child.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
                                  aria-label={child.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
                                >
                                  {child.status === 'done' ? (
                                    <div className="w-5 h-5 bg-[#03396c] rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 border border-gray-300 rounded-md flex items-center justify-center">
                                      <Circle className="w-3 h-3 text-gray-400" />
                                    </div>
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className={`text-sm font-semibold ${child.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                      {child.title}
                                    </h3>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass[child.priority]}`}>
                                      {child.priority}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-600">
                                    {child.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskDateList;