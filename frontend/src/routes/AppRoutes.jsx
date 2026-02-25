import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';

import GreenInitiativeList from '../components/GreenInitiatives/GreenInitiativeList';
import CreateInitiativeForm from '../components/GreenInitiatives/CreateInitiativeForm';
import EditInitiativeForm from '../components/GreenInitiatives/EditInitiativeForm';
import InitiativeDetails from '../components/GreenInitiatives/InitiativeDetails';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/login" element={<Login />} />

            {/* Public Routes */}
            <Route path="/green-initiatives" element={<GreenInitiativeList />} />
            <Route path="/green-initiatives/:id" element={<InitiativeDetails />} />

            {/* Protected Routes */}
            <Route
                path="/green-initiatives/create"
                element={<ProtectedRoute><CreateInitiativeForm /></ProtectedRoute>}
            />
            <Route
                path="/green-initiatives/edit/:id"
                element={<ProtectedRoute><EditInitiativeForm /></ProtectedRoute>}
            />
        </Routes>
    );

};
export default AppRoutes;
