import { useState } from 'react';
import { LayoutGrid, ListTodo, Sun, Calendar, AlertTriangle, Star, CheckCircle, ArrowRightLeft, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  onNavigate?: (itemId: string) => void;
  activeItem?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

const Sidebar = ({ onNavigate, activeItem = 'dashboard', onOpenChange }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const menuItems: SidebarItem[] = [
    { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { id: 'all-tasks', icon: <ListTodo size={20} />, label: 'All Tasks' },
    { id: 'today', icon: <Sun size={20} />, label: 'Today' },
    { id: 'upcoming', icon: <Calendar size={20} />, label: 'Upcoming' },
    { id: 'overdue', icon: <AlertTriangle size={20} />, label: 'Overdue' },
    { id: 'important', icon: <Star size={20} />, label: 'Important' },
    { id: 'completed', icon: <CheckCircle size={20} />, label: 'Completed' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Calendar' },
    { id: 'compare', icon: <ArrowRightLeft size={20} />, label: 'Compare' },
  ];

  const handleMenuClick = (itemId: string) => {
    onNavigate?.(itemId);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen z-50 flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-gray-300 shadow-lg transition-all duration-300 ${
      isOpen ? 'w-60 px-3 py-6' : 'w-20 p-3'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-start pb-6 border-b border-white/10 mb-4 relative ${isOpen ? '' : 'flex-col gap-4'}`}>
        {isOpen && (
          <h1 className="text-3xl font-bold font-white  flex items-center justify-start px-3">Planify</h1>
          
      
        )}
        <button 
          onClick={handleToggle}
          className={`text-gray-300 p-1 hover:scale-110 transition-transform ${isOpen ? 'absolute right-0' : ''}`}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-2 mb-2  ">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            title={item.label}
            className={`flex items-center gap-3 px-4 py-3  rounded-lg transition-all duration-300 font-medium text-sm whitespace-nowrap ${
              activeItem === item.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className={`border-t border-white/10 pt-4 flex flex-col gap-4 ${isOpen ? 'px-3' : 'px-1'}`}>
        <div className="flex items-center ">
          <div className={isOpen ? 'flex-1' : 'hidden'}>
            <p className="text-white font-semibold text-medium">Adshaya</p>
            <p className="text-blue-300 text-sm">2003adshaya@gmail.com</p>
          </div>
        </div>
        <button className={`flex items-center gap-2 rounded-lg text-blue-200 hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-400 transition-all font-medium text-sm ${
          isOpen 
            ? 'w-full px-4 py-2 bg-white/5 border border-white/10' 
            : 'w-12 h-12 justify-center bg-white/5 border border-white/10'
        }`}>
          <LogOut size={18} />
          {isOpen && <span className='text-medium'>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
