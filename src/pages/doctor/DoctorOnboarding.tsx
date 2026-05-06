import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserRole } from '../../lib/utils';
import { 
  ShieldCheck, 
  Stethoscope, 
  Building2, 
  FileText, 
  Upload, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DoctorOnboarding() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    medicalLicenseId: '',
    specialization: '',
    experienceYears: '',
    requestedInstitutionName: '',
    education: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
        role: UserRole.DOCTOR_PENDING,
        appliedAt: new Date()
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success || profile?.role === UserRole.DOCTOR_PENDING) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-12 rounded-[40px] shadow-2xl shadow-blue-100 dark:shadow-none border border-slate-100 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">Application Submitted</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            Your medical credentials have been securely transmitted. Our medical board will review your application and institution request within 24-48 hours.
          </p>
          <button 
            onClick={() => navigate('/app')}
            className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Return to Dashboard <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100 dark:border-blue-800/50">
          Professional Onboarding
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter mb-4">
          Medical Credentials <span className="text-blue-600">Verification</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Please provide your professional certifications and desired practice institution to complete your clinical profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Licensing Info</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical License ID</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. MED-992384-LX"
                  value={formData.medicalLicenseId}
                  onChange={(e) => setFormData({...formData, medicalLicenseId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Specialization</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Cardiology, Pediatrics"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
                <Building2 size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Workplace Request</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requested Institution</label>
                <input 
                  required
                  type="text"
                  placeholder="Hospital or Clinic Name"
                  value={formData.requestedInstitutionName}
                  onChange={(e) => setFormData({...formData, requestedInstitutionName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Years of Experience</label>
                <input 
                  required
                  type="number"
                  placeholder="Total years"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
             <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Professional Profile</h3>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education Background</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="University, Degree, Year"
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Tell us about your medical philosophy..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </div>
          </section>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center mb-4 shadow-sm text-slate-400">
              <Upload size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Optional Document Upload</p>
            <p className="text-[10px] text-slate-500">PDF, JPG (Max 5MB)</p>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Credentials'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
      
      <div className="mt-12 flex items-center gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
        <AlertCircle size={20} className="text-blue-500 flex-shrink-0" />
        <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 leading-normal">
          By submitting this form, you certify that all information provided is accurate and you consent to a background check of your medical credentials.
        </p>
      </div>
    </div>
  );
}
