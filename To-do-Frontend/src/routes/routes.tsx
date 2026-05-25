import React from 'react';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import AllTasks from '../pages/AllTasks';
import CalendarPage from '../pages/CalendarPage';
import Important from '../pages/Important';
import ComparePage from '../pages/Compare.tsx';
import Completed from '../pages/Completed';
import Today from '../pages/Today';
import Upcoming from '../pages/Upcoming';
import Overdue from '../pages/Overdue';
import AIAssistantPage from '../pages/AIAssistantPage';

function withLayout(element: React.ReactNode) {
  return (
    <MainLayout>
      {element}
    </MainLayout>
  );
}

// Combined routes
export const routes = [
  {
    path: '/dashboard',
    element: withLayout(<Dashboard />),
  },
  {
    path: '/tasks',
    element: withLayout(<AllTasks />),
  },
  {
    path: '/calendar',
    element: withLayout(<CalendarPage />),
  },
  {
    path: '/important',
    element: withLayout(<Important />),
  },
  {
    path: '/compare',
    element: withLayout(<ComparePage />),
  },
  {
    path: '/completed',
    element: withLayout(<Completed />),
  },
  {
    path: '/today',
    element: withLayout(<Today />),
  },
  {
    path: '/upcoming',
    element: withLayout(<Upcoming />),
  },
  {
    path: '/overdue',
    element: withLayout(<Overdue />),
  },
  {
    path: '/ai',
    element: withLayout(<AIAssistantPage />),
  },
];

export default routes;
