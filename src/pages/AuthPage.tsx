import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from '../lib/firebase';
import { Logo } from '../components/ui/Logo';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Github 
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import PartnerMarquee from '../components/PartnerMarquee';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const roleTarget = searchParams.get('role');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/app');
    } catch (err: any) {
      let message = 'Failed to sign in';
      try {
        const parsed = JSON.parse(err.message);
        message = parsed.error || message;
      } catch {
        message = err.message || message;
      }

      if (message.includes('auth/popup-blocked')) {
        message = 'The login popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (message.includes('auth/popup-closed-by-user')) {
        message = 'The login window was closed before completing the sign-in.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        if (!name) throw new Error('Name is required');
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/app');
    } catch (err: any) {
      let message = 'Authentication failed';
      try {
        const parsed = JSON.parse(err.message);
        message = parsed.error || message;
      } catch {
        message = err.message || message;
      }

      // User-friendly mappings for common Firebase Auth errors
      if (message.includes('auth/invalid-credential')) {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (message.includes('auth/email-already-in-use')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (message.includes('auth/weak-password')) {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (message.includes('auth/user-not-found')) {
        message = 'No account found with this email. Please sign up first.';
      } else if (message.includes('auth/wrong-password')) {
        message = 'Incorrect password. please try again.';
      } else if (message.includes('auth/operation-not-allowed')) {
        message = 'Email/Password login is not enabled. Please contact the administrator.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="fixed top-6 right-6">
          <ThemeToggle />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300 z-10"
        >
          <div className={`absolute top-0 left-0 w-full h-1.5 ${roleTarget === 'doctor' ? 'bg-slate-900' : 'bg-blue-600'}`} />
          
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="mb-6 shadow-sm flex items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-3xl"
            >
              <Logo size={80} />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
              {roleTarget === 'doctor' ? 'Provider Login' : 'Patient Entrance'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">
              {roleTarget === 'doctor' 
                ? 'Institutional access for medical staff.' 
                : 'Secure access to your clinical records.'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/20 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Or continue with</span>
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all disabled:opacity-50 group font-bold text-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </motion.div>
      </div>
      <PartnerMarquee variant="subtle" />
    </div>
  );
}
