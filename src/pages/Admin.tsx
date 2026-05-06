import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole, Institution } from '../lib/utils';
import { 
  Users, 
  Hospital, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  MapPin,
  Mail,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [pendingDoctors, setPendingDoctors] = useState<UserProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstForm, setShowInstForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qD = query(collection(db, 'users'), where('role', '==', UserRole.DOCTOR_PENDING));
      const qI = query(collection(db, 'institutions'));
      
      const [snapD, snapI] = await Promise.all([getDocs(qD), getDocs(qI)]);
      
      setPendingDoctors(snapD.docs.map(d => ({ uid: d.id, ...d.data() } as unknown as UserProfile)));
      setInstitutions(snapI.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Institution)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveDoctor = async (uid: string, institutionId: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: UserRole.DOCTOR,
        institutionId: institutionId,
      });
      setPendingDoctors(prev => prev.filter(d => d.uid !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  const rejectDoctor = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: UserRole.PATIENT,
      });
      setPendingDoctors(prev => prev.filter(d => d.uid !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-white mb-1">Admin Control</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage institutions and verify medical staff.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Doctor Approvals */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Pending Verification
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-widest">
              {pendingDoctors.length} Requests
            </span>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            {pendingDoctors.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {pendingDoctors.map((doc) => (
                  <div key={doc.uid} className="p-6 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                          {doc.displayName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{doc.displayName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{doc.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                         {institutions.length > 0 ? (
                           <select 
                             className="flex-1 sm:flex-none text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                             onChange={(e) => approveDoctor(doc.uid, e.target.value)}
                             defaultValue=""
                           >
                             <option value="" disabled>Assign & Approve</option>
                             {institutions.map(inst => (
                               <option key={inst.id} value={inst.id}>{inst.name}</option>
                             ))}
                           </select>
                         ) : (
                           <button 
                             onClick={() => setShowInstForm(true)}
                             className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg"
                           >
                             Add Institution first
                           </button>
                         )}
                         <button 
                            onClick={() => rejectDoctor(doc.uid)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition shadow-sm"
                            title="Reject Request"
                         >
                            <X size={16} />
                         </button>
                      </div>
                    </div>

                    {/* Detailed info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Medical License</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.medicalLicenseId || 'Not provided'}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Specialization</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.specialization || 'Not provided'}</p>
                      </div>
                      <div className="sm:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Requested Hospital</p>
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-200">{doc.requestedInstitutionName || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="text-slate-200 dark:text-slate-700" size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm">No pending approvals.</p>
              </div>
            )}
          </div>
        </section>

        {/* Institutions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Active Institutions
            </h2>
            <button 
              onClick={() => setShowInstForm(true)}
              className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50 transition shadow-sm"
            >
              + Add New
            </button>
          </div>
          <div className="grid gap-4">
            {institutions.map(inst => (
              <div key={inst.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50 transition-colors group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                  <Hospital size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white">{inst.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <MapPin size={10} />
                    {inst.address}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Active</div>
              </div>
            ))}
            {institutions.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 font-bold text-sm">No institutions configured.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showInstForm && (
           <InstitutionForm onClose={() => setShowInstForm(false)} onAdded={() => fetchData()} />
        )}
      </AnimatePresence>
    </div>
  );
}

function InstitutionForm({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'institutions'), {
        name,
        address,
        createdAt: serverTimestamp(),
      });
      onAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors duration-300"
      >
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Institution</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-2">Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="Main Health Center"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-2">Address</label>
            <input 
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="Main Building, Floor 2"
            />
          </div>
          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
             <button disabled={loading} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 hover:bg-blue-700 transition-all">
               {loading ? 'Adding...' : 'Add Institution'}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
