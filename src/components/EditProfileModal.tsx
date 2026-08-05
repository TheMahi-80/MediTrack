import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import ImageUploadDropzone from './ui/ImageUploadDropzone';
import { 
  X,
  User2, 
  MapPin, 
  Camera, 
  Save,
  Ruler,
  Weight
} from 'lucide-react';

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

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Parse height and weight
  const parseHeight = (h: string | undefined) => {
    if (!h) return { unit: 'cm' as const, cm: '', ft: '', in: '' };
    if (h.includes('cm')) return { unit: 'cm' as const, cm: h.replace(' cm', ''), ft: '', in: '' };
    if (h.includes("'")) {
      const parts = h.split("'");
      return { unit: 'ft' as const, cm: '', ft: parts[0], in: parts[1].replace('"', '') };
    }
    return { unit: 'cm' as const, cm: '', ft: '', in: '' };
  };

  const parseWeight = (w: string | undefined) => {
    if (!w) return { unit: 'kg' as const, val: '' };
    const parts = w.split(' ');
    return { unit: (parts[1] || 'kg') as 'kg' | 'lb', val: parts[0] || '' };
  };

  const hData = parseHeight(profile?.height);
  const wData = parseWeight(profile?.weight);

  // Form States
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>(profile?.sex || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(hData.unit);
  const [heightCm, setHeightCm] = useState(hData.cm);
  const [heightFt, setHeightFt] = useState(hData.ft);
  const [heightIn, setHeightIn] = useState(hData.in);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(wData.unit);
  const [weightVal, setWeightVal] = useState(wData.val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    let finalHeight = '';
    if (heightUnit === 'cm') {
      finalHeight = heightCm ? `${heightCm} cm` : '';
    } else {
      finalHeight = (heightFt || heightIn) ? `${heightFt}'${heightIn}"` : '';
    }
    const finalWeight = weightVal ? `${weightVal} ${weightUnit}` : '';

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName,
        age: age ? parseInt(age) : null,
        sex: sex || null,
        address: address || null,
        photoURL: photoURL || null,
        height: finalHeight || null,
        weight: finalWeight || null
      });

      // Also update Auth profile for consistency
      if (auth.currentUser) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { 
          displayName,
          photoURL: photoURL || null
        });
      }

      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <User2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white">Edit Profile</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your personal information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Avatar Upload Dropzone */}
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <ImageUploadDropzone
              value={photoURL}
              onChange={setPhotoURL}
              label="Profile Photo"
              optional
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Display Name</label>
              <div className="relative">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Age</label>
                <input 
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Sex</label>
                <select 
                  value={sex}
                  onChange={e => setSex(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
              <textarea 
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Height</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {['cm', 'ft'].map((unit) => (
                    <button 
                      key={unit}
                      type="button"
                      onClick={() => setHeightUnit(unit as any)}
                      className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all uppercase ${heightUnit === unit ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                {heightUnit === 'cm' ? (
                  <input 
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    placeholder="175"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={heightFt}
                      onChange={e => setHeightFt(e.target.value)}
                      className="w-1/2 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      placeholder="5"
                    />
                    <input 
                      type="number"
                      value={heightIn}
                      onChange={e => setHeightIn(e.target.value)}
                      className="w-1/2 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      placeholder="11"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Weight</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {['kg', 'lb'].map((unit) => (
                    <button 
                      key={unit}
                      type="button"
                      onClick={() => setWeightUnit(unit as any)}
                      className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all uppercase ${weightUnit === unit ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="number"
                  value={weightVal}
                  onChange={e => setWeightVal(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                  placeholder={weightUnit === 'kg' ? "70" : "154"}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Changes...' : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
