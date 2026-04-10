import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import DashboardLayout from '../components/layout/DashboardLayout';
import Surveys from '../pages/dashboard/Surveys';

import GreenInitiativeList from '../components/GreenInitiatives/GreenInitiativeList';
import CreateInitiativeForm from '../components/GreenInitiatives/CreateInitiativeForm';
import EditInitiativeForm from '../components/GreenInitiatives/EditInitiativeForm';
import InitiativeDetails from '../components/GreenInitiatives/InitiativeDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Public Routes */}
      <Route path="/dashboard/initiatives" element={<GreenInitiativeList />} />
      <Route path="/dashboard/initiatives/:id" element={<InitiativeDetails />} />

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
        <Route path="initiatives" element={<GreenInitiativeList />} />
        <Route path="initiatives/:id" element={<InitiativeDetails />} />
        <Route path="initiatives/create" element={<CreateInitiativeForm />} />
        <Route path="initiatives/edit/:id" element={<EditInitiativeForm />} />

      </Route>

      

      {/* Team members will add their routes here */}
    </Routes>
  );
};

export default AppRoutes;