import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import DashboardLayout from '../components/layout/DashboardLayout';
import Surveys from '../pages/dashboard/Surveys';

// Team members will import their page components here

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected dashboard routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="surveys" element={<Surveys />} />
      </Route>

      {/* Team members will add their routes here */}
    </Routes>
  );
};

export default AppRoutes;
