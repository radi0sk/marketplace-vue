<template>
  <div class="login-form">
    <h2>Iniciar Sesión</h2>
    <button @click="loginWithGoogle" :disabled="isLoading" class="google-login-button">
      <span v-if="isLoading">Cargando...</span>
      <span v-else>Iniciar Sesión con Google</span>
    </button>
  </div>
</template>

<script>
import { auth, googleProvider, db } from "@/services/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default {
  name: "LoginForm",
  data() {
    return {
      isLoading: false
    };
  },
  methods: {
    async loginWithGoogle() {
      this.isLoading = true;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Verificar si el usuario ya existe en Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "cliente",
            favorites: [],
            purchaseHistory: [],
            visitCount: 0,
          });
        }

        this.$root.$emit('show-notification', {
          message: `Bienvenido ${user.displayName || ''}`,
          type: 'success'
        });
        this.$router.push("/");
      } catch (error) {
        this.$root.$emit('show-notification', {
          message: 'Error al iniciar sesión: ' + error.message,
          type: 'error'
        });
        console.error("Login error:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-form {
  max-width: 300px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.google-login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.google-login-button:hover {
  background-color: #357ABD;
}

.google-login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>