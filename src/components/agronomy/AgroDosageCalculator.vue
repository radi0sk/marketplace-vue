<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import type { DosageCalculation, Product } from '@/types';

const props = defineProps<{
  selectedProduct?: Product | null;
  embedMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'attach', calculation: DosageCalculation & { formattedText: string }): void;
}>();

const toast = useToast();

const areaSize = ref<number>(1);
const areaUnit = ref<'mz' | 'ha' | 'cu'>('mz');
const dosePerUnit = ref<number>(props.selectedProduct?.dosis ? parseFloat(props.selectedProduct.dosis) || 2 : 2);
const doseUnit = ref<string>('Litros');
const sprayerCapacityLiters = ref<number>(16); // 16L o 20L
const waterVolumePerArea = ref<number>(200); // 200 Litros de agua por Manzana (10 bombas approx)

const unitLabels = {
  mz: 'Manzanas (mz)',
  ha: 'Hectáreas (ha)',
  cu: 'Cuerdas (cu)'
};

// Conversión de área a m2 para cálculos precisos
const areaInM2 = computed(() => {
  if (areaUnit.value === 'mz') return areaSize.value * 7000;
  if (areaUnit.value === 'ha') return areaSize.value * 10000;
  return areaSize.value * 437.5; // Cuerda promedio Guatemala
});

// Total de producto químico requerido
const totalAmountNeeded = computed(() => {
  return Number((areaSize.value * dosePerUnit.value).toFixed(2));
});

// Volumen total de agua de mezcla en Litros
const totalWaterLiters = computed(() => {
  return areaSize.value * waterVolumePerArea.value;
});

// Cantidad de bombadas de espalda (16L o 20L)
const totalSprayerPumps = computed(() => {
  if (!sprayerCapacityLiters.value) return 0;
  return Math.ceil(totalWaterLiters.value / sprayerCapacityLiters.value);
});

// Dosis exacta de producto por cada bomba (en ml o gramos)
const dosePerPumpMl = computed(() => {
  if (totalSprayerPumps.value === 0) return 0;
  // Convertir dosis a ml si es Litros o Kg
  let factor = 1000; // 1L = 1000ml, 1Kg = 1000g
  if (doseUnit.value === 'Copas' || doseUnit.value === 'Sacos') factor = 1;
  
  const totalMl = totalAmountNeeded.value * factor;
  return Number((totalMl / totalSprayerPumps.value).toFixed(1));
});

// Equivalente en copas agrónomas (1 copa agrónoma = 25 ml aprox)
const dosePerPumpCopas = computed(() => {
  return Number((dosePerPumpMl.value / 25).toFixed(1));
});

// Formato de texto estructurado para WhatsApp o Cotización
const formattedNotes = computed(() => {
  const prodName = props.selectedProduct ? props.selectedProduct.name : 'Tratamiento Agrícola';
  return `🌱 *RECOMENDACIÓN TÉCNICA DE DOSIS Y APLICACIÓN*
📦 *Producto:* ${prodName}
📐 *Superficie a tratar:* ${areaSize.value} ${unitLabels[areaUnit.value]}
🎯 *Dosis por ${areaUnit.value === 'mz' ? 'Manzana' : areaUnit.value === 'ha' ? 'Hectárea' : 'Cuerda'}:* ${dosePerUnit.value} ${doseUnit.value}
📊 *Cantidad Total de Producto:* ${totalAmountNeeded.value} ${doseUnit.value}

🎒 *GUÍA PARA BOMBA DE ESPALDA (${sprayerCapacityLiters.value} Litros):*
• *Total de Bombadas:* ~${totalSprayerPumps.value} bombas
• *Dosis por Bomba:* ${dosePerPumpMl.value} ml (aprox. ${dosePerPumpCopas.value} copas por bomba)
💡 *Nota de aplicación:* Calibrar el equipo de aplicación. Utilizar agua limpia con ph regulado y equipo de protección personal.`;
});

const copyNotes = () => {
  navigator.clipboard.writeText(formattedNotes.value);
  toast.success('¡Recomendación copiada al portapapeles!');
};

const shareWhatsApp = () => {
  const url = `https://wa.me/?text=${encodeURIComponent(formattedNotes.value)}`;
  window.open(url, '_blank');
};

const handleAttach = () => {
  const calculation: DosageCalculation & { formattedText: string } = {
    productId: props.selectedProduct?.id,
    productName: props.selectedProduct?.name,
    areaSize: areaSize.value,
    areaUnit: areaUnit.value,
    dosePerUnit: dosePerUnit.value,
    doseUnit: doseUnit.value,
    totalAmountNeeded: totalAmountNeeded.value,
    sprayerCapacityLiters: sprayerCapacityLiters.value,
    totalSprayerPumps: totalSprayerPumps.value,
    dosePerPump: dosePerPumpMl.value,
    applicationNotes: formattedNotes.value,
    formattedText: formattedNotes.value
  };
  emit('attach', calculation);
  toast.success('¡Cálculo de dosis adjuntado correctamente!');
};
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 font-outfit">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-lg">
          <font-awesome-icon icon="calculator" />
        </div>
        <div>
          <h3 class="text-base font-black text-slate-800 tracking-tight">Calculadora Agronómica de Dosis</h3>
          <p class="text-xs text-slate-500 font-medium">Calcula producto total y dosificación por bomba de espalda</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-wider">
        Agro Tool
      </span>
    </div>

    <!-- Main Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Area Size & Unit -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">1. Superficie del Terreno</label>
        <div class="flex gap-2">
          <input 
            v-model.number="areaSize" 
            type="number" 
            min="0.1" 
            step="0.5" 
            class="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
          <select 
            v-model="areaUnit" 
            class="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="mz">Manzanas (mz)</option>
            <option value="ha">Hectáreas (ha)</option>
            <option value="cu">Cuerdas (cu)</option>
          </select>
        </div>
      </div>

      <!-- Dose per Unit -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">2. Dosis por Unidad de Área</label>
        <div class="flex gap-2">
          <input 
            v-model.number="dosePerUnit" 
            type="number" 
            min="0.01" 
            step="0.25" 
            class="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
          <select 
            v-model="doseUnit" 
            class="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Litros">Litros / L</option>
            <option value="Kg">Kilogramos / Kg</option>
            <option value="Copas">Copas</option>
            <option value="Gramos">Gramos / g</option>
            <option value="Sacos">Sacos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Sprayer / Tank Parameters -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">3. Capacidad de Bomba de Espalda</label>
        <select 
          v-model.number="sprayerCapacityLiters" 
          class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
        >
          <option :value="16">16 Litros (Estándar)</option>
          <option :value="20">20 Litros (Grande)</option>
          <option :value="15">15 Litros</option>
          <option :value="200">200 Litros (Tonel / Tractor)</option>
        </select>
      </div>

      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">4. Volumen de Agua p/ Superficie</label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="waterVolumePerArea" 
            type="number" 
            min="10" 
            step="10" 
            class="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
          <span class="text-xs font-bold text-slate-400">L / {{ areaUnit }}</span>
        </div>
      </div>
    </div>

    <!-- Calculation Results Card -->
    <div class="mt-6 bg-emerald-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl pointer-events-none">
        🌱
      </div>

      <h4 class="text-xs font-black uppercase tracking-widest text-emerald-300 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="flask" /> Resultado Agronómico de Campo
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div class="bg-emerald-800/60 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50">
          <span class="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Producto Necesario</span>
          <span class="text-2xl font-black text-white mt-1 block">{{ totalAmountNeeded }} {{ doseUnit }}</span>
          <span class="text-[9px] text-emerald-300">para {{ areaSize }} {{ areaUnit }}</span>
        </div>

        <div class="bg-emerald-800/60 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50">
          <span class="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Bombadas de Espalda</span>
          <span class="text-2xl font-black text-white mt-1 block">~{{ totalSprayerPumps }} bombas</span>
          <span class="text-[9px] text-emerald-300">de {{ sprayerCapacityLiters }} Litros</span>
        </div>

        <div class="bg-emerald-800/60 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50">
          <span class="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Dosis p/ Bomba</span>
          <span class="text-2xl font-black text-amber-300 mt-1 block">{{ dosePerPumpMl }} ml</span>
          <span class="text-[9px] text-emerald-300">≈ {{ dosePerPumpCopas }} copas por bomba</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-emerald-800">
        <button 
          @click="copyNotes" 
          type="button"
          class="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <font-awesome-icon icon="copy" /> Copiar Texto
        </button>

        <button 
          @click="shareWhatsApp" 
          type="button"
          class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
        >
          <font-awesome-icon :icon="['fab', 'whatsapp']" /> Enviar por WhatsApp
        </button>

        <button 
          v-if="embedMode"
          @click="handleAttach" 
          type="button"
          class="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg"
        >
          <font-awesome-icon icon="check-circle" /> Adjuntar a Cotización
        </button>
      </div>
    </div>
  </div>
</template>
