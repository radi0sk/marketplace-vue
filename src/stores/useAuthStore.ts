import { defineStore } from 'pinia';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProject } from '@/types';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserProject | null,
    loading: true,
  }),
  actions: {
    async initialize() {
      return new Promise<UserProject | null>((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            this.user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userDoc.data()?.name || 'Usuario',
              role: userDoc.data()?.role || 'cliente',
            };
          } else {
            this.user = null;
          }
          this.loading = false;
          resolve(this.user);
        });
      });
    },
    async logout() {
      await signOut(auth);
      this.user = null;
      router.push('/login');
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  }
});
