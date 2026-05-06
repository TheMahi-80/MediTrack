import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from '../ui/Logo';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Clock, 
  Settings, 
  LogOut, 
  Activity,
  Hospital,
  Menu,
  X
} from 'lucide-react';
import { cn, UserRole } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import ProfileCompletionModal from '../ProfileCompletionModal';
import Footer from './Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin, isDoctor } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isPatientOrPending = profile?.role === UserRole.PATIENT || profile?.role === UserRole.DOCTOR_PENDING;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/app/queue', icon: Clock, label: 'Queue' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/app/admin', icon: Settings, label: 'Admin Panel' });
  }

  const SidebarContent = () => (
    <>
      <div className="px-6 flex items-center justify-between gap-3 text-blue-600 font-bold text-xl mb-10">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="tracking-tight text-slate-800 dark:text-white">MediTrack</span>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              isActive 
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-800"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase shadow-sm border border-white dark:border-slate-700">
            {profile?.displayName?.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{profile?.displayName}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 rounded-xl text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      {isPatientOrPending && <ProfileCompletionModal />}
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col pt-8 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <Hospital size={18} />
              <span className="text-sm font-medium hidden sm:inline">Main Facility</span>
              <span className="text-sm font-medium sm:hidden">Facility</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
             <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live Status</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Connected</p>
                </div>
             </div>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
             <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="p-4 md:p-8 max-w-6xl mx-auto flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
