import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../components/ui/Logo';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  ArrowRight,
  PhoneCall,
  Award,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Users
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import PartnerMarquee from '../components/PartnerMarquee';

export default function Landing() {
  const navigate = useNavigate();
  const [showCallModal, setShowCallModal] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleGetStarted = (role?: 'doctor' | 'patient') => {
    if (role === 'doctor') {
      navigate('/auth?role=doctor');
    } else if (role === 'patient') {
      navigate('/auth?role=patient');
    } else {
      navigate('/auth');
    }
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;
    setCallbackSubmitted(true);
    setTimeout(() => {
      setShowCallModal(false);
      setCallbackSubmitted(false);
      setCallbackPhone('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBFF] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-200/40 via-fuchsia-100/30 to-transparent dark:from-purple-950/30 dark:via-purple-900/10 dark:to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Floating Navbar */}
      <header className="sticky top-4 z-40 px-4 md:px-8 max-w-7xl mx-auto">
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg shadow-purple-500/5 px-6 py-3 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between transition-all">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo size={36} />
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center">
              MediTrack<span className="text-purple-600 dark:text-purple-400">.</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a>
            <a href="#why-meditrack" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Why Us</a>
            <button 
              onClick={() => handleGetStarted('patient')} 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-bold"
            >
              Patient Portal
            </button>
            <button 
              onClick={() => handleGetStarted('doctor')} 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800"
            >
              Doc Login
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => handleGetStarted()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              Sign Up Free
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide border border-purple-200/80 dark:border-purple-800 shadow-sm"
            >
              <Zap size={14} className="text-purple-600 fill-purple-600" />
              Bangladesh's Premier Medical Report & Practice Platform
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white"
            >
              A New Chapter in Bangladeshi Healthcare
              <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
               
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-purple-600 dark:text-purple-400 font-extrabold text-lg md:text-xl"
            >
              Track Reports Instantly. Practice with Precision.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-medium"
            >
              Elevate your clinical workflow and medical report management. MediTrack is designed for doctors and patients across Bangladesh who value digital prescription tracking.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-black text-slate-900 dark:text-white text-base md:text-lg"
            >
              
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button 
                onClick={() => handleGetStarted('doctor')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-purple-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => handleGetStarted('patient')}
                className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-extrabold text-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
              >
                Upto 25 Patients Free!
              </button>
            </motion.div>

            {/* Role Quick Selector Cards */}
            <div className="pt-6 grid sm:grid-cols-2 gap-4 max-w-xl">
              <div 
                onClick={() => handleGetStarted('patient')}
                className="p-5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl cursor-pointer hover:border-purple-300 transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                    Patient Portal <ArrowRight size={14} className="text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Access prescriptions & queue live status</p>
                </div>
              </div>

              <div 
                onClick={() => handleGetStarted('doctor')}
                className="p-5 bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:border-purple-500 transition-all group flex items-start gap-4 text-white"
              >
                <div className="w-10 h-10 bg-fuchsia-500 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1">
                    Doctor Workspace <ArrowRight size={14} className="text-fuchsia-400 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">AI charting, queue management & RX</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reference Dashboard Preview Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white dark:bg-slate-900 rounded-[36px] p-6 shadow-2xl shadow-purple-500/10 border border-purple-100 dark:border-purple-900/50 relative overflow-hidden"
            >
              {/* Card Window Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-50 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-300" />
                  <span className="w-3 h-3 rounded-full bg-fuchsia-300" />
                  <span className="w-3 h-3 rounded-full bg-pink-300" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                  MediTrack
                </span>
              </div>

              {/* Top 3 Metric Stat Boxes */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-purple-50/80 dark:bg-purple-950/40 p-3.5 rounded-2xl text-center border border-purple-100/60 dark:border-purple-900/30">
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-300">70%</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">Less Charting</div>
                </div>
                <div className="bg-fuchsia-50/80 dark:bg-fuchsia-950/40 p-3.5 rounded-2xl text-center border border-fuchsia-100/60 dark:border-fuchsia-900/30">
                  <div className="text-2xl font-black text-fuchsia-700 dark:text-fuchsia-300">2×</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">Follow-Ups</div>
                </div>
                <div className="bg-purple-50/80 dark:bg-purple-950/40 p-3.5 rounded-2xl text-center border border-purple-100/60 dark:border-purple-900/30">
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-300">24h</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">Setup</div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Documentation Saved</span>
                    <span className="text-purple-600 font-mono">70%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full w-[70%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Follow-Up Rate</span>
                    <span className="text-purple-600 font-mono">94%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Patient Satisfaction</span>
                    <span className="text-purple-600 font-mono">98%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>

              {/* Patient Activity List */}
              <div className="space-y-2.5 border-t border-purple-50 dark:border-slate-800 pt-4 mb-6">
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center">
                      MR
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Dr. M. Rahman</div>
                      <div className="text-[10px] text-slate-400 font-medium">Consultation · Dhaka Clinic</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2.5 py-1 rounded-full">
                    Done
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-black flex items-center justify-center">
                      AC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">A. Chowdhury</div>
                      <div className="text-[10px] text-slate-400 font-medium">Lab report & prescription ready</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 px-2.5 py-1 rounded-full">
                    Sent
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-black flex items-center justify-center">
                      SH
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">S. Hossain</div>
                      <div className="text-[10px] text-slate-400 font-medium">Diagnostic report synced</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 px-2.5 py-1 rounded-full">
                    New
                  </span>
                </div>
              </div>

              {/* Rating Proof */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-purple-50 dark:border-slate-800">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-400 border-2 border-white dark:border-slate-900" />
                  <div className="w-6 h-6 rounded-full bg-fuchsia-400 border-2 border-white dark:border-slate-900" />
                  <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-white dark:border-slate-900" />
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                    100+
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  EMBRACED BY PATIENTS WORLDWIDE
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Marquee Partners */}
      <div className="my-8">
        <PartnerMarquee />
      </div>

      {/* WHY MEDITRACK SECTION (Purple Banner matching image) */}
      <section id="why-meditrack" className="relative mt-12">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-700 text-white py-20 px-6 md:px-12 rounded-t-[48px] shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-purple-200 bg-white/10 px-4 py-1.5 rounded-full inline-block backdrop-blur-md">
                WHY MEDITRACK
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Built for How You Actually Work
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 rounded-3xl space-y-4 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center">
                  <Clock size={28} />
                </div>
                <h3 className="text-xl font-black text-white">
                  Reclaim 2–3 Hours Every Day
                </h3>
                <p className="text-purple-100 text-sm leading-relaxed font-medium">
                  Smart templates, AI-assisted tools, auto-suggestions and reusable prescriptions eliminate repetitive typing.
                </p>
              </div>

              <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 rounded-3xl space-y-4 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center">
                  <Award size={28} />
                </div>
                <h3 className="text-xl font-black text-white">
                  Elevate Your Professional Image
                </h3>
                <p className="text-purple-100 text-sm leading-relaxed font-medium">
                  Branded prescriptions, clean reports, patient portals and digital queues — your clinic at international standards.
                </p>
              </div>

              <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 rounded-3xl space-y-4 hover:bg-white/15 transition-all md:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-black text-white">
                  AI Medical Records & Queue Sync
                </h3>
                <p className="text-purple-100 text-sm leading-relaxed font-medium">
                  Real-time live waiting lines, instant prescription issuance, and conversational AI record summaries for every consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="bg-white dark:bg-slate-900 py-24 border-t border-purple-50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Clinical Excellence Designed for Doctors & Patients
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              A complete digital ecosystem built for private practice efficiency and patient comfort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Heart className="text-purple-600" />} 
              title="Patient-First Portal" 
              desc="Comprehensive access to your medical history, queue position, and prescriptions with zero friction." 
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-purple-600" />} 
              title="High Integrity Security" 
              desc="Role-based security ensuring strictly partitioned medical data and verified doctor credentials." 
              delay={0.1}
            />
            <FeatureCard 
              icon={<Clock className="text-purple-600" />} 
              title="Live Patient Queue" 
              desc="Real-time waitlist management with automated SMS & digital token updates." 
              delay={0.2}
            />
            <FeatureCard 
              icon={<Activity className="text-purple-600" />} 
              title="AI Record Assistant" 
              desc="Powered by Gemini to answer patient record questions and summarize health histories." 
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Floating "Call Me Back" Green Button (from bottom right of image) */}
      <button 
        onClick={() => setShowCallModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs md:text-sm tracking-wide transition-all hover:shadow-emerald-500/30 group"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <PhoneCall size={16} />
        </div>
        <span>Call Me Back</span>
      </button>

      {/* Call Me Back Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-purple-100 dark:border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-600">
                <PhoneCall size={22} />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Request Call Back</h3>
              </div>
              <button 
                onClick={() => setShowCallModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {callbackSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Request Sent!</h4>
                <p className="text-xs text-slate-500 font-medium">Our MediTrack medical practice advisor will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-4 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Enter your phone number below and our clinical team will get in touch within 15 minutes.
                </p>
                <input 
                  type="tel"
                  required
                  placeholder="+880 1712 345678"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-emerald-200 dark:shadow-none"
                >
                  Confirm Request
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-extrabold tracking-tight text-white text-base">
              MediTrack Global
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} MediTrack. Lead with Authority. Practice with Precision.
          </p>
          <div className="flex gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Security</a>
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
      className="p-8 bg-purple-50/40 dark:bg-slate-800/40 rounded-3xl border border-purple-100/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all relative z-10 group"
    >
      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs">{desc}</p>
    </motion.div>
  );
}
