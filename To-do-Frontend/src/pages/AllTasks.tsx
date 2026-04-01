import { useState, useEffect } from 'react';
import { Search, Grid3x3, List, Calendar, Settings, Edit2, Trash2 } from 'lucide-react';
import { NewTask } from '../components/NewTask';

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

const AllTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

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

  // Filter tasks based on search query
  useEffect(() => {
    const filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredTasks(filtered);
  }, [tasks, searchQuery]);

  const handleCreateTask = (newTask: any) => {
    const taskWithId: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, taskWithId];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setIsModalOpen(false);
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
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-[#03396c] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-[#03396c] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List size={20} />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
            <Calendar size={20} />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Tasks Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative group"
            >
              {/* Edit and Delete buttons - show on hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all">
                  <Edit2 size={16} />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Checkbox and Title */}
              <div className="flex items-start gap-3 mb-3 pr-16">
                <input
                  type="checkbox"
                  checked={completedTasks.has(task.id)}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="w-5 h-5 mt-1 cursor-pointer accent-[#03396c] rounded"
                />
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
                {completedTasks.has(task.id) && (
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-base mb-4 line-clamp-2">
                {task.description}
              </p>

              {/* Priority and Tags on same line */}
              <div className="mb-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-gray-700 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.tags.length > 0 && task.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
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

              {/* Reminder info (if set) */}
              {task.reminder && task.reminder.type !== 'none' && (
                <div className="mb-3 text-base text-gray-700 ">
                  {task.reminder.type === '1hour' && '⏰ Reminder: 1 hour before'}
                  {task.reminder.type === '1day' && '⏰ Reminder: 1 day before'}
                  {task.reminder.type === 'custom' && `⏰ Reminder: ${task.reminder.time}`}
                </div>
              )}

              {/* Due Date */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-base text-gray-700 ">
                  Due: {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all group relative"
            >
              <input
                type="checkbox"
                checked={completedTasks.has(task.id)}
                onChange={() => toggleTaskCompletion(task.id)}
                className="w-5 h-5 cursor-pointer accent-[#03396c] rounded"
              />
              
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    completedTasks.has(task.id)
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs text-gray-700 font-bold whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>

              <div className="flex gap-2 flex-wrap max-w-xs">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-base text-gray-700 w-32 whitespace-nowrap">
                {formatDate(task.dueDate)}
              </p>

              {completedTasks.has(task.id) && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  ✓
                </div>
              )}

              {/* Edit and Delete buttons - show on hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0">
                <button className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all">
                  <Edit2 size={16} />
                </button>
                <button className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
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
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
};

export default AllTasks;
