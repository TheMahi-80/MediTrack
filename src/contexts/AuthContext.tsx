import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../lib/utils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isDoctor: false,
  isPatient: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            console.log('Real-time profile update:', data.displayName);
            setProfile(data);
            setLoading(false);
          } else {
            // Profile doesn't exist, create it (Bootstrap logic)
            const bootstrapEmail = 'montasin8110@gmail.com'; 
            const isBootstrap = firebaseUser.email === bootstrapEmail;
            
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              role: isBootstrap ? UserRole.ADMIN : UserRole.PATIENT,
              createdAt: new Date(),
            };
            try {
              await setDoc(profileRef, newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
            // onSnapshot will trigger again after setDoc
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === UserRole.ADMIN,
    isDoctor: profile?.role === UserRole.DOCTOR,
    isPatient: profile?.role === UserRole.PATIENT,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
