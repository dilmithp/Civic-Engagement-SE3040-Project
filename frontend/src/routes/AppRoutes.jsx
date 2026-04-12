import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import DashboardLayout from '../components/layout/DashboardLayout';
import Surveys from '../pages/dashboard/Surveys';
import Marketplace from '../pages/dashboard/Marketplace';

// Green Initiatives
import GreenInitiativeList from '../components/GreenInitiatives/GreenInitiativeList';
import CreateInitiativeForm from '../components/GreenInitiatives/CreateInitiativeForm';
import EditInitiativeForm from '../components/GreenInitiatives/EditInitiativeForm';
import InitiativeDetails from '../components/GreenInitiatives/InitiativeDetails';

// Issues
import IssueList from '../components/Issues/IssueList';
import IssueForm from '../components/Issues/IssueForm';
import IssueDetails from '../components/Issues/IssueDetails';

// Team members will import their page components here

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Green Initiatives — Public */}
      <Route path="/green-initiatives" element={<GreenInitiativeList />} />
      <Route path="/green-initiatives/:id" element={<InitiativeDetails />} />

      {/* Green Initiatives — Protected (outside dashboard layout) */}
      <Route
        path="/green-initiatives/create"
        element={
          <ProtectedRoute>
            <CreateInitiativeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/green-initiatives/edit/:id"
        element={
          <ProtectedRoute>
            <EditInitiativeForm />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Surveys — Dilmith */}
        <Route path="surveys" element={<Surveys />} />

        {/* Issues — nested under dashboard */}
        <Route path="issues" element={<IssueList />} />
        <Route
          path="issues/create"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <IssueForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="issues/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <IssueForm />
            </ProtectedRoute>
          }
        />
        <Route path="issues/:id" element={<IssueDetails />} />

        {/* Team members will add their dashboard routes here */}
        <Route path="marketplace" element={<Marketplace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;