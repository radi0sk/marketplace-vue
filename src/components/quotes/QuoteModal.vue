<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Customer, Product, QuoteItem, DosageCalculation } from '@/types';
import AgroDosageCalculator from '@/components/agronomy/AgroDosageCalculator.vue';
import { addQuote } from '@/services/quoteService';
import { getCustomers } from '@/services/crmService';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', quoteId: string): void;
}>();

const toast = useToast();

const customers = ref<Customer[]>([]);
const products = ref<Product[]>([]);
const loadingData = ref(true);
const submitting = ref(false);

const selectedCustomerId = ref<string>('');
const customerName = ref<string>('');
const customerPhone = ref<string>('');

const items = ref<QuoteItem[]>([]);
const paymentMethod = ref<'efectivo' | 'transferencia' | 'credito'>('efectivo');
const discountPercent = ref<number>(0);
const agronomicRecommendation = ref<string>('');
const attachedDosage = ref<DosageCalculation | null>(null);

const showDosageModal = ref<boolean>(false);

// Product selection helper
const selectedProductToAdd = ref<string>('');
const productQuantityToAdd = ref<number>(1);

onMounted(async () => {
  try {
    const [custData, prodSnap] = await Promise.all([
      getCustomers(),
      getDocs(collection(db, 'products'))
    ]);
    customers.value = custData;
    products.value = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (err) {
    console.error('Error loading quote modal data:', err);
  } finally {
    loadingData.value = false;
  }
});

const onCustomerChange = () => {
  if (selectedCustomerId.value) {
    const cust = customers.value.find(c => c.id === selectedCustomerId.value);
    if (cust) {
      customerName.value = cust.name;
      customerPhone.value = cust.phone;
    }
  }
};

const addProductToItems = () => {
  if (!selectedProductToAdd.value) return;
  const prod = products.value.find(p => p.id === selectedProductToAdd.value);
  if (!prod) return;

  const existingIndex = items.value.findIndex(i => i.productId === prod.id);
  const itemPrice = paymentMethod.value === 'efectivo' && prod.cashPrice ? prod.cashPrice : prod.price;

  if (existingIndex >= 0) {
    items.value[existingIndex].quantity += productQuantityToAdd.value;
    items.value[existingIndex].subtotal = items.value[existingIndex].quantity * items.value[existingIndex].price;
  } else {
    items.value.push({
      productId: prod.id,
      name: prod.name,
      price: itemPrice,
      originalPrice: prod.price,
      quantity: productQuantityToAdd.value,
      discountPercent: 0,
      subtotal: itemPrice * productQuantityToAdd.value,
      dosageInfo: prod.dosis || ''
    });
  }

  selectedProductToAdd.value = '';
  productQuantityToAdd.value = 1;
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const updateItemQuantity = (index: number, newQty: number) => {
  if (newQty <= 0) {
    removeItem(index);
    return;
  }
  items.value[index].quantity = newQty;
  items.value[index].subtotal = items.value[index].quantity * items.value[index].price;
};

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + item.subtotal, 0);
});

const discountAmount = computed(() => {
  if (!discountPercent.value) return 0;
  return Number(((subtotal.value * discountPercent.value) / 100).toFixed(2));
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discountAmount.value);
});

const handleAttachDosage = (calc: DosageCalculation & { formattedText: string }) => {
  attachedDosage.value = calc;
  agronomicRecommendation.value = calc.formattedText;
  showDosageModal.value = false;
};

const handleSubmit = async () => {
  if (!customerName.value.trim()) {
    toast.error('Ingresa el nombre del cliente');
    return;
  }
  if (items.value.length === 0) {
    toast.error('Agrega al menos un producto a la cotización');
    return;
  }

  submitting.value = true;
  try {
    const newQuoteId = await addQuote({
      customerId: selectedCustomerId.value || undefined,
      customerName: customerName.value.trim(),
      customerPhone: customerPhone.value.trim(),
      items: items.value,
      subtotal: subtotal.value,
      discountPercent: discountPercent.value,
      discountAmount: discountAmount.value,
      total: total.value,
      paymentMethod: paymentMethod.value,
      agronomicRecommendation: agronomicRecommendation.value || undefined,
      dosageCalculation: attachedDosage.value || undefined,
      status: 'sent',
      createdByName: 'Asesor Agrícola'
    });

    toast.success('¡Cotización creada exitosamente!');
    emit('created', newQuoteId);
    emit('close');
  } catch (error) {
    console.error('Error saving quote:', error);
    toast.error('Error al guardar la cotización');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-outfit">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-8">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-200">
            <font-awesome-icon icon="file-invoice-dollar" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-800 tracking-tight">Nueva Cotización Comercial Agrícola</h3>
            <p class="text-xs text-slate-500 font-medium">Genera una propuesta formal para agricultores y clientes de campo</p>
          </div>
        </div>

        <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <!-- Main Form -->
      <div class="space-y-6">
        <!-- 1. Customer Selection -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Cliente CRM Agrícola</label>
            <select 
              v-model="selectedCustomerId" 
              @change="onCustomerChange"
              class="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Cliente Manual / Nuevo --</option>
              <option v-for="c in customers" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.fincaName || 'Sin Finca' }})
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Nombre del Cliente *</label>
            <input 
              v-model="customerName" 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              class="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Teléfono / WhatsApp</label>
            <input 
              v-model="customerPhone" 
              type="text" 
              placeholder="Ej. 54317333" 
              class="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- 2. Product Picker -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">Agregar Productos a la Cotización</label>
          
          <div class="flex flex-col sm:flex-row gap-2">
            <select 
              v-model="selectedProductToAdd" 
              class="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Selecciona un Insumo / Producto --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }} - Q{{ p.cashPrice || p.price }} (Stock: {{ p.stock }})
              </option>
            </select>

            <input 
              v-model.number="productQuantityToAdd" 
              type="number" 
              min="1" 
              class="w-20 bg-white border border-slate-200 rounded-xl p-2 text-center text-xs font-bold text-slate-800" 
            />

            <button 
              @click="addProductToItems" 
              type="button" 
              class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              + Agregar
            </button>
          </div>

          <!-- Items Table -->
          <div v-if="items.length > 0" class="overflow-x-auto mt-3 border border-slate-200 rounded-xl bg-white">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th class="p-3">Producto</th>
                  <th class="p-3">Precio U.</th>
                  <th class="p-3">Cant.</th>
                  <th class="p-3">Subtotal</th>
                  <th class="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, idx) in items" :key="idx" class="hover:bg-slate-50">
                  <td class="p-3 font-bold text-slate-800">
                    {{ item.name }}
                    <span v-if="item.dosageInfo" class="block text-[9px] font-normal text-emerald-600">Dosis: {{ item.dosageInfo }}</span>
                  </td>
                  <td class="p-3 font-bold">Q{{ item.price }}</td>
                  <td class="p-3">
                    <input 
                      type="number" 
                      min="1" 
                      :value="item.quantity" 
                      @input="updateItemQuantity(idx, Number(($event.target as HTMLInputElement).value))"
                      class="w-16 border border-slate-200 rounded-lg p-1 text-center font-bold"
                    />
                  </td>
                  <td class="p-3 font-black text-emerald-700">Q{{ item.subtotal.toFixed(2) }}</td>
                  <td class="p-3 text-center">
                    <button @click="removeItem(idx)" class="text-rose-500 hover:text-rose-700 p-1">
                      <font-awesome-icon icon="trash-alt" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Agronomic Calculator & Recommendations -->
        <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <font-awesome-icon icon="calculator" /> Recomendación Agronómica y Dosis por Superficie
            </label>

            <button 
              @click="showDosageModal = true" 
              type="button" 
              class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Abri Calculadora de Dosis
            </button>
          </div>

          <textarea 
            v-model="agronomicRecommendation" 
            rows="3" 
            placeholder="Escribe la recomendación de aplicación técnico-agronómica o genera el cálculo con el botón arriba..." 
            class="w-full bg-white border border-emerald-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        <!-- 4. Payment Terms & Discount Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Condición de Pago</label>
            <select 
              v-model="paymentMethod" 
              class="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="efectivo">Efectivo / Al Contado</option>
              <option value="transferencia">Transferencia / Depósito</option>
              <option value="credito">Crédito (Registra Deuda al Cliente)</option>
            </select>

            <div class="mt-3">
              <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Descuento Global (%)</label>
              <input 
                v-model.number="discountPercent" 
                type="number" 
                min="0" 
                max="100" 
                class="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800" 
              />
            </div>
          </div>

          <!-- Total Breakdown -->
          <div class="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-between">
            <div class="space-y-1 text-xs">
              <div class="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>Q{{ subtotal.toFixed(2) }}</span>
              </div>
              <div v-if="discountAmount > 0" class="flex justify-between text-emerald-400">
                <span>Descuento ({{ discountPercent }}%):</span>
                <span>-Q{{ discountAmount.toFixed(2) }}</span>
              </div>
            </div>

            <div class="border-t border-slate-800 pt-2 mt-2 flex justify-between items-end">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Total Propuesta:</span>
              <span class="text-2xl font-black text-emerald-400">Q{{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
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
          :disabled="submitting || items.length === 0" 
          type="button" 
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
        >
          {{ submitting ? 'Guardando...' : 'Crear Cotización' }}
        </button>
      </div>
    </div>

    <!-- Nested Dosage Calculator Modal -->
    <div v-if="showDosageModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div class="max-w-2xl w-full">
        <div class="flex justify-end mb-2">
          <button @click="showDosageModal = false" class="bg-white text-slate-800 font-bold px-3 py-1 rounded-full text-xs">Cerrar ✕</button>
        </div>
        <AgroDosageCalculator embedMode @attach="handleAttachDosage" />
      </div>
    </div>
  </div>
</template>
