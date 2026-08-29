<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCustomers, deleteCustomer } from '@/services/crmService';
import type { Customer } from '@/types';
import CustomerModal from '@/components/crm/CustomerModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const customers = ref<Customer[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterCrop = ref('');

const isModalOpen = ref(false);
const customerToEdit = ref<Customer | null>(null);

const fetchCustomersData = async () => {
  loading.value = true;
  try {
    customers.value = await getCustomers();
  } catch (err) {
    console.error('Error fetching customers:', err);
    toast.error('Error al cargar agricultores');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCustomersData);

const filteredCustomers = computed(() => {
  return customers.value.filter(c => {
    const matchesSearch = !searchQuery.value.trim() || 
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery.value)) ||
      (c.fincaName && c.fincaName.toLowerCase().includes(searchQuery.value.toLowerCase()));

    const matchesCrop = !filterCrop.value || 
      (c.mainCrops && c.mainCrops.includes(filterCrop.value));

    return matchesSearch && matchesCrop;
  });
});

const openNewModal = () => {
  customerToEdit.value = null;
  isModalOpen.value = true;
};

const openEditModal = (customer: Customer) => {
  customerToEdit.value = customer;
  isModalOpen.value = true;
};

const handleDelete = async (id?: string) => {
  if (!id) return;
  if (confirm('¿Deseas eliminar este registro de agricultor?')) {
    try {
      await deleteCustomer(id);
      toast.success('Cliente eliminado');
      await fetchCustomersData();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  }
};

const openWhatsAppChat = (c: Customer) => {
  const phone = c.phone.replace(/[^0-9]/g, '');
  const text = `¡Hola ${c.name}! Te saludamos de Agro Guate 🌱. ¿Cómo van tus cultivos en ${c.fincaName || 'tu finca'}? Cuéntanos si necesitas insumos o asesoría técnica.`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
</script>

<template>
  <div class="space-y-6 font-outfit p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200">
          <font-awesome-icon icon="users" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Directorio y CRM Agrícola de Clientes</h2>
          <p class="text-xs text-slate-500 font-medium">Administra agricultores, datos de finca, cultivos principales y control de crédito/deudas</p>
        </div>
      </div>

      <button 
        @click="openNewModal" 
        class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <font-awesome-icon icon="user-plus" /> Registrar Agricultor
      </button>
    </div>

    <!-- Search & Crop Filter Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="sm:col-span-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <font-awesome-icon icon="search" class="text-slate-400 text-sm ml-2" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar por nombre, finca o teléfono..." 
          class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800"
        />
      </div>

      <div class="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <select v-model="filterCrop" class="w-full bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0">
          <option value="">-- Todos los Cultivos --</option>
          <option value="Maíz">Maíz</option>
          <option value="Café">Café</option>
          <option value="Hortalizas">Hortalizas</option>
          <option value="Aguacate">Aguacate</option>
          <option value="Cardamomo">Cardamomo</option>
          <option value="Frijol">Frijol</option>
          <option value="Ganadería">Ganadería</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <font-awesome-icon icon="spinner" spin class="text-4xl text-emerald-600 mb-3" />
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando directorio de agricultores...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCustomers.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto text-2xl">
        <font-awesome-icon icon="address-book" />
      </div>
      <h3 class="text-base font-bold text-slate-700">No se encontraron agricultores</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">Registra tu primer cliente agricultor para darle seguimiento a sus cultivos y crédito.</p>
    </div>

    <!-- Customer Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="c in filteredCustomers" 
        :key="c.id" 
        class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group"
      >
        <div class="space-y-4">
          <!-- Top Card Header -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-100 text-emerald-800 font-black rounded-2xl flex items-center justify-center text-sm shadow-sm uppercase">
                {{ c.name.slice(0, 2) }}
              </div>
              <div>
                <h4 class="text-base font-black text-slate-800 tracking-tight leading-snug">{{ c.name }}</h4>
                <p class="text-xs font-semibold text-emerald-600">📞 {{ c.phone }}</p>
              </div>
            </div>

            <!-- Debt Tag -->
            <span 
              :class="[
                'px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                (c.currentDebt || 0) > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              ]"
            >
              {{ (c.currentDebt || 0) > 0 ? `Deuda: Q${c.currentDebt}` : 'Sin Deuda' }}
            </span>
          </div>

          <!-- Farm Details -->
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <p class="font-bold text-slate-700">🏡 Finca: <span class="font-normal">{{ c.fincaName || 'Sin especificar' }}</span></p>
            <p class="text-slate-500">📍 {{ c.department || 'Sololá' }} {{ c.municipality ? `, ${c.municipality}` : '' }}</p>
            <p v-if="c.parcelSize" class="text-slate-500">📐 Superficie: {{ c.parcelSize }} {{ c.parcelUnit || 'mz' }}</p>
          </div>

          <!-- Crops Tags -->
          <div v-if="c.mainCrops && c.mainCrops.length > 0" class="flex flex-wrap gap-1">
            <span 
              v-for="crop in c.mainCrops" 
              :key="crop" 
              class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg"
            >
              🌱 {{ crop }}
            </span>
          </div>

          <p v-if="c.notes" class="text-[11px] text-slate-400 italic line-clamp-2">"{{ c.notes }}"</p>
        </div>

        <!-- Footer Action Buttons -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            @click="openWhatsAppChat(c)" 
            class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <font-awesome-icon :icon="['fab', 'whatsapp']" class="text-sm" /> WhatsApp Directo
          </button>

          <button 
            @click="openEditModal(c)" 
            class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
            title="Editar agricultor"
          >
            <font-awesome-icon icon="edit" />
          </button>

          <button 
            @click="handleDelete(c.id)" 
            class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition-colors"
            title="Eliminar agricultor"
          >
            <font-awesome-icon icon="trash-alt" />
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <CustomerModal 
      :isOpen="isModalOpen" 
      :customerToEdit="customerToEdit" 
      @close="isModalOpen = false" 
      @saved="fetchCustomersData" 
    />
  </div>
</template>
