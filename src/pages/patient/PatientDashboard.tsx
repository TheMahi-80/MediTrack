import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Prescription, QueueEntry, UserRole, QueueStatus } from '../../lib/utils';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  User,
  MapPin,
  Settings,
  Activity,
  Ruler,
  Weight
} from 'lucide-react';
import { format } from 'date-fns';
import DoctorApplyModal from '../../components/DoctorApplyModal';
import EditProfileModal from '../../components/EditProfileModal';

enum OperationType {
  LIST = 'list',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error, operationType, path);
}

function BioCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{value}</p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // Fetch latest prescriptions
    const qP = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', profile.uid)
    );
    const unsubP = onSnapshot(qP, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
      items.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || a.createdAt?.seconds * 1000 || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || b.createdAt?.seconds * 1000 || 0;
        return timeB - timeA;
      });
      setPrescriptions(items.slice(0, 3));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    });

    // Fetch active queue status
    const qQ = query(
      collection(db, 'queues'),
      where('patientId', '==', profile.uid)
    );
    const unsubQ = onSnapshot(qQ, (snap) => {
      const active = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as QueueEntry))
        .find(q => q.status === QueueStatus.WAITING || q.status === QueueStatus.IN_CONSULTATION);
      setQueueEntry(active || null);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queues');
    });

    return () => {
      unsubP();
      unsubQ();
    };
  }, [profile]);

  return (
    <div className="space-y-8 md:space-y-10">
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}

      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
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
                Hello, {profile?.displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {profile?.role.replace('_', ' ')}
                </div>
                {profile?.address && (
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    {profile.address}
                  </div>
                )}
              </div>
            </div>
            {profile?.role === UserRole.PATIENT && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowEditProfile(true)}
                  className="text-[10px] uppercase font-bold tracking-widest bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Settings size={14} />
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowApply(true)}
                  className="text-[10px] uppercase font-bold tracking-widest bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
                >
                  Apply as Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApply && <DoctorApplyModal onClose={() => setShowApply(false)} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <BioCard icon={<User size={16} />} label="Age" value={`${profile?.age || '--'} yrs`} />
        <BioCard icon={<Activity size={16} />} label="Sex" value={profile?.sex || '--'} />
        <BioCard icon={<Ruler size={16} />} label="Height" value={profile?.height || '--'} />
        <BioCard icon={<Weight size={16} />} label="Weight" value={profile?.weight || '--'} />
      </div>

      {/* Queue Status */}
      {queueEntry && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Clinic Status</p>
              <h2 className="text-2xl font-bold">You are in the Queue</h2>
              <p className="text-blue-100/80 flex items-center gap-2 mt-1 font-medium italic">
                {queueEntry.status === QueueStatus.WAITING ? (
                  "Please wait for your turn at the clinic."
                ) : (
                  "The doctor is ready to see you now!"
                )}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right relative z-10">
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Token Number</p>
            <p className="text-4xl font-black tracking-tighter">T-{queueEntry.id?.slice(-3).toUpperCase()}</p>
          </div>
        </motion.div>
      )}

      {/* Recent Prescriptions */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Recent Medical Records
          </h2>
          <button 
            onClick={() => navigate('/app/prescriptions')}
            className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          {prescriptions.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {prescriptions.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate('/app/prescriptions')}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{p.diagnosis}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(p.createdAt?.toDate?.() || new Date(), 'LLL dd, p')}</p>
                    </div>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Dr. {p.doctorName?.split(' ').pop() || 'Staff'}</p>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest mt-1 inline-block">
                      v{p.version} Issued
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200 dark:border-slate-700">
                <AlertCircle className="text-slate-300 dark:text-slate-600" size={28} />
              </div>
              <p className="text-slate-400 font-bold text-sm">No medical records found yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
