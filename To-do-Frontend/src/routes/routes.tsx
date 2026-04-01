import React from 'react';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import AllTasks from '../pages/AllTasks';

function withLayout(element: React.ReactNode, pageTitle: string, pageSubtitle: string) {
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
    element: withLayout(<Dashboard />, 'Dashboard', 'Overview of your productivity'),
  },
  {
    path: '/tasks',
    element: withLayout(<AllTasks />, 'All Tasks', 'View and manage all your tasks'),
  },
];

export default routes;
