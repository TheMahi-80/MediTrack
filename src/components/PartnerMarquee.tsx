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

export default function PartnerMarquee({ variant = 'default' }: { variant?: 'default' | 'subtle' }) {
  const scrollingPartners = [...partners, ...partners];

  return (
    <div className={`overflow-hidden relative ${variant === 'default' ? 'py-8 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-[0.2em]">
          Our Network Partners
        </span>
      </div>

      <div className="relative flex overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r ${variant === 'default' ? 'from-slate-50 dark:from-slate-950' : 'from-white dark:from-slate-900'} to-transparent pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l ${variant === 'default' ? 'from-slate-50 dark:from-slate-950' : 'from-white dark:from-slate-900'} to-transparent pointer-events-none`} />

        <motion.div 
          className="flex gap-12 items-center whitespace-nowrap"
          animate={{ x: "-50%" }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {scrollingPartners.map((partner, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 px-4 transition-all cursor-default select-none"
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-700">
                {partner.icon}
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight uppercase">
                {partner.name}
              </span>
              <div className="ml-8 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
