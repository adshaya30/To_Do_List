import { useState, useEffect, useRef } from 'react';
import { Search, Grid3x3, List, Calendar, Edit2, Trash2, Star, CheckCircle2, Circle } from 'lucide-react';
import { NewTask } from '../components/NewTask';
import { toast } from 'react-toastify';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  tags: string[];
  parentId?: string;
  starred?: boolean;
  reminder?: {
    type: 'none' | '1hour' | '1day' | 'custom';
    date?: string;
    time?: string;
  };
  createdAt: string;
}

const AllTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'dueDate' | 'alpha' | 'priority'>('dueDate');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const availableTags = Array.from(new Set(tasks.flatMap(t => t.tags || []))).sort();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const persistTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    localStorage.setItem('tasks', JSON.stringify(nextTasks));
    window.dispatchEvent(new Event('tasks-updated'));
  };
  const [headerImages, setHeaderImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('headerImages');
    if (raw) {
      try {
        setHeaderImages(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const saveHeaderImages = (imgs: string[]) => {
    setHeaderImages(imgs);
    localStorage.setItem('headerImages', JSON.stringify(imgs));
  };

  const handleCalendarIconClick = () => {
    // trigger file chooser
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const next = [result, ...headerImages].slice(0, 3); // keep up to 3
      saveHeaderImages(next);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be selected again
    e.currentTarget.value = '';
  };

  const toggleParentExpanded = (id: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }, []);

  // Filter tasks based on search query and selected tag
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesTag = tagFilter === 'All' ? true : (task.tags || []).includes(tagFilter);
      return matchesQuery && matchesTag;
    });
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, tagFilter]);

  const displayedTasks = (() => {
    const list = filteredTasks.slice();

    const priorityRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

    switch (sortBy) {
      case 'created':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'dueDate':
        list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'alpha':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'priority':
        list.sort((a, b) => (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99));
        break;
      default:
        break;
    }

    // No tag-based sorting column — tag filter only

    return list;
  })();

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCreateTask = (newTask: any) => {
    const taskWithId: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      starred: newTask.starred ?? false,
    };
    const updatedTasks = [...tasks, taskWithId];
    persistTasks(updatedTasks);
    setIsModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: any) => {
    if (!editingTask) {
      return;
    }

    const taskWithId: Task = {
      ...editingTask,
      ...updatedTask,
      id: editingTask.id,
      createdAt: editingTask.createdAt,
      starred: updatedTask.starred ?? editingTask.starred ?? false,
    };

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? taskWithId : task
    );

    persistTasks(updatedTasks);
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    let deleteToastId: string | number;

    const removeTask = () => {
      // Build parent -> children map for reliable descendant traversal
      const childrenMap = new Map<string, string[]>();
      tasks.forEach((t) => {
        if (t.parentId) {
          const arr = childrenMap.get(t.parentId) || [];
          arr.push(t.id);
          childrenMap.set(t.parentId, arr);
        }
      });

      const idsToDelete = new Set<string>();
      const stack = [taskId];

      while (stack.length > 0) {
        const current = stack.pop() as string;
        if (idsToDelete.has(current)) continue;
        idsToDelete.add(current);
        const kids = childrenMap.get(current) || [];
        for (const kidId of kids) {
          if (!idsToDelete.has(kidId)) stack.push(kidId);
        }
      }

      const updatedTasks = tasks.filter((taskItem) => !idsToDelete.has(taskItem.id));
      const updatedCompleted = new Set(completedTasks);
      idsToDelete.forEach((id) => updatedCompleted.delete(id));

      persistTasks(updatedTasks);
      setCompletedTasks(updatedCompleted);
      toast.dismiss(deleteToastId);
      toast.success(task ? `Deleted "${task.title}"` : 'Task deleted', {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    deleteToastId = toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">
            {task ? `Delete "${task.title}"?` : 'Delete this task?'}
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                closeToast?.();
                toast.dismiss(deleteToastId);
              }}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={removeTask}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        position: 'top-right',
        hideProgressBar: true,
        theme: 'dark',
        className: 'delete-confirm-toast',
      }
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleStar = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, starred: !task.starred } : task
    );

    persistTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dateFormatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      // Check if time is included in the original string
      if (dateString.includes('T')) {
        return `${dateFormatted} at ${timeFormatted}`;
      }
      return dateFormatted;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-500 text-lg mt-1">{filteredTasks.length} tasks</p>
          {/* tag chips reverted per user request */}
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-semibold shadow-sm bg-[#03396c]"
        >
          + New Task
        </button>
      </div>

      {/* Search and View Controls */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#03396c]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
              aria-label="Sort tasks"
            >
              <option value="created">Created</option>
              <option value="dueDate">Due Date</option>
              <option value="alpha">Alphabetical</option>
              <option value="priority">Priority (High→Low)</option>
            </select>

            <div className="ml-3 flex items-center gap-2">
              <label className="text-sm text-gray-500">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                aria-label="Filter by tag"
              >
                <option value="All">All</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#03396c] text-white' : 'bg-gray-100 text-gray-600'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-[#03396c] text-white' : 'bg-gray-100 text-gray-600'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List size={20} />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title="Calendar"
              aria-label="Calendar"
              onClick={handleCalendarIconClick}
            >
              <Calendar size={20} />
            </button>
            {/* settings button removed per request */}
          </div>
        </div>
      </div>
      {/* header images (user-uploaded) */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <input
          ref={fileInputRef}
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload header image"
          title="Upload header image"
        />
        {headerImages.map((src, idx) => (
          <img key={idx} src={src} alt={`header-${idx}`} className="h-10 w-auto rounded-md shadow-sm" />
        ))}
      </div>

      {/* Tasks Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTasks.filter(t => !t.parentId).map((task) => {
            const children = tasks.filter(c => c.parentId === task.id);
            const isExpanded = expandedParents.has(task.id);
            return (
              <div
                key={task.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative group w-full max-w-sm justify-self-center"
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    type="button"
                    aria-label={task.starred ? 'Remove from important' : 'Mark as important'}
                    title={task.starred ? 'Remove from important' : 'Mark as important'}
                    onClick={() => handleToggleStar(task.id)}
                    className={`p-1 rounded-md bg-white/90 shadow-sm transition-all ${task.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-600 hover:text-yellow-500'}`}
                  >
                    <Star size={16} fill={task.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="absolute top-4 right-12 z-20 flex gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  <button
                    type="button"
                    aria-label="Edit task"
                    title="Edit task"
                    onClick={() => handleEditTask(task)}
                    className="p-1 rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete task"
                    title="Delete task"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-3 pr-16">
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="mt-0.5 flex-shrink-0"
                    title={completedTasks.has(task.id) ? 'Mark as not completed' : 'Mark as completed'}
                    aria-label={completedTasks.has(task.id) ? 'Mark as not completed' : 'Mark as completed'}
                  >
                    {completedTasks.has(task.id) ? (
                      <div className="w-6 h-6 bg-[#03396c] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center">
                        <Circle className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </button>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-lg ${
                        completedTasks.has(task.id)
                          ? 'text-gray-400 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-700 text-base mb-4 line-clamp-2">
                  {task.description}
                </p>

                <div className="mb-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-gray-700 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.tags.length > 0 && task.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100"
                        aria-label={`Tag ${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {task.reminder && task.reminder.type !== 'none' && (
                  <div className="mb-3 text-base text-gray-700 ">
                    {task.reminder.type === '1hour' && '⏰ Reminder: 1 hour before'}
                    {task.reminder.type === '1day' && '⏰ Reminder: 1 day before'}
                    {task.reminder.type === 'custom' && `⏰ Reminder: ${task.reminder.time}`}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-base text-gray-700 ">
                    Due: {formatDate(task.dueDate)}
                  </p>
                  {children.length > 0 ? (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleParentExpanded(task.id)}
                        className="text-sm text-[#03396c] font-medium hover:underline"
                      >
                        {isExpanded ? `Hide subtasks (${children.length})` : `Show subtasks (${children.length})`}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          {children.map(child => (
                            <div key={child.id} className="pl-4 py-2 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button onClick={() => toggleTaskCompletion(child.id)} className="flex-shrink-0">
                                  {completedTasks.has(child.id) ? (
                                    <div className="w-5 h-5 bg-[#03396c] rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                                  ) : (
                                    <div className="w-5 h-5 border border-gray-300 rounded-md flex items-center justify-center"><Circle className="w-3 h-3 text-gray-400" /></div>
                                  )}
                                </button>
                                <div>
                                  <div className="font-medium">{child.title}</div>
                                  <div className="text-xs text-gray-500">{child.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  aria-label="Edit subtask"
                                  title="Edit subtask"
                                  onClick={() => handleEditTask(child as any)}
                                  className="p-1 rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Delete subtask"
                                  title="Delete subtask"
                                  onClick={() => handleDeleteTask(child.id)}
                                  className="p-1 rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400 italic">Subtask not available</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="hidden md:block">
            <div className="grid grid-cols-12 gap-3 p-3 border-b border-gray-100 text-sm font-semibold text-gray-600">
              <div className="col-span-1"> </div>
              <div className="col-span-4">Title</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-3">Due Date</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Tags</div>
              <div className="col-span-1"> </div>
            </div>
          </div>

          <div>
            {displayedTasks.filter(t => !t.parentId).map((task) => {
              const children = tasks.filter(c => c.parentId === task.id);
              const isCompleted = completedTasks.has(task.id);
              return (
                <div key={task.id} className="border-b border-gray-100 last:border-b-0">
                  <div className="grid grid-cols-12 gap-3 items-center p-3 hover:bg-gray-50">
                    <div className="col-span-1 flex items-center">
                      <button onClick={() => toggleTaskCompletion(task.id)} aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'} className="mr-2">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-[#03396c] rounded-full flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        ) : (
                          <div className="w-6 h-6 border border-gray-300 rounded-md flex items-center justify-center"><Circle className="w-4 h-4 text-gray-400" /></div>
                        )}
                      </button>
                    </div>

                    <div className="col-span-4">
                      <div className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                    </div>

                    <div className="col-span-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    </div>

                    <div className="col-span-3 text-sm text-gray-700">{formatDate(task.dueDate)}</div>

                    <div className="col-span-1 text-sm text-gray-700">{task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'To Do'}</div>

                    <div className="col-span-1">
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <button onClick={() => handleEditTask(task)} aria-label="Edit task" className="p-2 rounded-md bg-white/90 shadow-sm hover:bg-gray-200 text-gray-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} aria-label="Delete task" className="p-2 rounded-md bg-white/90 shadow-sm hover:bg-gray-200 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div className="pl-12 bg-gray-50">
                      {children.map(child => (
                        <div key={child.id} className="grid grid-cols-12 gap-3 items-center p-3 border-t border-gray-100">
                          <div className="col-span-1 flex items-center">
                            <button onClick={() => toggleTaskCompletion(child.id)} aria-label={completedTasks.has(child.id) ? 'Mark as not completed' : 'Mark as completed'}>
                              {completedTasks.has(child.id) ? (
                                <div className="w-5 h-5 bg-[#03396c] rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                              ) : (
                                <div className="w-5 h-5 border border-gray-300 rounded-md flex items-center justify-center"><Circle className="w-3 h-3 text-gray-400" /></div>
                              )}
                            </button>
                          </div>
                          <div className="col-span-4">
                            <div className={`font-medium ${completedTasks.has(child.id) ? 'line-through text-gray-400' : 'text-gray-900'}`}>{child.title}</div>
                            <div className="text-xs text-gray-500">{child.description}</div>
                          </div>
                          <div className="col-span-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(child.priority)}`}>{child.priority}</span>
                          </div>
                          <div className="col-span-3 text-sm text-gray-700">{formatDate(child.dueDate)}</div>
                          <div className="col-span-1 text-sm text-gray-700">{child.status === 'done' ? 'Done' : child.status === 'in-progress' ? 'In Progress' : 'To Do'}</div>
                          <div className="col-span-1">
                            <div className="flex flex-wrap gap-2">
                              {child.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">#{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-1 flex items-center justify-end gap-2">
                            <button onClick={() => handleEditTask(child as any)} aria-label="Edit subtask" title="Edit" className="p-2 rounded-md bg-white/90 shadow-sm hover:bg-gray-200 text-gray-600"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteTask(child.id)} aria-label="Delete subtask" title="Delete" className="p-2 rounded-md bg-white/90 shadow-sm hover:bg-gray-200 text-red-600"><Trash2 size={14} /></button>
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

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No tasks found</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#03396c] font-semibold hover:underline"
          >
            Create your first task
          </button>
        </div>
      )}

      {/* New Task Modal */}
      <NewTask
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        initialTask={editingTask as any}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  );
};

export default AllTasks;
