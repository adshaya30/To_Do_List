import { useEffect, useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

interface Task {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'todo' | 'in-progress' | 'done';
  starred?: boolean;
  reminder?: {
    type: 'none' | '1hour' | '1day' | 'custom';
    date?: string;
    time?: string;
  };
  createdAt?: string;
}

interface NewTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  onUpdate?: (task: Task) => void;
  initialTask?: Task | null;
  mode?: 'create' | 'edit';
}

export const NewTask = ({ isOpen, onClose, onCreate, onUpdate, initialTask, mode = 'create' }: NewTaskProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState<'none' | '1hour' | '1day' | 'custom'>('none');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [starred, setStarred] = useState(false);

  const isEditMode = mode === 'edit' && !!initialTask;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setPriority('Medium');
    setDueDate('');
    setDueTime('');
    setReminder('none');
    setReminderTime('');
    setReminderDate('');
    setStarred(false);
  };

  const applyTaskToForm = (task: Task) => {
    const [taskDate, taskTime = ''] = task.dueDate?.split('T') ?? [];

    setTitle(task.title ?? '');
    setDescription(task.description ?? '');
    setTags(task.tags ?? []);
    setTagInput('');
    setPriority(task.priority ?? 'Medium');
    setDueDate(taskDate ?? '');
    setDueTime(taskTime.slice(0, 5));
    setReminder(task.reminder?.type ?? 'none');
    setReminderDate(task.reminder?.date ?? '');
    setReminderTime(task.reminder?.time ?? '');
    setStarred(task.starred ?? false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialTask) {
      applyTaskToForm(initialTask);
      return;
    }

    resetForm();
  }, [isOpen, initialTask]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleAddTagButton = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    // If the user typed a tag but didn't press Enter, include it as well
    const finalTags = [...tags];
    const pending = tagInput.trim();
    if (pending && !finalTags.includes(pending)) finalTags.push(pending);

    const taskPayload: Task = {
      ...(initialTask?.id ? { id: initialTask.id } : {}),
      title: title.trim(),
      description: description.trim(),
      tags: finalTags,
      dueDate: dueTime ? `${dueDate}T${dueTime}` : dueDate,
      priority,
      status: initialTask?.status ?? 'todo',
      starred,
      reminder: {
        type: reminder,
        date: reminder === 'custom' ? reminderDate : undefined,
        time: reminder === 'custom' ? reminderTime : undefined,
      },
      ...(initialTask?.createdAt ? { createdAt: initialTask.createdAt } : { createdAt: new Date().toISOString() }),
    };

    if (isEditMode && onUpdate) {
      onUpdate(taskPayload);
    } else {
      onCreate(taskPayload);
    }
    
    // Reset form
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Task' : 'New Task'}</h2>
              <button
            onClick={onClose}
            title="Close dialog"
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
                title="Task title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description..."
              rows={4}
                title="Task description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter..."
                title="Add tag"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddTagButton}
                disabled={!tagInput.trim()}
                className="px-4 py-3 rounded-lg bg-[#03396c] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add tag"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white bg-[#03396c]"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      title={`Remove tag ${tag}`}
                      aria-label={`Remove tag ${tag}`}
                      className="hover:opacity-80 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                title="Due date"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                title="Due time"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              title="Priority"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Important */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Important</p>
              <p className="text-xs text-gray-500">Show this task on the Important page</p>
            </div>
            <button
              type="button"
              onClick={() => setStarred((current) => !current)}
              title={starred ? 'Remove from important' : 'Mark as important'}
              aria-label={starred ? 'Remove from important' : 'Mark as important'}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${starred ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'}`}
            >
              <span>{starred ? '★' : '☆'}</span>
              {starred ? 'Important' : 'Mark important'}
            </button>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder</label>
            <div className="space-y-4">
              <select
                value={reminder}
                onChange={(e) => {
                  setReminder(e.target.value as 'none' | '1hour' | '1day' | 'custom');
                }}
                title="Reminder"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c] focus:border-transparent transition-all"
              >
                <option value="none">No Reminder</option>
                <option value="1hour">Before 1 Hour</option>
                <option value="1day">Before 1 Day</option>
                <option value="custom">Set your reminder</option>
              </select>

              {reminder === 'custom' && (
                <div className="space-y-3 bg-white border border-gray-300 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      title="Reminder date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      title="Reminder time"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03396c]"
                    />
                  </div>

                  {reminderDate && reminderTime && (
                    <div className="border rounded-lg p-3 flex items-center gap-2 bg-[#e8f0f8] border-[#03396c]">
                      <Clock size={18} className="text-[#03396c]" />
                      <p className="text-sm font-medium text-[#03396c]">Reminder set for {reminderDate} at {reminderTime}</p>
                    </div>
                  )}
                </div>
              )}

              {reminder === 'custom' && reminderTime && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <Clock size={18} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">✓ Reminder: {reminderDate} at {reminderTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            title="Cancel"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            title={isEditMode ? 'Update task' : 'Create task'}
            className="px-6 py-2.5 text-white font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 bg-[#03396c]"
          >
            <Plus size={18} />
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
