import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default page */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {routes.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={r.element}
          />
        ))}

        <Route path="*" element={<div className="p-6">404 Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}