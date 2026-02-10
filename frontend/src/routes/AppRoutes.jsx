import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Team members will import their page components here

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />

      {/* Protected routes example */}
      {/* <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        } 
      /> */}

      {/* Team members will add their routes here */}
    </Routes>
  );
};

export default AppRoutes;
