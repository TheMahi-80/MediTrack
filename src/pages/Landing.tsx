import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Logo } from '../components/ui/Logo';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  ArrowRight 
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import PartnerMarquee from '../components/PartnerMarquee';

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = (role?: 'doctor' | 'patient') => {
    if (role === 'doctor') {
      navigate('/auth?role=doctor');
    } else {
      navigate('/auth?role=patient');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <nav className="p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
          <Logo size={40} />
          <span className="tracking-tight text-slate-800 dark:text-white hidden sm:inline">MediTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => handleGetStarted()}
            className="px-5 md:px-6 py-2 md:py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-bold text-xs md:text-sm shadow-lg shadow-slate-200 dark:shadow-none"
          >
            Institutional Login
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-2 md:py-4">
        <div className="text-center mb-4 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-blue-100 dark:border-blue-800 shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            Healthcare. Reimagined for the Digital Age.
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] text-slate-800 dark:text-white mb-2">
            Unified Clinical <span className="text-blue-600 italic">Workspaces.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Choose your portal to access secure medical records, prescriptions, and real-time clinical queues.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Patient Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -8 }}
            className="relative group h-full"
          >
            <div className="absolute inset-0 bg-blue-600/5 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-50 dark:border-blue-800 shadow-sm">
                  <Heart size={28} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter uppercase tracking-widest">Patient Center</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                  Access your prescriptions, medical history, and join hospital queues instantly. Your health data, securely in your hands.
                </p>
              </div>
              <button 
                onClick={() => handleGetStarted('patient')}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-100 dark:shadow-none"
              >
                Enter Patient Portal <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>

          {/* Doctor Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -8 }}
            className="relative group h-full"
          >
            <div className="absolute inset-0 bg-emerald-600/5 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full bg-slate-900 dark:bg-slate-950 p-6 md:p-10 rounded-[40px] border border-white/5 shadow-2xl shadow-slate-900/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-white/10 shadow-sm">
                  <Stethoscope size={28} />
                </div>
                <h2 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase tracking-widest italic">Doctor Workspace</h2>
                <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                  Advanced clinical tools for professional practitioners. Manage queues, issue digital prescriptions, and perform peer evaluations.
                </p>
              </div>
              <button 
                onClick={() => handleGetStarted('doctor')}
                className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Log In as Doctor <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="mb-12">
        <PartnerMarquee />
      </div>

      <section className="bg-slate-50 dark:bg-slate-950/50 py-24 border-t border-slate-100 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Heart className="text-blue-600" />} 
              title="Patient-First" 
              desc="Comprehensive access to your medical history with zero friction." 
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-blue-600" />} 
              title="High Integrity" 
              desc="Role-based security ensuring strictly partitioned medical data." 
              delay={0.1}
            />
            <FeatureCard 
              icon={<Clock className="text-blue-600" />} 
              title="Live Terminal" 
              desc="Real-time waitlist management across medical centers." 
              delay={0.2}
            />
            <FeatureCard 
              icon={<Activity className="text-blue-600" />} 
              title="Audit Trace" 
              desc="Full transparency with version-controlled record history." 
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <Logo size={32} />
            <span className="font-bold tracking-tight text-slate-800 dark:text-white text-sm">MediTrack Global</span>
          </div>
          <div className="flex gap-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode, title: string, desc: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-600/5 transition-all relative z-10"
    >
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 border border-blue-50 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed text-xs">{desc}</p>
    </motion.div>
  );
}
