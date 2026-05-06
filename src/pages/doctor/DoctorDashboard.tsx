import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { QueueEntry, UserRole, QueueStatus } from '../../lib/utils';
import { 
  Clock, 
  CheckCircle2, 
  Search,
  User,
  ExternalLink,
  Stethoscope,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import EditProfileModal from '../../components/EditProfileModal';

enum OperationType {
  LIST = 'list',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error, operationType, path);
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function StatItem({ label, value, boldValue }: { label: string, value: string, boldValue?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{label}</span>
      <span className={cn(
        "font-bold text-lg tabular-nums transition-colors",
        boldValue ? "text-blue-600" : "text-slate-800 dark:text-white"
      )}>{value}</span>
    </div>
  );
}

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searching, setSearching] = useState(false);
  
  useEffect(() => {
    if (!profile?.institutionId) return;
    
    const q = query(
      collection(db, 'queues'),
      where('institutionId', '==', profile.institutionId),
      where('status', '==', QueueStatus.WAITING),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snap) => {
      setQueue(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueueEntry)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queues');
    });
  }, [profile]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !profile?.institutionId) return;

    setSearching(true);
    setSearchResults([]);
    
    try {
      let results: any[] = [];
      
      if (searchQuery.length > 20) {
        try {
          const { getDoc } = await import('firebase/firestore');
          const docRef = doc(db, 'users', searchQuery.trim());
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.role === UserRole.PATIENT && data.institutionId === profile.institutionId) {
              results = [data];
            }
          }
        } catch (e) {
          console.error("UID lookup failed:", e);
        }
      }

      if (results.length === 0) {
        const qName = query(
          collection(db, 'users'),
          where('role', '==', UserRole.PATIENT),
          where('institutionId', '==', profile.institutionId),
          where('displayName', '>=', searchQuery),
          where('displayName', '<=', searchQuery + '\uf8ff'),
          limit(5)
        );
        const snapName = await getDocs(qName);
        results = snapName.docs.map(d => d.data());
      }
      
      setSearchResults(results);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      
      <header className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-2">
                Dr. {profile?.displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {profile?.role.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setShowEditProfile(true)}
                className="text-[10px] uppercase font-bold tracking-widest bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Settings size={14} />
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder="ID or Name..."]') as HTMLInputElement;
                  searchInput?.focus();
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none text-xs uppercase tracking-widest"
              >
                <Stethoscope size={16} />
                New Consultation
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <section className="flex flex-col order-2 lg:order-1">
           <div className="flex items-center justify-between mb-6 px-1">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
               Patient Queue
             </h2>
             <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-widest">
               {queue.length} Waiting
             </span>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-1 transition-colors duration-300">
             {queue.length > 0 ? (
               <div className="divide-y divide-slate-50 dark:divide-slate-800">
                 {queue.map((q, idx) => (
                   <div key={q.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                     <div className="flex items-center gap-5">
                       <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400 text-xs font-bold font-mono group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                         {String(idx + 1).padStart(2, '0')}
                       </span>
                       <div>
                         <p className="font-bold text-slate-800 dark:text-white">{q.patientName}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Waiting since {format(q.createdAt?.toDate?.() || new Date(), 'p')}</p>
                       </div>
                     </div>
                     <button 
                       onClick={() => updateDoc(doc(db, 'queues', q.id!), { status: QueueStatus.IN_CONSULTATION })}
                       className="w-full sm:w-auto text-white font-bold text-xs bg-slate-900 dark:bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-sm"
                     >
                       Call Patient
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle2 size={40} />
                 </div>
                 <p className="font-bold text-slate-800 dark:text-white text-lg">All Cleared</p>
                 <p className="text-slate-400 text-sm mt-1">The patient queue is currently empty.</p>
               </div>
             )}
           </div>
        </section>

        <section className="space-y-8 order-1 lg:order-2">
           <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-colors duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              <h3 className="text-lg font-bold mb-5 relative z-10">Patient Lookup</h3>
              <form onSubmit={handleSearch} className="relative z-10 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ID or Name..." 
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/40"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={searching}
                  className="w-full py-3.5 bg-blue-600 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Search size={16} />}
                  {searching ? 'Searching...' : 'Search Records'}
                </button>
              </form>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-3 relative z-10 overflow-hidden"
                  >
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Matching Patients</p>
                    {searchResults.map((res) => (
                      <div key={res.uid} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{res.displayName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-white/40 font-mono">{res.uid.slice(0, 8)}...</span>
                              {res.age && <span className="text-[9px] text-blue-400 font-bold">{res.age}y</span>}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/app/prescriptions?patientId=${res.uid}`)}
                          className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-colors text-white/60 hover:text-white"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Clinic Analytics
              </h3>
              <div className="space-y-5">
                <StatItem label="Daily Consults" value="24" />
                <StatItem label="Avg. Wait Time" value="12m" />
                <StatItem label="Alerts" value="3" boldValue />
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
