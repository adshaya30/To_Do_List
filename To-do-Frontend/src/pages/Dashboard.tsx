import { useState, useEffect } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { BarChart3, CheckCircle, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { NewTask } from '../components/NewTask';

const Dashboard = () => {
  const { stats, recentTasks, todaysProgress } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const iconMap = {
    BarChart3: <BarChart3 size={28} />,
    CheckCircle: <CheckCircle size={28} />,
    AlertTriangle: <AlertTriangle size={28} />,
    TrendingUp: <TrendingUp size={28} />
  };

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (error) {
          console.error('Failed to load tasks:', error);
        }
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

  const handleCreateTask = (newTask: any) => {
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, taskWithId];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new Event('tasks-updated'));
    console.log('New task created:', taskWithId);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-xl mt-1">Overview of your productivity</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-semibold shadow-sm bg-[#03396c]"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>{iconMap[stat.icon as keyof typeof iconMap]}</div>
              <p className="text-gray-500 text-base  whitespace-normal">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's Progress Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Progress</h2>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-[#03396c]" style={{ width: `${todaysProgress.percentage}%` }}></div>
            </div>
          </div>
          <span className="text-lg font-semibold text-gray-900">{todaysProgress.completed}/{todaysProgress.total}</span>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Tasks</h2>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
              <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-[#03396c]' : 'bg-red-500'}`}></div>
              <span className="text-gray-700">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* New Task Modal */}
      <NewTask
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </>
  );
};

export default Dashboard;
