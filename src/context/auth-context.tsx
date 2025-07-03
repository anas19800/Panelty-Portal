
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/mock-data';
import type { User as AuthUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: AuthUser | null | undefined;
  user: User | null | undefined; // This is the user from Firestore with role info
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: undefined,
  user: undefined,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, authLoading] = useAuthState(auth);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", authUser.email));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      } else {
        // User exists in Auth, but not in Firestore 'users' collection.
        // This could be a new user who hasn't completed registration profile.
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching user role:", error);
        setUser(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [authUser, authLoading]);

  return (
    <AuthContext.Provider value={{ authUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// A component to protect routes based on permissions
export const PageGuard = ({ 
    children, 
    feature, 
    requiredPermission 
}: { 
    children: React.ReactNode, 
    feature: any, 
    requiredPermission: any 
}) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { getPermission } = require('@/lib/permissions'); // Use require to avoid circular dependency issues at build time

    const userPermission = getPermission(user?.role, feature);
    
    const hasRequiredPermission = () => {
        if (requiredPermission === 'write') {
            return userPermission === 'write';
        }
        if (requiredPermission === 'read') {
            return userPermission === 'read_all' || userPermission === 'read_own' || userPermission === 'write';
        }
        return false;
    };

    useEffect(() => {
        if (!loading && !hasRequiredPermission()) {
            router.replace('/');
        }
    }, [user, loading, router, userPermission]);

    if (loading || !hasRequiredPermission()) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-muted-foreground">جاري التحميل أو ليس لديك الصلاحية...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
