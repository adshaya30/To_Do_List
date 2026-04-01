import { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  reminder: string;
  reminderTime?: string;
}

interface NewTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

export const NewTask = ({ isOpen, onClose, onCreate }: NewTaskProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState('none');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSetCustomReminder = () => {
    if (reminderDate && reminderTime) {
      setReminder('custom');
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const newTask: any = {
      title: title.trim(),
      description: description.trim(),
      tags,
      dueDate: dueTime ? `${dueDate}T${dueTime}` : dueDate,
      priority,
      status: 'todo',
      reminder: {
        type: reminder,
        date: reminder === 'custom' ? reminderDate : undefined,
        time: reminder === 'custom' ? reminderTime : undefined,
      }
    };

    onCreate(newTask);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setDueDate('');
    setDueTime('');
    setReminder('none');
    setReminderTime('');
    setReminderDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">New Task</h2>
          <button
            onClick={onClose}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
              style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: '#03396c' }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder</label>
            <div className="space-y-4">
              <select
                value={reminder}
                onChange={(e) => {
                  setReminder(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#03396c' } as React.CSSProperties}
                    />
                  </div>

                  {reminderDate && reminderTime && (
                    <div className="border rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: '#e8f0f8', borderColor: '#03396c' }}>
                      <Clock size={18} style={{ color: '#03396c' }} />
                      <p className="text-sm font-medium" style={{ color: '#03396c' }}>Reminder set for {reminderDate} at {reminderTime}</p>
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
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 text-white font-medium rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#03396c' }}
          >
            <Plus size={18} />
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
