import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserRole, UserProfile, Institution } from '../../lib/utils';
import { 
  CheckCircle2, 
  Settings,
  UserPlus,
  Hospital,
  MapPin,
  X,
  ShieldCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import EditProfileModal from '../../components/EditProfileModal';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [pendingDoctors, setPendingDoctors] = useState<UserProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstForm, setShowInstForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

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
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Admin System <span className="text-blue-600 italic">Control</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Global oversight of institutions and clinical staff verification.</p>
        </div>
        <button 
          onClick={() => setShowEditProfile(true)}
          className="text-[10px] uppercase font-bold tracking-widest bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Settings size={14} />
          Edit Profile
        </button>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Verification Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={18} />
              Pending Verification
            </h2>
            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md uppercase tracking-widest">
              {pendingDoctors.length} Requests
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
            {pendingDoctors.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {pendingDoctors.map((doc) => (
                  <div key={doc.uid} className="p-6 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                          {doc.displayName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{doc.displayName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{doc.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select 
                          className="flex-1 sm:flex-none text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                          onChange={(e) => approveDoctor(doc.uid, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Distribute & Approve</option>
                          {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => rejectDoctor(doc.uid)}
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">License ID</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{(doc as any).medicalLicenseId || '--'}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Specialization</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{(doc as any).specialization || '--'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center justify-center opacity-50">
                <CheckCircle2 size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-sm">No pending doctor requests.</p>
              </div>
            )}
          </div>
        </section>

        {/* Institutions Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Hospital className="text-blue-600" size={18} />
              Active Institutions
            </h2>
            <button 
              onClick={() => setShowInstForm(true)}
              className="text-[10px] uppercase font-bold tracking-widest bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          <div className="grid gap-4">
            {institutions.map(inst => (
              <div key={inst.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group pointer">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                  <Hospital size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1">{inst.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={10} />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{inst.address}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">Active</div>
              </div>
            ))}
            {institutions.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-20 text-center border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 font-bold text-sm">Create an institution to begin doctor approvals.</p>
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
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transition-colors duration-300 border border-white/10"
      >
        <h2 className="text-3xl font-black mb-8 dark:text-white tracking-tight uppercase tracking-tighter italic">Register <span className="text-blue-600">Institution</span></h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Clinic Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
              placeholder="e.g. City General Center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Location Details</label>
            <input 
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
              placeholder="e.g. 1st Floor, Building B"
            />
          </div>
          <div className="pt-6 flex gap-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors uppercase tracking-widest">Cancel</button>
             <button disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none disabled:opacity-50 hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
               {loading ? 'Registering...' : 'Add Center'} <ArrowRight size={16} />
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
