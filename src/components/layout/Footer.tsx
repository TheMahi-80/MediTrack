import React from 'react';
import { motion } from 'motion/react';
import { Building2, ShieldCheck, HeartPulse, Stethoscope, Microscope, Activity } from 'lucide-react';

const partners = [
  { name: 'City General Hospital', icon: <Building2 className="w-5 h-5" /> },
  { name: 'HealthFirst Clinic', icon: <HeartPulse className="w-5 h-5" /> },
  { name: 'Global Medical Center', icon: <Activity className="w-5 h-5" /> },
  { name: 'Unity Health Group', icon: <ShieldCheck className="w-5 h-5" /> },
  { name: 'St. Mary Specialized', icon: <Stethoscope className="w-5 h-5" /> },
  { name: 'Apex Research Institute', icon: <Microscope className="w-5 h-5" /> },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HeartPulse className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black dark:text-white block leading-tight">MediTrack</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Health Systems</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              © 2026 MediTrack secure infrastructure
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Compliance</a>
              <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
