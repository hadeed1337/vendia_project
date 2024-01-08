import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../api/Firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export const AuthContext = createContext({
  currentUser: null,
  accountType: null,
  signOutAndRefresh: () => {},
  setAccountType: () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [userOrg, setUserOrg] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        setCurrentUser(user); 

        if (userDocSnap.exists()) {
          
          localStorage.setItem('accountType', userDocSnap.data().accountType);
          setAccountType(userDocSnap.data().accountType);
          localStorage.setItem('userOrg', userDocSnap.data().org);
          setUserOrg(userDocSnap.data().org);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    
  }, [currentUser]);

  const setUser = (user) => {
    setCurrentUser(user);
  };



  //console.log('Sign out error:', currentUser)

  const signOutAndRefresh = async () => {
    try {
      await signOut(auth)
      setCurrentUser(null)
      localStorage.setItem('loggedIn', 'false')
      localStorage.removeItem('accountType');
      localStorage.removeItem('contextType');
      localStorage.removeItem('testEntity');
      localStorage.removeItem('userOrg');
    } catch (error) {
      console.error('Sign out error:', error)
    }
    
  }

  return (
    <AuthContext.Provider value={{ currentUser, accountType, signOutAndRefresh, setAccountType, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
