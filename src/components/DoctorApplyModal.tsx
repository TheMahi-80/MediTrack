import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/utils';
import { Stethoscope, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function DoctorApplyModal({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [licenseId, setLicenseId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        role: UserRole.DOCTOR_PENDING,
        medicalLicenseId: licenseId,
        specialization: specialization,
        requestedInstitutionName: hospitalName
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 sm:p-10 relative shadow-2xl transition-colors duration-300 overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-800">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Medical Staff Application</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Complete your profile to request doctor privileges.
          </p>
        </div>

        <form onSubmit={handleApply} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block">Medical License ID</label>
              <input 
                required
                value={licenseId}
                onChange={e => setLicenseId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ex: MD-12345"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block">Specialization</label>
              <input 
                required
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ex: General Physician"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block">Hospital / Institution Name</label>
            <input 
              required
              value={hospitalName}
              onChange={e => setHospitalName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: St. Mary's Hospital"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
              * By applying, you agree that your medical credentials will be manually verified by the system administrator. Approval may take 1-2 business days.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Send Application'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
