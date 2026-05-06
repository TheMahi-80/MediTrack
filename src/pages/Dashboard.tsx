import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/utils';

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authLoading || !profile) return;

    if (profile.role === UserRole.ADMIN) {
      navigate('/app/admin');
    } else if (profile.role === UserRole.DOCTOR) {
      navigate('/app/doctor');
    } else if (profile.role === UserRole.DOCTOR_PENDING) {
      navigate('/app/doctor/onboarding');
    } else {
      navigate('/app/patient');
    }
  }, [profile, authLoading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Routing Workspace...</p>
    </div>
  );
}
