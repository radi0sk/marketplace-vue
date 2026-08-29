<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import type { Customer, FieldVisit } from '@/types';
import { getCustomers } from '@/services/crmService';
import { useToast } from 'vue-toastification';

const toast = useToast();

const visits = ref<FieldVisit[]>([]);
const customers = ref<Customer[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const submitting = ref(false);

const selectedCustomerId = ref('');
const visitDate = ref(new Date().toISOString().split('T')[0]);
const cropType = ref('Maíz');
const cropPhase = ref('Vegetativa / Crecimiento');
const diagnosis = ref('');
const pestOrDeficiency = ref('');
const recommendedTreatment = ref('');
const followUpDate = ref('');

const cropPhases = [
  'Siembra / Germinación',
  'Vegetativa / Crecimiento',
  'Floración',
  'Llenado de Fruto / Grano',
  'Cosecha / Maduración',
  'Mantenimiento'
];

const fetchVisits = async () => {
  loading.value = true;
  try {
    const [cData, vSnap] = await Promise.all([
      getCustomers(),
      getDocs(query(collection(db, 'field_visits'), orderBy('visitDate', 'desc')))
    ]);
    customers.value = cData;
    visits.value = vSnap.docs.map(d => ({ id: d.id, ...d.data() } as FieldVisit));
  } catch (err) {
    console.error('Error fetching field visits:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchVisits);

const handleSaveVisit = async () => {
  if (!selectedCustomerId.value || !diagnosis.value.trim() || !recommendedTreatment.value.trim()) {
    toast.error('Selecciona cliente y completa el diagnóstico y tratamiento');
    return;
  }

  const cust = customers.value.find(c => c.id === selectedCustomerId.value);
  if (!cust) return;

  submitting.value = true;
  try {
    const payload: Omit<FieldVisit, 'id'> = {
      customerId: cust.id || '',
      customerName: cust.name,
      fincaName: cust.fincaName || '',
      visitDate: visitDate.value,
      cropType: cropType.value,
      cropPhase: cropPhase.value,
      diagnosis: diagnosis.value.trim(),
      pestOrDeficiency: pestOrDeficiency.value.trim() || undefined,
      recommendedTreatment: recommendedTreatment.value.trim(),
      followUpDate: followUpDate.value || undefined,
      agronomistName: 'Ing. Agrónomo Asesor',
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'field_visits'), payload);
    toast.success('¡Visita técnica registrada en la bitácora!');
    isModalOpen.value = false;
    resetForm();
    await fetchVisits();
  } catch (e) {
    console.error('Error saving visit:', e);
    toast.error('Error al guardar la visita');
  } finally {
    submitting.value = false;
  }
};

function resetForm() {
  selectedCustomerId.value = '';
  diagnosis.value = '';
  pestOrDeficiency.value = '';
  recommendedTreatment.value = '';
  followUpDate.value = '';
}

const shareVisitWhatsApp = (v: FieldVisit) => {
  let text = `📋 *REPORTE DE VISITA TÉCNICA EN CAMPO* 🌱\n`;
  text += `👤 *Cliente:* ${v.customerName}\n`;
  text += `🏡 *Finca:* ${v.fincaName || 'Sin especificar'}\n`;
  text += `📅 *Fecha Visita:* ${v.visitDate}\n`;
  text += `🌱 *Cultivo:* ${v.cropType} (${v.cropPhase || ''})\n\n`;

  if (v.pestOrDeficiency) text += `⚠️ *Problema Identificado:* ${v.pestOrDeficiency}\n`;
  text += `🔬 *Diagnóstico:* ${v.diagnosis}\n\n`;
  text += `💊 *Tratamiento Recomendado:*\n${v.recommendedTreatment}\n\n`;

  if (v.followUpDate) text += `🗓️ *Próxima Visita de Seguimiento:* ${v.followUpDate}\n`;
  text += `👨‍🌾 *Asesor Técnico:* ${v.agronomistName || 'Agrónomo Agro Guate'}`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
</script>

<template>
  <div class="space-y-6 font-outfit p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200">
          <font-awesome-icon icon="clipboard-list" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Bitácora de Visitas Técnicas Agronómicas</h2>
          <p class="text-xs text-slate-500 font-medium">Registro de campo, diagnósticos de plagas/enfermedades y recomendaciones</p>
        </div>
      </div>

      <button 
        @click="isModalOpen = true" 
        class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <font-awesome-icon icon="plus" /> Registrar Visita de Campo
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <font-awesome-icon icon="spinner" spin class="text-4xl text-emerald-600 mb-3" />
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando bitácora de campo...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="visits.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto text-2xl">
        <font-awesome-icon icon="tractor" />
      </div>
      <h3 class="text-base font-bold text-slate-700">No hay visitas técnicas registradas</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">Registra la primera visita en la finca de un cliente agricultor.</p>
    </div>

    <!-- Visits Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="v in visits" 
        :key="v.id" 
        class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              📅 {{ v.visitDate }}
            </span>
            <span class="text-[10px] font-bold text-slate-400">🌱 {{ v.cropType }}</span>
          </div>

          <div>
            <h4 class="text-base font-black text-slate-800 tracking-tight">{{ v.customerName }}</h4>
            <p class="text-xs text-slate-500 font-semibold">🏡 Finca: {{ v.fincaName || 'Sin especificar' }}</p>
          </div>

          <div v-if="v.pestOrDeficiency" class="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
            <span class="font-bold text-amber-800">⚠️ Problema:</span>
            <p class="text-amber-900 font-medium">{{ v.pestOrDeficiency }}</p>
          </div>

          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
            <span class="font-bold text-slate-700 block uppercase text-[9px] tracking-wider">Diagnóstico Técnico:</span>
            <p class="text-slate-600 font-medium">{{ v.diagnosis }}</p>
          </div>

          <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1">
            <span class="font-bold text-emerald-800 block uppercase text-[9px] tracking-wider">Tratamiento Recomendado:</span>
            <p class="text-emerald-900 font-medium">{{ v.recommendedTreatment }}</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100">
          <button 
            @click="shareVisitWhatsApp(v)" 
            class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <font-awesome-icon :icon="['fab', 'whatsapp']" /> Compartir Informe por WhatsApp
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-outfit">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-black text-slate-800">Nueva Visita Técnica Agronómica</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Cliente Agricultor *</label>
            <select v-model="selectedCustomerId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold">
              <option value="">-- Selecciona un Cliente del CRM --</option>
              <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }} ({{ c.fincaName || 'Finca' }})</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Fecha de Visita</label>
              <input v-model="visitDate" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold" />
            </div>

            <div>
              <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Cultivo Revisado</label>
              <input v-model="cropType" type="text" placeholder="Ej. Maíz" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Etapa / Fenología del Cultivo</label>
            <select v-model="cropPhase" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold">
              <option v-for="ph in cropPhases" :key="ph" :value="ph">{{ ph }}</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Problema / Plaga / Deficiencia Identificada</label>
            <input v-model="pestOrDeficiency" type="text" placeholder="Ej. Mancha de asfalto / Deficiencia de Nitrógeno" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold" />
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Diagnóstico Agronómico *</label>
            <textarea v-model="diagnosis" rows="2" placeholder="Observaciones técnicas en las hojas, raíces o suelo..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"></textarea>
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Tratamiento e Insumos Recomendados *</label>
            <textarea v-model="recommendedTreatment" rows="3" placeholder="Ej. Aplicar Fungicida X (200ml/bomba) + Fertilizante foliar Y..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button @click="isModalOpen = false" class="px-4 py-2 font-bold text-xs text-slate-500">Cancelar</button>
          <button @click="handleSaveVisit" :disabled="submitting" class="px-5 py-2 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl">
            {{ submitting ? 'Guardando...' : 'Guardar Visita' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
