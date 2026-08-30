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
            const userData = userDoc.data();
            this.user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData?.name || 'Usuario',
              role: userData?.role || 'cliente',
              isPartner: userData?.role === 'admin' || userData?.role === 'mayorista' || !!userData?.isPartner,
              photoURL: firebaseUser.photoURL || userData?.photoURL || null,
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
    isPartner: (state) => state.user?.role === 'admin' || state.user?.role === 'mayorista' || !!state.user?.isPartner,
  }
});
