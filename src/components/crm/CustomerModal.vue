<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Customer } from '@/types';
import { addCustomer, updateCustomer } from '@/services/crmService';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  isOpen: boolean;
  customerToEdit?: Customer | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const submitting = ref(false);

const name = ref('');
const phone = ref('');
const email = ref('');
const fincaName = ref('');
const department = ref('Sololá');
const municipality = ref('');
const address = ref('');
const selectedCrops = ref<string[]>([]);
const parcelSize = ref<number | undefined>(undefined);
const parcelUnit = ref<'mz' | 'ha' | 'cu'>('mz');
const currentDebt = ref<number>(0);
const creditLimit = ref<number>(0);
const notes = ref('');

const availableCrops = [
  'Maíz', 'Café', 'Hortalizas', 'Aguacate', 'Cardamomo', 
  'Frijol', 'Banano/Plátano', 'Papa', 'Cebolla', 'Tomate', 
  'Frutales', 'Ganadería'
];

watch(() => props.customerToEdit, (newVal) => {
  if (newVal) {
    name.value = newVal.name || '';
    phone.value = newVal.phone || '';
    email.value = newVal.email || '';
    fincaName.value = newVal.fincaName || '';
    department.value = newVal.department || 'Sololá';
    municipality.value = newVal.municipality || '';
    address.value = newVal.address || '';
    selectedCrops.value = newVal.mainCrops || [];
    parcelSize.value = newVal.parcelSize;
    parcelUnit.value = newVal.parcelUnit || 'mz';
    currentDebt.value = newVal.currentDebt || 0;
    creditLimit.value = newVal.creditLimit || 0;
    notes.value = newVal.notes || '';
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  name.value = '';
  phone.value = '';
  email.value = '';
  fincaName.value = '';
  department.value = 'Sololá';
  municipality.value = '';
  address.value = '';
  selectedCrops.value = [];
  parcelSize.value = undefined;
  parcelUnit.value = 'mz';
  currentDebt.value = 0;
  creditLimit.value = 0;
  notes.value = '';
}

const toggleCrop = (crop: string) => {
  if (selectedCrops.value.includes(crop)) {
    selectedCrops.value = selectedCrops.value.filter(c => c !== crop);
  } else {
    selectedCrops.value.push(crop);
  }
};

const handleSubmit = async () => {
  if (!name.value.trim() || !phone.value.trim()) {
    toast.error('Nombre y teléfono son campos obligatorios');
    return;
  }

  submitting.value = true;
  try {
    const payload: Omit<Customer, 'id'> = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim() || undefined,
      fincaName: fincaName.value.trim() || undefined,
      department: department.value,
      municipality: municipality.value.trim() || undefined,
      address: address.value.trim() || undefined,
      mainCrops: selectedCrops.value,
      parcelSize: parcelSize.value,
      parcelUnit: parcelUnit.value,
      currentDebt: currentDebt.value,
      creditLimit: creditLimit.value,
      notes: notes.value.trim() || undefined
    };

    if (props.customerToEdit && props.customerToEdit.id) {
      await updateCustomer(props.customerToEdit.id, payload);
      toast.success('Cliente actualizado correctamente');
    } else {
      await addCustomer(payload);
      toast.success('Agricultor registrado exitosamente');
    }

    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Error saving customer:', err);
    toast.error('Error al guardar cliente');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-outfit">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-8">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
            <font-awesome-icon icon="user-plus" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-800 tracking-tight">
              {{ customerToEdit ? 'Editar Ficha del Agricultor' : 'Nuevo Agricultor / Cliente Agrícola' }}
            </h3>
            <p class="text-xs text-slate-500 font-medium">Registra información técnica de la finca, cultivos y control financiero</p>
          </div>
        </div>

        <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <!-- Form Body -->
      <div class="space-y-4 text-xs">
        <!-- Name & Phone -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Nombre Completo *</label>
            <input 
              v-model="name" 
              type="text" 
              placeholder="Ej. Pedro Ramírez" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Teléfono / WhatsApp *</label>
            <input 
              v-model="phone" 
              type="text" 
              placeholder="Ej. 50254317333" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- Finca & Location -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Nombre de la Finca / Terreno</label>
            <input 
              v-model="fincaName" 
              type="text" 
              placeholder="Ej. Finca San José" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
            />
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Departamento</label>
            <select v-model="department" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800">
              <option value="Sololá">Sololá</option>
              <option value="Chimaltenango">Chimaltenango</option>
              <option value="Quetzaltenango">Quetzaltenango</option>
              <option value="Huehuetenango">Huehuetenango</option>
              <option value="San Marcos">San Marcos</option>
              <option value="Sacatepéquez">Sacatepéquez</option>
              <option value="Alta Verapaz">Alta Verapaz</option>
              <option value="Escuintla">Escuintla</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Municipio / Aldea</label>
            <input 
              v-model="municipality" 
              type="text" 
              placeholder="Ej. Santiago Atitlán" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
            />
          </div>
        </div>

        <!-- Parcel Size & Main Crops -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Tamaño del Terreno</label>
            <div class="flex gap-2">
              <input 
                v-model.number="parcelSize" 
                type="number" 
                step="0.5" 
                placeholder="Ej. 5" 
                class="w-2/3 bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
              />
              <select v-model="parcelUnit" class="w-1/3 bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800">
                <option value="mz">Manzanas</option>
                <option value="ha">Hectáreas</option>
                <option value="cu">Cuerdas</option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Cultivos Principales</label>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <button 
                v-for="c in availableCrops" 
                :key="c"
                @click="toggleCrop(c)"
                type="button"
                :class="[
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
                  selectedCrops.includes(c) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                ]"
              >
                {{ c }}
              </button>
            </div>
          </div>
        </div>

        <!-- Financial Debt & Credit -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Deuda Actual / Cuenta por Cobrar (Q)</label>
            <input 
              v-model.number="currentDebt" 
              type="number" 
              step="10" 
              class="w-full bg-white border border-emerald-200 rounded-xl p-2 font-black text-rose-600 text-sm"
            />
          </div>

          <div>
            <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Límite de Crédito (Q)</label>
            <input 
              v-model.number="creditLimit" 
              type="number" 
              step="100" 
              class="w-full bg-white border border-emerald-200 rounded-xl p-2 font-black text-slate-800 text-sm"
            />
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="font-bold text-slate-600 uppercase tracking-wider block mb-1">Observaciones / Notas Técnicas</label>
          <textarea 
            v-model="notes" 
            rows="2" 
            placeholder="Ej. Terreno inclinado, prefiere marcas específicas, fechas de cosecha..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          @click="$emit('close')" 
          type="button" 
          class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancelar
        </button>

        <button 
          @click="handleSubmit" 
          :disabled="submitting" 
          type="button" 
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
        >
          {{ submitting ? 'Guardando...' : 'Guardar Agricultor' }}
        </button>
      </div>
    </div>
  </div>
</template>
