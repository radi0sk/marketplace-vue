<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db, auth } from '@/services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const authStore = useAuthStore();
const submitting = ref(false);

const businessName = ref('');
const partnerType = ref('Mayorista de Insumos');
const phone = ref('');
const department = ref('Sololá');
const municipality = ref('');
const address = ref('');
const description = ref('');

// Bank Account details
const bankName = ref('Banrural');
const accountType = ref<'Ahorros' | 'Monetaria'>('Ahorros');
const accountNumber = ref('');
const ownerName = ref('');

const partnerTypes = [
  'Mayorista de Insumos',
  'Agrónomo Asesor Técnico',
  'Distribuidor de Fertilizantes/Semillas',
  'Vendedor de Maquinaria/Herramientas',
  'Proveedor Local / Cooperativa'
];

const departments = [
  'Sololá', 'Chimaltenango', 'Quetzaltenango', 'Huehuetenango',
  'San Marcos', 'Sacatepéquez', 'Alta Verapaz', 'Baja Verapaz',
  'Escuintla', 'Guatemala', 'Otros'
];

onMounted(async () => {
  if (authStore.user) {
    try {
      const snap = await getDoc(doc(db, 'users', authStore.user.uid));
      if (snap.exists()) {
        const d = snap.data();
        businessName.value = d.partnerInfo?.businessName || d.name || '';
        phone.value = d.partnerInfo?.phone || d.phone || '';
        department.value = d.partnerInfo?.department || 'Sololá';
        municipality.value = d.partnerInfo?.municipality || '';
        address.value = d.partnerInfo?.address || '';
        description.value = d.partnerInfo?.description || '';

        if (d.bankAccount) {
          bankName.value = d.bankAccount.bankName || 'Banrural';
          accountType.value = d.bankAccount.accountType || 'Ahorros';
          accountNumber.value = d.bankAccount.accountNumber || '';
          ownerName.value = d.bankAccount.ownerName || d.name || '';
        } else {
          ownerName.value = d.name || '';
        }
      }
    } catch (e) {
      console.error('Error pre-filling user partner info:', e);
    }
  }
});

const handleSubmit = async () => {
  if (!businessName.value.trim() || !phone.value.trim()) {
    toast.error('Por favor completa el nombre comercial y teléfono de contacto');
    return;
  }

  if (!authStore.user) {
    toast.error('Debes iniciar sesión para darte de alta');
    return;
  }

  submitting.value = true;
  try {
    const userRef = doc(db, 'users', authStore.user.uid);
    const now = new Date().toISOString();

    const partnerPayload = {
      isPartner: true,
      role: 'mayorista',
      partnerStatus: 'approved',
      partnerType: partnerType.value,
      partnerInfo: {
        businessName: businessName.value.trim(),
        partnerType: partnerType.value,
        phone: phone.value.trim(),
        department: department.value,
        municipality: municipality.value.trim(),
        address: address.value.trim(),
        description: description.value.trim(),
        registeredAt: now
      },
      bankAccount: {
        bankName: bankName.value,
        accountType: accountType.value,
        accountNumber: accountNumber.value.trim(),
        ownerName: ownerName.value.trim()
      },
      updatedAt: now
    };

    await updateDoc(userRef, partnerPayload);

    // Update store state
    if (authStore.user) {
      authStore.user.role = 'mayorista';
    }

    toast.success('🎉 ¡Felicidades! Te has dado de alta como Socio Comercial exitosamente.');
    emit('saved');
    emit('close');
  } catch (error) {
    console.error('Error registering partner:', error);
    toast.error('Error al registrar como socio comercial');
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
          <div class="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-200">
            <font-awesome-icon icon="certificate" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-800 tracking-tight">Alta de Socio / Profesional Agrícola</h3>
            <p class="text-xs text-slate-500 font-medium">Registra tu empresa o perfil profesional para publicar insumos y vender comercialmente</p>
          </div>
        </div>

        <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <!-- Form Body -->
      <div class="space-y-6 text-xs">
        <!-- 1. Commercial Info -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <h4 class="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <font-awesome-icon icon="store" class="text-amber-500" /> Información Comercial
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-600 block mb-1">Nombre Comercial / Empresa / Agrónomo *</label>
              <input 
                v-model="businessName" 
                type="text" 
                placeholder="Ej. Insumos Agrícolas El Campo" 
                class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Tipo de Perfil / Especialidad *</label>
              <select v-model="partnerType" class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                <option v-for="t in partnerTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-600 block mb-1">Teléfono / WhatsApp *</label>
              <input 
                v-model="phone" 
                type="text" 
                placeholder="Ej. 50254317333" 
                class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
              />
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Departamento</label>
              <select v-model="department" class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Municipio / Zona</label>
              <input 
                v-model="municipality" 
                type="text" 
                placeholder="Ej. Sololá" 
                class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-600 block mb-1">Dirección Comercial Exacta</label>
            <input 
              v-model="address" 
              type="text" 
              placeholder="Ej. Calle Principal Zona 1, Sololá" 
              class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label class="font-bold text-slate-600 block mb-1">Descripción del Negocio / Servicios</label>
            <textarea 
              v-model="description" 
              rows="2" 
              placeholder="Ej. Venta al por mayor y menor de agroquímicos, semillas certificadas y asesoría en campo..." 
              class="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800"
            ></textarea>
          </div>
        </div>

        <!-- 2. Bank Account Info -->
        <div class="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
          <h4 class="font-black text-indigo-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <font-awesome-icon icon="university" class="text-indigo-600" /> Datos Bancarios para Depósitos de Ventas
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-600 block mb-1">Nombre del Banco</label>
              <select v-model="bankName" class="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-bold text-slate-800">
                <option value="Banrural">Banrural</option>
                <option value="Banco Industrial">Banco Industrial (BI)</option>
                <option value="G&T Continental">G&T Continental</option>
                <option value="BAM">BAM</option>
                <option value="Interbanco">Interbanco</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Tipo de Cuenta</label>
              <select v-model="accountType" class="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-bold text-slate-800">
                <option value="Ahorros">Cuenta de Ahorros</option>
                <option value="Monetaria">Cuenta Monetaria / Cheques</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Número de Cuenta</label>
              <input 
                v-model="accountNumber" 
                type="text" 
                placeholder="Ej. 3033049281" 
                class="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-bold text-slate-800"
              />
            </div>

            <div>
              <label class="font-bold text-slate-600 block mb-1">Nombre del Titular de la Cuenta</label>
              <input 
                v-model="ownerName" 
                type="text" 
                placeholder="Ej. Nombre Completo en el Banco" 
                class="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action Buttons -->
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
          class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-200 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <font-awesome-icon icon="check-circle" />
          {{ submitting ? 'Procesando...' : 'Confirmar Alta de Socio' }}
        </button>
      </div>
    </div>
  </div>
</template>
