<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider, db } from "@/services/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

const loginWithGoogle = async () => {
  isLoading.value = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

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
        createdAt: new Date().toISOString()
      });
    }

    toast.success(`¡Bienvenido de nuevo, ${user.displayName}!`);
    router.push("/");
  } catch (error: any) {
    toast.error("Error al iniciar sesión: " + error.message);
    console.error("Login error:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50">
    <!-- Background Accents -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
       <div class="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-100 blur-[120px] rounded-full opacity-50"></div>
       <div class="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-100 blur-[120px] rounded-full opacity-50"></div>
    </div>

    <div class="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
      <!-- Left side: Illustration/Branding -->
      <div class="w-full md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div class="absolute inset-0 opacity-20">
          <img src="https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png" class="w-full h-full object-cover grayscale" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-br from-primary-600/40 to-slate-900/90"></div>
        
        <div class="relative z-10 space-y-2">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <font-awesome-icon icon="shopping-cart" class="text-primary-600 text-xl" />
          </div>
          <h2 class="text-4xl font-bold font-outfit">Agro Guate</h2>
          <p class="text-slate-300 font-medium tracking-wide">La red de comercio agrícola más grande del país.</p>
        </div>

        <div class="relative z-10 space-y-4">
           <p class="text-sm italic text-slate-400 leading-relaxed">
             "La mejor plataforma que he usado para surtir mi negocio. Rápida, segura y con productos de primera calidad."
           </p>
           <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-slate-700"></div>
             <div>
               <p class="text-xs font-bold">Fernando Morales</p>
               <p class="text-[10px] text-slate-500">Productor Local</p>
             </div>
           </div>
        </div>
      </div>

      <!-- Right side: Login Form -->
      <div class="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center space-y-10 bg-white">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-slate-800 font-outfit">Bienvenido</h1>
          <p class="text-slate-400 text-sm">Gestiona tus pedidos y favoritos de forma sencilla.</p>
        </div>

        <div class="w-full max-w-sm space-y-6">
          <button 
            @click="loginWithGoogle" 
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 py-4 px-6 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" class="w-6 h-6" />
            <span>Continuar con Google</span>
          </button>

          <div class="relative flex items-center justify-center">
             <div class="absolute inset-x-0 h-px bg-slate-100"></div>
             <span class="relative bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">O</span>
          </div>

          <p class="text-[10px] text-slate-400 text-center leading-relaxed">
            Al continuar, aceptas nuestros <a href="#" class="text-primary-600 hover:underline">Términos de Servicio</a> y <a href="#" class="text-primary-600 hover:underline">Política de Privacidad</a>.
          </p>
        </div>

        <div v-if="isLoading" class="flex items-center gap-2 text-primary-600 font-bold text-xs animate-pulse">
           <font-awesome-icon icon="spinner" spin />
           <span>Iniciando sesión...</span>
        </div>

        <router-link to="/" class="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest pt-10">
           Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>