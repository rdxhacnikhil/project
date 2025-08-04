import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import Users from './pages/Users';
import Tickets from './pages/Tickets';
import TicketPurchase from './pages/TicketPurchase';
import Revenues from './pages/Revenues';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AuthForm from './components/Auth/AuthForm';
import LandingPage from './pages/LandingPage';

function App() {
  console.log('App component rendering');
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/event/:eventId" element={<EventDetails />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/edit/:id" element={<EditEvent />} />
              <Route path="users" element={<Users />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="revenues" element={<Revenues />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Settings />} />
            </Route>
            
            {/* Ticket Purchase Route */}
            <Route path="/ticket-purchase/:eventId" element={<TicketPurchase />} />
            
            {/* Redirect old routes to admin */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;