import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorOnboarding from './pages/doctor/DoctorOnboarding';
import Prescriptions from './pages/Prescriptions';
import Queue from './pages/Queue';
import Admin from './pages/admin/AdminDashboard';
import AppLayout from './components/layout/AppLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/auth" />;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/patient" element={<PatientDashboard />} />
                      <Route path="/doctor" element={<DoctorDashboard />} />
                      <Route path="/doctor/onboarding" element={<DoctorOnboarding />} />
                      <Route path="/prescriptions" element={<Prescriptions />} />
                      <Route path="/queue" element={<Queue />} />
                      <Route path="/admin" element={<Admin />} />
                    </Routes>
                  </AppLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
