import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Prescription, UserRole } from '../lib/utils';
import { 
  Plus, 
  Search, 
  History, 
  FileText, 
  MoreVertical,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Prescriptions() {
  const { profile, isPatient, isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    if (!profile) return;

    let q;
    if (isPatient) {
      q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
    } else if (isDoctor) {
      q = query(
        collection(db, 'prescriptions'),
        where('institutionId', '==', profile.institutionId),
        orderBy('createdAt', 'desc')
      );
    } else if (profile.role === UserRole.ADMIN) {
        q = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));
    } else {
        // For DOCTOR_PENDING or other roles, show nothing or own records if they were a patient
        q = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
    }

    const unsub = onSnapshot(q, (snap) => {
      setPrescriptions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    });

    return () => unsub();
  }, [profile, isPatient, isDoctor]);

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-white mb-1">Prescriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Access and manage medical records.</p>
        </div>
        {isDoctor && (
          <button 
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200 dark:shadow-none"
          >
            <Plus size={20} />
            New Prescription
          </button>
        )}
      </header>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search diagnosis..." 
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full pl-12 pr-6 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-400 dark:text-white"
          />
        </div>
        <button className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 transition shadow-sm">
          <Filter size={18} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800 hidden md:flex">
          <div className="px-8 py-3 w-1/2">Prescription / Diagnosis</div>
          <div className="px-8 py-3 w-1/4">Author / Patient</div>
          <div className="px-8 py-3 w-1/4 text-right">Created</div>
        </div>
        {loading ? (
          <div className="p-20 text-center text-slate-400 animate-pulse">Loading records...</div>
        ) : prescriptions.length > 0 ? (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {prescriptions.map((p) => (
              <div 
                key={p.id} 
                onClick={() => setSelectedPrescription(p)}
                className="flex flex-col md:flex-row md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="px-6 md:px-8 py-4 md:py-6 flex items-center gap-4 md:w-1/2">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{p.diagnosis}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">v{p.version} • {p.medicines.length} Medicines</p>
                  </div>
                </div>
                <div className="px-6 md:px-8 py-2 md:py-6 md:w-1/4">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{isPatient ? `Dr. ${p.doctorName?.split(' ').pop()}` : p.patientName}</p>
                </div>
                <div className="px-6 md:px-8 py-4 md:py-6 md:w-1/4 text-right flex md:block justify-between items-center bg-slate-50/30 md:bg-transparent">
                  <span className="md:hidden text-[10px] text-slate-400 uppercase font-bold">Issued on</span>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {format(p.createdAt?.toDate?.() || new Date(), 'LLL dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
               <FileText className="text-slate-200 dark:text-slate-700" size={40} />
             </div>
             <p className="text-slate-400 font-bold text-sm">No medical records available.</p>
          </div>
        )}
      </div>

      {/* Modal for Details */}
      <AnimatePresence>
        {selectedPrescription && (
          <Modal onClose={() => setSelectedPrescription(null)} title="Prescription Details">
            <PrescriptionDetails prescription={selectedPrescription} />
          </Modal>
        )}
        {showForm && (
          <Modal onClose={() => setShowForm(false)} title="New Prescription">
            <PrescriptionForm onComplete={() => setShowForm(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative transition-colors duration-300"
      >
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="text-slate-400" size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 max-h-[85vh] md:max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function PrescriptionDetails({ prescription }: { prescription: Prescription }) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Diagnosis</p>
          <p className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">{prescription.diagnosis}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Date</p>
          <p className="text-base md:text-lg font-medium dark:text-slate-200">{format(prescription.createdAt?.toDate?.() || new Date(), 'PPP')}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">Medications</p>
        <div className="grid gap-3">
          {prescription.medicines.map((m, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white leading-tight">{m.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.dosage}</p>
              </div>
              <span className="text-xs font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 dark:text-slate-300">
                {m.duration}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Doctor's Notes</p>
        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl text-slate-700 dark:text-slate-300 leading-relaxed italic text-sm border border-blue-100/50 dark:border-blue-800/50">
          "{prescription.notes || 'No notes provided.'}"
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <p>Doctor: {prescription.doctorName}</p>
        <p>Version: {prescription.version} • ID: {prescription.id?.slice(-8)}</p>
      </div>
    </div>
  );
}

function PrescriptionForm({ onComplete }: { onComplete: () => void }) {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Auto-lookup patient name
  useEffect(() => {
    if (patientId.length > 5) {
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const snap = await getDoc(doc(db, 'users', patientId));
          if (snap.exists()) {
            setPatientName(snap.data().displayName);
          } else {
            setPatientName('');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'prescriptions'), {
        patientId,
        patientName: patientName || 'Unknown Patient',
        doctorId: profile.uid,
        doctorName: profile.displayName,
        institutionId: profile.institutionId || 'default-clinic',
        diagnosis,
        medicines: medicines.filter(m => m.name),
        notes,
        version: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Patient ID</label>
          <div className="relative">
            <input 
              required 
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" 
              placeholder="Enter Patient UID"
            />
            {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Patient Name</label>
          <input 
            readOnly
            value={patientName}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm dark:text-slate-400 cursor-not-allowed" 
            placeholder={searching ? 'Searching...' : 'Auto-filled from ID'}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Diagnosis</label>
        <input 
          required 
          value={diagnosis}
          onChange={e => setDiagnosis(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" 
          placeholder="Main diagnosis"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Medicines</label>
        {medicines.map((m, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2">
            <input 
              placeholder="Name" 
              value={m.name}
              onChange={e => {
                const newM = [...medicines];
                newM[i].name = e.target.value;
                setMedicines(newM);
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs dark:text-white" 
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                placeholder="Dosage" 
                value={m.dosage}
                onChange={e => {
                  const newM = [...medicines];
                  newM[i].dosage = e.target.value;
                  setMedicines(newM);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs dark:text-white" 
              />
              <input 
                placeholder="Duration" 
                value={m.duration}
                onChange={e => {
                  const newM = [...medicines];
                  newM[i].duration = e.target.value;
                  setMedicines(newM);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs dark:text-white" 
              />
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addMedicine}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          + Add another medicine
        </button>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Clinical Notes</label>
        <textarea 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" 
          placeholder="Additional notes..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 dark:shadow-none disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {loading ? 'Submitting...' : 'Issue Prescription'}
      </button>
    </form>
  );
}
