<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "vue-toastification";
import { uploadImageToCloudinary } from "@/services/cloudinary";

const toast = useToast();
const authStore = useAuthStore();
const loading = ref(true);
const isEditing = ref(false);
const activeTab = ref('personal'); // 'personal', 'bank', 'shipping'

const userData = ref<any>({
  name: '',
  email: '',
  phone: '',
  role: 'cliente',
  photoURL: '',
  bankAccount: {
    bankName: '',
    accountNumber: '',
    accountType: 'Ahorros', // 'Ahorros' or 'Monetaria'
    ownerName: ''
  },
  direccionEnvio: {
    nombre: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: ''
  }
});

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const fetchProfile = async () => {
  if (!authStore.user) return;
  
  try {
    loading.value = true;
    const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      userData.value = { 
        ...userData.value, 
        ...data,
        email: authStore.user.email 
      };
      // Ensure nested objects exist
      if (!userData.value.bankAccount) userData.value.bankAccount = { bankName: '', accountNumber: '', accountType: 'Ahorros', ownerName: '' };
      if (!userData.value.direccionEnvio) userData.value.direccionEnvio = { nombre: '', direccion: '', ciudad: '', departamento: '', codigoPostal: '' };
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    toast.error("Error al cargar perfil");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProfile);

const handleAvatarChange = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  if (!authStore.user) return;
  
  try {
    loading.value = true;
    let photoURL = userData.value.photoURL;
    
    if (avatarFile.value) {
      photoURL = await uploadImageToCloudinary(avatarFile.value);
    }
    
    await updateDoc(doc(db, "users", authStore.user.uid), {
      ...userData.value,
      photoURL
    });
    
    toast.success("Perfil actualizado con éxito");
    isEditing.value = false;
    avatarFile.value = null;
    avatarPreview.value = null;
  } catch (error) {
    console.error("Error saving profile:", error);
    toast.error("Error al guardar cambios");
  } finally {
    loading.value = false;
  }
};

const isPartner = computed(() => userData.value.role === 'admin' || userData.value.role === 'mayorista' || userData.value.isPartner);
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <div class="max-w-5xl mx-auto px-4 pt-10">
      
      <!-- Profile Header -->
      <div class="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        
        <div class="relative flex flex-col md:flex-row items-center gap-8">
          <div class="relative group">
            <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img :src="avatarPreview || userData.photoURL || defaultAvatar" class="w-full h-full object-cover" />
            </div>
            <label v-if="isEditing" class="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-all">
              <i class="fas fa-camera"></i>
              <input type="file" @change="handleAvatarChange" class="hidden" accept="image/*" />
            </label>
          </div>
          
          <div class="flex-1 text-center md:text-left space-y-2">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 class="text-3xl md:text-4xl font-black text-slate-800 font-outfit">{{ userData.name || 'Sin Nombre' }}</h1>
              <span v-if="isPartner" class="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                <i class="fas fa-certificate mr-1"></i> Socio Verificado
              </span>
            </div>
            <p class="text-slate-500 font-medium">{{ userData.email }}</p>
            
            <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button v-if="!isEditing" @click="isEditing = true" class="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                Editar Perfil
              </button>
              <button v-else @click="saveProfile" class="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-700 transition-all" :disabled="loading">
                {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
              
              <router-link v-if="isPartner" to="/partner/dashboard" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all">
                <i class="fas fa-chart-line mr-2"></i> Mi Panel de Socio
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Tabs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="space-y-2">
          <button @click="activeTab = 'personal'" :class="['w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all', activeTab === 'personal' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-white text-slate-500 hover:bg-slate-100']">
            <i class="fas fa-user-circle"></i> Personal
          </button>
          <button @click="activeTab = 'bank'" :class="['w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all', activeTab === 'bank' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white text-slate-500 hover:bg-slate-100']">
            <i class="fas fa-university"></i> Datos Bancarios
          </button>
          <button @click="activeTab = 'shipping'" :class="['w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all', activeTab === 'shipping' ? 'bg-slate-800 text-white shadow-xl shadow-slate-500/20' : 'bg-white text-slate-500 hover:bg-slate-100']">
            <i class="fas fa-truck"></i> Envío
          </button>
        </div>

        <!-- Content Area -->
        <div class="md:col-span-3 bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100">
          
          <!-- Personal Tab -->
          <div v-if="activeTab === 'personal'" class="space-y-8 animate-fade-in">
            <h2 class="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-primary-500 pl-4">Datos Personales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Nombre Completo</label>
                <input v-model="userData.name" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Teléfono / WhatsApp</label>
                <input v-model="userData.phone" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          <!-- Bank Tab -->
          <div v-if="activeTab === 'bank'" class="space-y-8 animate-fade-in">
            <div>
              <h2 class="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-500 pl-4 mb-2">Cuentas Bancarias</h2>
              <p class="text-slate-400 text-xs font-medium">Información necesaria para depositar tus comitivas y ventas.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Nombre del Banco</label>
                <input v-model="userData.bankAccount.bankName" :disabled="!isEditing" placeholder="Ej: Banrural, Industrial..." class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Número de Cuenta</label>
                <input v-model="userData.bankAccount.accountNumber" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Tipo de Cuenta</label>
                <select v-model="userData.bankAccount.accountType" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                  <option value="Ahorros">Ahorros</option>
                  <option value="Monetaria">Monetaria</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Nombre del Titular</label>
                <input v-model="userData.bankAccount.ownerName" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
            </div>
            
            <div v-if="!isEditing && !userData.bankAccount.accountNumber" class="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <p class="text-slate-400 text-sm font-medium">No has registrado datos bancarios. ¡Edita tu perfil para agregarlos!</p>
            </div>
          </div>

          <!-- Shipping Tab -->
          <div v-if="activeTab === 'shipping'" class="space-y-8 animate-fade-in">
            <h2 class="text-xl font-black text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-4">Dirección de Envío</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2 space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Dirección Exacta</label>
                <input v-model="userData.direccionEnvio.direccion" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Ciudad / Municipio</label>
                <input v-model="userData.direccionEnvio.ciudad" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase">Departamento</label>
                <input v-model="userData.direccionEnvio.departamento" :disabled="!isEditing" class="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold text-slate-800 disabled:opacity-60 outline-none" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>