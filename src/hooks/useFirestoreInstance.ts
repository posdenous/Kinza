import { useState, useEffect } from 'react';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

/**
 * Custom hook to replace the deprecated useFirestore hook
 * Returns the Firestore instance in the same format as the original hook
 * @returns [firestore] - An array with the Firestore instance
 */
export const useFirestoreInstance = (): [Firestore] => {
  const [firestoreInstance, setFirestoreInstance] = useState<Firestore | null>(null);
  
  useEffect(() => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      setFirestoreInstance(db);
    } catch (error) {
      console.error('Error initializing Firestore:', error);
    }
  }, []);

  // Return in the same format as the original useFirestore hook
  // This ensures minimal changes to existing code
  return [firestoreInstance as Firestore];
};
