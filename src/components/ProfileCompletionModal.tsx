import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import ImageUploadDropzone from './ui/ImageUploadDropzone';
import { 
  HeartPulse, 
  Ruler, 
  Weight, 
  User2, 
  MapPin, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Milestone
} from 'lucide-react';

type Step = 1 | 2 | 3;

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

export default function ProfileCompletionModal() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(1);

  // Step 1 States (Basics)
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>(profile?.sex || '');
  
  // Step 2 States (Contact)
  const [address, setAddress] = useState(profile?.address || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  
  // Step 3 States (Metrics)
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [weightVal, setWeightVal] = useState('');

  // Validation
  const isStep1Valid = displayName.trim().length > 2 && age && sex;
  const isStep2Valid = address.trim().length > 5;
  const isStep3Valid = (heightUnit === 'cm' ? heightCm : (heightFt && heightIn)) && weightVal;

  // BMI Calculation
  const calculateBMI = () => {
    let w = parseFloat(weightVal);
    let h = 0;
    if (!w || w <= 0) return null;

    if (heightUnit === 'cm') {
      const hCm = parseFloat(heightCm);
      if (!hCm || hCm <= 0) return null;
      h = hCm / 100;
      return w / (h * h);
    } else {
      const hFt = parseFloat(heightFt) || 0;
      const hIn = parseFloat(heightIn) || 0;
      const totalInches = (hFt * 12) + hIn;
      if (totalInches <= 0) return null;
      if (weightUnit === 'lb') {
        return (703 * w) / (totalInches * totalInches);
      } else {
        const wLb = w * 2.20462;
        return (703 * wLb) / (totalInches * totalInches);
      }
    }
  };

  const bmi = calculateBMI();
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-red-500', bg: 'bg-red-500', note: 'high risk' };
    if (val < 25) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-500', note: 'healthy' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-500', bg: 'bg-amber-500', note: 'moderate risk' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-600', note: 'high risk' };
  };
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  const handleNext = () => {
    if (step === 1 && isStep1Valid) setStep(2);
    else if (step === 2 && isStep2Valid) setStep(3);
  };

  const handlePrev = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isStep3Valid) return;
    setLoading(true);

    let finalHeight = '';
    if (heightUnit === 'cm') {
      finalHeight = `${heightCm} cm`;
    } else {
      finalHeight = `${heightFt}'${heightIn}"`;
    }
    const finalWeight = `${weightVal} ${weightUnit}`;

    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName,
        age: parseInt(age),
        sex,
        address,
        photoURL: photoURL || null,
        height: finalHeight,
        weight: finalWeight,
        profileCompleted: true
      });

      // Sync with Auth Profile
      if (auth.currentUser) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { 
          displayName,
          photoURL: photoURL || null
        });
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const isMissingInfo = !profile?.profileCompleted;
  if (!isMissingInfo) return null;

  const stepDetails = {
    1: { title: 'Basic Identity', icon: <User2 size={32} />, desc: 'Let\'s start with your basic information.' },
    2: { title: 'Contact Details', icon: <MapPin size={32} />, desc: 'Where can we reach you and what do you look like?' },
    3: { title: 'Health Vitals', icon: <HeartPulse size={32} />, desc: 'Help us understand your physical condition.' }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh] transition-colors"
      >
        {/* Modern Progress Bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 flex">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ease-out ${step >= s ? 'bg-blue-600 flex-1' : 'w-0'}`} 
            />
          ))}
        </div>
        
        <div className="p-8 sm:p-10 overflow-y-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              key={step}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 dark:shadow-none"
            >
              {stepDetails[step].icon}
            </motion.div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Step {step} of 3</p>
              <h2 className="text-3xl font-black dark:text-white tracking-tight">
                {stepDetails[step].title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 leading-relaxed max-w-sm">
                {stepDetails[step].desc}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Full Name</label>
                    <div className="relative">
                      <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        autoFocus
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        placeholder="e.g. John Doe"
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
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Gender</label>
                      <select 
                        value={sex}
                        onChange={e => setSex(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-medium"
                      >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Residential Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
                      <textarea 
                        autoFocus
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
                        placeholder="Street, City, State, ZIP"
                      />
                    </div>
                  </div>

                  <ImageUploadDropzone
                    value={photoURL}
                    onChange={setPhotoURL}
                    label="Profile Photo"
                    optional
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block">Height</label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
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
                            autoFocus
                            type="number"
                            value={heightCm}
                            onChange={e => setHeightCm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            placeholder="175"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="number"
                              value={heightFt}
                              onChange={e => setHeightFt(e.target.value)}
                              className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                              placeholder="5"
                            />
                            <input 
                              type="number"
                              value={heightIn}
                              onChange={e => setHeightIn(e.target.value)}
                              className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                              placeholder="11"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block">Weight</label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
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
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                          placeholder={weightUnit === 'kg' ? "70" : "154"}
                        />
                      </div>
                    </div>
                  </div>

                  {bmi && bmiInfo && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Body Mass Index</p>
                          <p className="text-4xl font-black dark:text-white tracking-tighter">{bmi.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1.5 justify-end mb-0.5 font-black uppercase text-xs ${bmiInfo.color}`}>
                            <span className={`w-2 h-2 rounded-full ${bmiInfo.bg}`} />
                            {bmiInfo.label}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bmiInfo.note}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (bmi/40)*100)}%` }}
                          className={`h-full ${bmiInfo.bg} transition-all duration-700`} 
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          {step > 1 && (
            <button 
              type="button"
              onClick={handlePrev}
              className="px-6 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading || !isStep3Valid}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Complete Registration'}
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
