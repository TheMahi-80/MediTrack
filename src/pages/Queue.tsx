import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { QueueEntry, QueueStatus } from '../lib/utils';
import { 
  Users, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Play,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Queue() {
  const { profile, isPatient, isDoctor } = useAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'queues'),
      where('institutionId', '==', profile.institutionId || 'default-clinic')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueueEntry));
      items.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || a.createdAt?.seconds * 1000 || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || b.createdAt?.seconds * 1000 || 0;
        return timeA - timeB;
      });
      setQueue(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queues');
    });

    return () => unsub();
  }, [profile]);

  const joinQueue = async () => {
    if (!profile) return;
    try {
      await addDoc(collection(db, 'queues'), {
        patientId: profile.uid,
        patientName: profile.displayName,
        institutionId: profile.institutionId || 'default-clinic',
        status: QueueStatus.WAITING,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'queues');
    }
  };

  const updateStatus = async (id: string, status: QueueStatus) => {
    try {
      await updateDoc(doc(db, 'queues', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `queues/${id}`);
    }
  };

  const removeFromQueue = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'queues', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `queues/${id}`);
    }
  };

  const myEntry = queue.find(q => q.patientId === profile?.uid);

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-white mb-1">Clinic Queue</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Live waitlist management for {profile?.institutionId || 'Main Medical Center'}.</p>
        </div>
        {isPatient && !myEntry && (
          <button 
            onClick={joinQueue}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200 dark:shadow-none"
          >
            <UserPlus size={20} />
            Join Queue
          </button>
        )}
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <main className="space-y-6 order-2 lg:order-1">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
             <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800 px-6 md:px-8 py-3">
               Ongoing Waitlist
             </div>
             {loading ? (
               <div className="p-20 text-center text-slate-400 animate-pulse font-bold text-sm uppercase tracking-widest">Updating Queue...</div>
             ) : queue.length > 0 ? (
               <div className="divide-y divide-slate-50 dark:divide-slate-800">
                 {queue.map((q, idx) => (
                   <motion.div 
                     layout
                     key={q.id} 
                     className={cn(
                       "p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors",
                       q.status === QueueStatus.IN_CONSULTATION ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                     )}
                   >
                     <div className="flex items-center gap-6 w-full sm:w-auto">
                       <span className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold shadow-sm">
                         {idx + 1}
                       </span>
                       <div>
                         <p className="font-bold text-lg text-slate-800 dark:text-white">{q.patientName}</p>
                         <div className="flex items-center gap-4 mt-1">
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border",
                              q.status === QueueStatus.WAITING ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40" :
                              q.status === QueueStatus.IN_CONSULTATION ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                              "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40"
                            )}>
                              {q.status}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {format(q.createdAt?.toDate?.() || new Date(), 'p')}
                            </p>
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isDoctor && (
                          <>
                            {q.status === QueueStatus.WAITING && (
                              <button 
                                onClick={() => updateStatus(q.id!, QueueStatus.IN_CONSULTATION)}
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                                title="Start Consultation"
                              >
                                <Play size={16} />
                              </button>
                            )}
                            {q.status === QueueStatus.IN_CONSULTATION && (
                              <button 
                                onClick={() => updateStatus(q.id!, QueueStatus.COMPLETED)}
                                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-sm"
                                title="Mark Completed"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => removeFromQueue(q.id!)}
                              className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {isPatient && q.patientId === profile.uid && q.status === QueueStatus.WAITING && (
                           <button 
                             onClick={() => removeFromQueue(q.id!)}
                             className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl transition-all"
                           >
                             Cancel Entry
                           </button>
                        )}
                        {myEntry?.id === q.id && (
                          <div className="sm:hidden text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Your Turn</div>
                        )}
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="p-20 text-center flex flex-col items-center justify-center">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                   <Users className="text-slate-200 dark:text-slate-700" size={40} />
                 </div>
                 <p className="font-bold text-slate-400 text-sm">The queue is currently empty.</p>
               </div>
             )}
           </div>
        </main>

        <aside className="space-y-6 order-1 lg:order-2">
           <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-12 -mt-12" />
              <h3 className="text-lg font-bold mb-6 relative z-10">Queue Overview</h3>
              <div className="space-y-6 relative z-10">
                <StatCard label="Patients Waiting" value={String(queue.filter(q => q.status === QueueStatus.WAITING).length)} />
                <StatCard label="Currently Serving" value={String(queue.filter(q => q.status === QueueStatus.IN_CONSULTATION).length)} />
              </div>
           </div>
           
           <div className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">
                <AlertCircle size={14} />
                Notice for Patients
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                Please be present at the waiting area. Your token will be called in order of arrival.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/10 dark:border-slate-700 pb-4">
      <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">{label}</span>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
