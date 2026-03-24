export const useDashboardData = () => {
  const stats = [
    {
      id: 1,
      label: 'Total Tasks',
      value: '15',
      icon: 'BarChart3',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      id: 2,
      label: 'Completed',
      value: '3',
      icon: 'CheckCircle',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    },
    {
      id: 3,
      label: 'Overdue',
      value: '2',
      icon: 'AlertTriangle',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500'
    },
    {
      id: 4,
      label: "Today's Progress",
      value: '25%',
      icon: 'TrendingUp',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500'
    }
  ];

  const recentTasks = [
    { id: 1, title: 'Database migration', status: 'pending' },
    { id: 2, title: 'Set up CI/CD pipeline', status: 'pending' },
    { id: 3, title: 'Weekly team meeting notes', status: 'completed' }
  ];

  const todaysProgress = {
    completed: 1,
    total: 4,
    percentage: 25
  };

  return {
    stats,
    recentTasks,
    todaysProgress
  };
};
