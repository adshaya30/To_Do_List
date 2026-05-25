import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const routeMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'all-tasks': '/tasks',
    'today': '/today',
    'upcoming': '/upcoming',
    'overdue': '/overdue',
    'important': '/important',
    'completed': '/completed',
    'calendar': '/calendar',
    'ai': '/ai',
    'compare': '/compare',
  };

  const handleNavigation = (itemId: string) => {
    setActiveNav(itemId);
    const path = routeMap[itemId] || '/';
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onNavigate={handleNavigation} activeItem={activeNav} onOpenChange={setSidebarOpen} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-20'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
