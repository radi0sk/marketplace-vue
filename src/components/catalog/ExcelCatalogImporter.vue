<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'vue-toastification';
import type { Category } from '@/types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'imported'): void;
}>();

const toast = useToast();
const authStore = useAuthStore();

const categories = ref<Category[]>([]);
const isDragging = ref(false);
const isUploading = ref(false);
const fileName = ref('');
const parsedProducts = ref<any[]>([]);

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
  } catch (e) {
    console.error('Error fetching categories for excel importer:', e);
  }
});

// Download sample Excel template
const downloadTemplate = () => {
  const sampleData = [
    {
      "Nombre del Producto": "Fertilizante Foliares NPK 20-20-20 (1 Kg)",
      "Categoría": "Fertilizantes",
      "Precio Normal (Q)": 150,
      "Precio Efectivo / Oferta (Q)": 135,
      "Precio Mayorista (Q)": 120,
      "Stock / Inventario": 50,
      "SKU / Código": "FER-NPK-01",
      "Marca": "Yara",
      "Ingrediente Activo": "Nitrógeno-Fósforo-Potasio",
      "Dosis": "2.5 Kg/mz",
      "Descripción": "Fertilizante multielemento 100% soluble para aplicaciones foliares en hortalizas y frutales."
    },
    {
      "Nombre del Producto": "Fungicida Mancozeb 80 WP (1 Kg)",
      "Categoría": "Insumos",
      "Precio Normal (Q)": 220,
      "Precio Efectivo / Oferta (Q)": 200,
      "Precio Mayorista (Q)": 180,
      "Stock / Inventario": 30,
      "SKU / Código": "FUN-MAN-80",
      "Marca": "Syngenta",
      "Ingrediente Activo": "Mancozeb 80%",
      "Dosis": "1.5 Kg/mz",
      "Descripción": "Fungicida de amplio espectro preventivo y curativo."
    },
    {
      "Nombre del Producto": "Bomba de Espalda Agrícola 16 Litros",
      "Categoría": "Maquinaria",
      "Precio Normal (Q)": 450,
      "Precio Efectivo / Oferta (Q)": 400,
      "Precio Mayorista (Q)": 375,
      "Stock / Inventario": 15,
      "SKU / Código": "BOM-ESP-16",
      "Marca": "Jacto",
      "Ingrediente Activo": "N/A",
      "Dosis": "N/A",
      "Descripción": "Bomba de mochila manual con lanza de latón y boquillas regulables."
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for clarity
  worksheet['!cols'] = [
    { wch: 40 }, // Nombre
    { wch: 18 }, // Categoría
    { wch: 18 }, // Precio Normal
    { wch: 24 }, // Precio Efectivo
    { wch: 20 }, // Precio Mayorista
    { wch: 18 }, // Stock
    { wch: 15 }, // SKU
    { wch: 15 }, // Marca
    { wch: 25 }, // Ingrediente Activo
    { wch: 15 }, // Dosis
    { wch: 45 }  // Descripción
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Productos');
  XLSX.writeFile(workbook, 'Plantilla_Catalogo_AgroGuate.xlsx');
  toast.success('¡Plantilla Excel descargada exitosamente!');
};

// Process Excel / CSV File
const processFile = (file: File) => {
  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (rawRows.length === 0) {
        toast.error('El archivo Excel no contiene datos o filas válidas');
        return;
      }

      parsedProducts.value = rawRows.map((row, index) => {
        // Flexible key matching
        const name = row['Nombre del Producto'] || row['Nombre'] || row['name'] || row['Producto'] || '';
        const categoryName = row['Categoría'] || row['Categoria'] || row['category'] || '';
        const price = Number(row['Precio Normal (Q)'] || row['Precio Normal'] || row['price'] || row['Precio']) || 0;
        const cashPrice = Number(row['Precio Efectivo / Oferta (Q)'] || row['Precio Efectivo'] || row['cashPrice'] || row['Precio Oferta']) || price;
        const wholesalePrice = Number(row['Precio Mayorista (Q)'] || row['Precio Mayorista'] || row['wholesalePrice']) || cashPrice;
        const stock = Number(row['Stock / Inventario'] || row['Stock'] || row['stock'] || row['Cantidad']) || 10;
        const sku = row['SKU / Código'] || row['SKU'] || row['sku'] || `SKU-${Date.now().toString().slice(-4)}-${index + 1}`;
        const brand = row['Marca'] || row['brand'] || 'Genérica';
        const ingredienteActivo = row['Ingrediente Activo'] || row['ingredienteActivo'] || '';
        const dosis = row['Dosis'] || row['dosis'] || '';
        const description = row['Descripción'] || row['Descripcion'] || row['description'] || name;

        // Match category ID
        const matchedCategory = categories.value.find(c => c.name.toLowerCase() === String(categoryName).toLowerCase().trim());
        const categoriaId = matchedCategory ? matchedCategory.id : (categories.value[0]?.id || 'Insumos');

        const isValid = Boolean(name.trim()) && price > 0;

        return {
          idRow: index,
          name: String(name).trim(),
          categoria: categoriaId,
          categoryName: matchedCategory ? matchedCategory.name : categoryName || 'General',
          price,
          cashPrice,
          wholesalePrice,
          stock,
          sku: String(sku).trim(),
          brand: String(brand).trim(),
          ingredienteActivo: String(ingredienteActivo).trim(),
          dosis: String(dosis).trim(),
          description: String(description).trim(),
          isValid
        };
      });

      toast.info(`Se leyeron ${parsedProducts.value.length} productos del archivo`);
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      toast.error('Error al leer el archivo Excel/CSV. Verifica el formato.');
    }
  };

  reader.readAsArrayBuffer(file);
};

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    processFile(input.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
};

const removeRow = (index: number) => {
  parsedProducts.value.splice(index, 1);
};

const validProductsCount = computed(() => {
  return parsedProducts.value.filter(p => p.isValid).length;
});

// Import valid products into Firestore `products` collection
const importProductsToFirestore = async () => {
  const validItems = parsedProducts.value.filter(p => p.isValid);
  if (validItems.length === 0) {
    toast.error('No hay productos válidos para importar');
    return;
  }

  isUploading.value = true;
  try {
    const productsRef = collection(db, 'products');
    const now = new Date().toISOString();
    const vendorId = authStore.user?.uid || 'vendor-anon';
    const vendorName = authStore.user?.displayName || 'Socio Comercial';

    let successCount = 0;

    for (const item of validItems) {
      const payload = {
        name: item.name,
        categoria: item.categoria,
        price: item.price,
        cashPrice: item.cashPrice,
        wholesalePrice: item.wholesalePrice,
        wholesaleMin: 5,
        stock: item.stock,
        sku: item.sku,
        brand: item.brand,
        ingredienteActivo: item.ingredienteActivo || undefined,
        dosis: item.dosis || undefined,
        description: item.description,
        availability: item.stock > 0 ? 'in_stock' : 'out_of_stock',
        status: 'active',
        images: ['https://res.cloudinary.com/dsfnladar/image/upload/v1747952265/rjxxxisdbfnon9cj7udt.jpg'],
        mainImage: 'https://res.cloudinary.com/dsfnladar/image/upload/v1747952265/rjxxxisdbfnon9cj7udt.jpg',
        createdBy: vendorId,
        vendorId,
        vendorName,
        createdAt: now,
        updatedAt: now
      };

      await addDoc(productsRef, payload);
      successCount++;
    }

    toast.success(`🎉 ¡Importación completada! Se agregaron ${successCount} productos a tu catálogo.`);
    parsedProducts.value = [];
    fileName.value = '';
    emit('imported');
    emit('close');
  } catch (err) {
    console.error('Error bulk uploading products:', err);
    toast.error('Error al guardar productos en la base de datos');
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-outfit">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-8">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-200">
            <font-awesome-icon icon="file-excel" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-800 tracking-tight">Carga Masiva de Productos desde Excel</h3>
            <p class="text-xs text-slate-500 font-medium">Descarga la plantilla, completa tu inventario y súbelo en segundos a Firestore</p>
          </div>
        </div>

        <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <!-- Step 1: Download Template Button -->
      <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div>
            <h4 class="text-xs font-black uppercase text-emerald-900 tracking-wider">Paso 1: Descarga la Plantilla Oficial</h4>
            <p class="text-[11px] text-emerald-700 font-medium">Formateada con columnas para precios en Quetzales, marcas, ingredientes activos y dosis.</p>
          </div>
        </div>

        <button 
          @click="downloadTemplate" 
          type="button" 
          class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <font-awesome-icon icon="cloud-download-alt" /> Descargar Plantilla Excel (.xlsx)
        </button>
      </div>

      <!-- Step 2: Upload Excel File Dropzone -->
      <div 
        @dragover.prevent="isDragging = true" 
        @dragleave.prevent="isDragging = false" 
        @drop.prevent="handleDrop"
        :class="[
          'p-8 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer relative',
          isDragging ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
        ]"
      >
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          @change="handleFileInput" 
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        <div class="space-y-2 pointer-events-none">
          <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-md mx-auto">
            <font-awesome-icon icon="cloud-upload-alt" />
          </div>
          <h4 class="text-sm font-black text-slate-700">
            {{ fileName ? `Archivo cargado: ${fileName}` : 'Paso 2: Arrastra o selecciona tu archivo Excel (.xlsx o .csv)' }}
          </h4>
          <p class="text-xs text-slate-400">Soporta archivos Excel Microsoft (.xlsx, .xls) o CSV con delimitadores por coma</p>
        </div>
      </div>

      <!-- Step 3: Parsed Products Preview Table -->
      <div v-if="parsedProducts.length > 0" class="mt-6 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
            <font-awesome-icon icon="table" class="text-emerald-600" /> Vista Previa ({{ validProductsCount }} válidos de {{ parsedProducts.length }})
          </h4>
          <button @click="parsedProducts = []; fileName = ''" class="text-xs font-bold text-rose-500 hover:underline">
            Limpiar Archivo
          </button>
        </div>

        <div class="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl bg-white text-xs">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider sticky top-0">
              <tr>
                <th class="p-3">Estado</th>
                <th class="p-3">Producto</th>
                <th class="p-3">Categoría</th>
                <th class="p-3">Precio (Q)</th>
                <th class="p-3">Stock</th>
                <th class="p-3">SKU</th>
                <th class="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-for="(p, idx) in parsedProducts" :key="idx" :class="[!p.isValid ? 'bg-rose-50/70' : 'hover:bg-slate-50']">
                <td class="p-3">
                  <span v-if="p.isValid" class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full">
                    ✅ Válido
                  </span>
                  <span v-else class="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded-full">
                    ⚠️ Incompleto
                  </span>
                </td>
                <td class="p-3 font-bold text-slate-800 truncate max-w-xs">{{ p.name || 'Sin nombre' }}</td>
                <td class="p-3">{{ p.categoryName }}</td>
                <td class="p-3 font-black text-emerald-700">Q{{ p.price }}</td>
                <td class="p-3 font-bold">{{ p.stock }}</td>
                <td class="p-3 font-mono text-[10px]">{{ p.sku }}</td>
                <td class="p-3 text-center">
                  <button @click="removeRow(idx)" class="text-rose-500 hover:text-rose-700 p-1">
                    <font-awesome-icon icon="trash-alt" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          @click="$emit('close')" 
          type="button" 
          class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancelar
        </button>

        <button 
          @click="importProductsToFirestore" 
          :disabled="isUploading || validProductsCount === 0" 
          type="button" 
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <font-awesome-icon icon="upload" />
          {{ isUploading ? 'Importando a Firestore...' : `Importar ${validProductsCount} Productos` }}
        </button>
      </div>
    </div>
  </div>
</template>
