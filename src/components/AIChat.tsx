import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Prescription, UserRole } from '../lib/utils';
import { askAI } from '../services/geminiService';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your MediTrack clinical assistant. I have access to your medical records here. How can I help you understand them today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { profile } = useAuth();
  const [context, setContext] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;

    let profileContext = `User Profile: Name: ${profile.displayName}, Role: ${profile.role}.`;
    if (profile.age) profileContext += ` Age: ${profile.age}.`;
    if (profile.sex) profileContext += ` Sex: ${profile.sex}.`;
    if (profile.height) profileContext += ` Height: ${profile.height}.`;
    if (profile.weight) profileContext += ` Weight: ${profile.weight}.`;

    const isPatient = profile.role === UserRole.PATIENT;
    const isDoctor = profile.role === UserRole.DOCTOR;

    let q;
    if (isPatient) {
      q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', profile.uid)
      );
    } else if (isDoctor) {
      q = query(
        collection(db, 'prescriptions'),
        where('doctorId', '==', profile.uid)
      );
    }

    if (!q) return;

    const unsub = onSnapshot(q, (snap) => {
      const records = snap.docs.map(doc => doc.data() as Prescription);
      let recordsContext = '';
      if (records.length > 0) {
        recordsContext = isPatient 
          ? "Your Medical Records (Prescriptions):\n" + records.map(r => 
              `- Date: ${r.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}, Diagnosis: ${r.diagnosis}, Meds: ${r.medicines.map(m => m.name).join(', ')}, Notes: ${r.notes}`
            ).join('\n')
          : "Records you have issued:\n" + records.map(r => 
              `- Patient: ${r.patientName}, Date: ${r.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}, Diagnosis: ${r.diagnosis}`
            ).join('\n');
      } else {
        recordsContext = isPatient ? "No medical records found for you yet." : "You haven't issued any prescriptions yet.";
      }
      
      setContext(`${profileContext}\n\n${recordsContext}\n\nToday's Date: ${new Date().toLocaleDateString()}`);
    });

    return () => unsub();
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await askAI(userMessage, context);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble processing your request. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    MediTrack AI <Sparkles size={14} className="text-blue-200" />
                  </h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-black leading-none mt-1">Clinical Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/50"
            >
              {messages.map((m, i) => (
                <div 
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'
                  }`}>
                    {m.text.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How do my medications interact?"
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium dark:text-white"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-100 dark:shadow-none"
              >
                <Send size={24} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 text-white rounded-[24px] shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center hover:bg-blue-700 transition-all border-4 border-white dark:border-slate-900 relative"
      >
        {isOpen ? <X size={32} /> : (
          <>
            <MessageSquare size={32} />
            {!isOpen && messages.length === 1 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
            )}
          </>
        )}
      </motion.button>
    </div>
  );
}
