<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { UserProject } from '@/types';
import { useToast } from 'vue-toastification';

const toast = useToast();
const users = ref<UserProject[]>([]);
const loading = ref(true);
const searchQuery = ref('');

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserProject));
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Error al cargar la lista de usuarios');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

// Computed stats
const stats = computed(() => {
  return {
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin').length,
    asociados: users.value.filter(u => u.role === 'asociado').length,
    clientes: users.value.filter(u => u.role === 'cliente').length
  };
});

// Filtering
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    u.displayName.toLowerCase().includes(q) || 
    u.email?.toLowerCase().includes(q)
  );
});

// Update role
const updateRole = async (userId: string, newRole: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    
    // Update local state
    const userIndex = users.value.findIndex(u => u.uid === userId);
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole as any;
    }
    
    toast.success('Rol actualizado con éxito');
  } catch (error) {
    console.error('Error updating role:', error);
    toast.error('No se pudo actualizar el rol');
  }
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'asociado': return 'bg-primary-50 text-primary-600 border-primary-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};
</script>

<template>
  <div class="p-8 space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
        <p class="text-slate-500 font-medium">Administra los roles y privilegios de tu equipo y clientes.</p>
      </div>
      
      <div class="relative">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nombre o email..." 
          class="w-full md:w-80 bg-white border border-slate-200 rounded-2xl py-3 px-5 pr-12 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
        />
        <i class="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
          <i class="fas fa-users text-xl"></i>
        </div>
        <div>
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Total Usuarios</p>
          <p class="text-3xl font-black text-slate-900">{{ stats.total }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
          <i class="fas fa-user-shield text-xl"></i>
        </div>
        <div>
          <p class="text-xs font-black text-rose-400 uppercase tracking-widest">Administradores</p>
          <p class="text-3xl font-black text-slate-900">{{ stats.admins }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 border-l-4 border-l-primary-500">
        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
          <i class="fas fa-user-tie text-xl"></i>
        </div>
        <div>
          <p class="text-xs font-black text-primary-400 uppercase tracking-widest">Asociados</p>
          <p class="text-3xl font-black text-slate-900">{{ stats.asociados }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <i class="fas fa-user text-xl"></i>
        </div>
        <div>
          <p class="text-xs font-black text-emerald-400 uppercase tracking-widest">Clientes</p>
          <p class="text-3xl font-black text-slate-900">{{ stats.clientes }}</p>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <i class="fas fa-spinner fa-spin text-3xl text-primary-500"></i>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando usuarios...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Usuario</th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Rol Actual</th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cambiar Privilegios</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-slate-50/30 transition-colors">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                    <img :src="user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ user.displayName }}</p>
                    <p class="text-xs text-slate-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span 
                  class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  :class="getRoleBadgeClass(user.role || 'cliente')"
                >
                  {{ user.role || 'cliente' }}
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <select 
                    :value="user.role || 'cliente'" 
                    @change="updateRole(user.uid, ($event.target as HTMLSelectElement).value)"
                    class="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="asociado">Asociado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && filteredUsers.length === 0" class="py-20 text-center space-y-4">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <i class="fas fa-search text-2xl"></i>
        </div>
        <p class="text-slate-500 font-medium">No se encontraron usuarios que coincidan con tu búsqueda.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}
</style>
