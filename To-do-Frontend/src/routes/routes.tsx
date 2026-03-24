import React from 'react';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';

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
];

export default routes;
