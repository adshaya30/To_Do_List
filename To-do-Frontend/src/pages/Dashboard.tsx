import { useDashboardData } from '../hooks/useDashboardData';
import { BarChart3, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { stats, recentTasks, todaysProgress } = useDashboardData();
  
  const iconMap = {
    BarChart3: <BarChart3 size={28} />,
    CheckCircle: <CheckCircle size={28} />,
    AlertTriangle: <AlertTriangle size={28} />,
    TrendingUp: <TrendingUp size={28} />
  };
  return (
  
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-xl mt-1">Overview of your productivity</p>

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
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${todaysProgress.percentage}%` }}></div>
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
              <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-700">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
