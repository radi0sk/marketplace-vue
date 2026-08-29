<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getQuotes, convertQuoteToSale, deleteQuote } from '@/services/quoteService';
import type { Quote } from '@/types';
import QuoteModal from '@/components/quotes/QuoteModal.vue';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const toast = useToast();

const quotes = ref<Quote[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const isModalOpen = ref(false);
const processingQuoteId = ref<string | null>(null);

const fetchQuotesData = async () => {
  loading.value = true;
  try {
    quotes.value = await getQuotes();
  } catch (err) {
    console.error('Error loading quotes:', err);
    toast.error('Error al cargar cotizaciones');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchQuotesData);

const filteredQuotes = computed(() => {
  if (!searchQuery.value.trim()) return quotes.value;
  const term = searchQuery.value.toLowerCase();
  return quotes.value.filter(q => 
    q.quoteNumber.toLowerCase().includes(term) ||
    q.customerName.toLowerCase().includes(term)
  );
});

// Format WhatsApp message for a quote
const sendWhatsAppQuote = (q: Quote) => {
  let text = `🌱 *COTIZACIÓN DE INSUMOS AGRÍCOLAS* 🌱\n`;
  text += `📋 *No:* ${q.quoteNumber}\n`;
  text += `👤 *Cliente:* ${q.customerName}\n`;
  text += `📅 *Fecha:* ${new Date(q.createdAt || Date.now()).toLocaleDateString('es-GT')}\n`;
  text += `💳 *Forma de Pago:* ${q.paymentMethod === 'credito' ? 'Crédito' : q.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}\n\n`;
  
  text += `📦 *DETALLE DE PRODUCTOS:*\n`;
  q.items.forEach((item, idx) => {
    text += `${idx + 1}. *${item.name}* x${item.quantity} -> Q${item.subtotal.toFixed(2)}\n`;
  });

  if (q.discountAmount && q.discountAmount > 0) {
    text += `\n🏷️ *Descuento Aplicado (${q.discountPercent}%):* -Q${q.discountAmount.toFixed(2)}\n`;
  }

  text += `\n💰 *TOTAL COTIZADO:* *Q${q.total.toFixed(2)}*\n\n`;

  if (q.agronomicRecommendation) {
    text += `💡 *RECOMENDACIÓN TÉCNICA AGRONÓMICA:*\n${q.agronomicRecommendation}\n\n`;
  }

  text += `📍 Agro Guate - Soluciones para el Agricultor.`;

  const phone = q.customerPhone ? q.customerPhone.replace(/[^0-9]/g, '') : '';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

// Generate PDF Quote using jsPDF
const downloadPDF = (q: Quote) => {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(16, 185, 129); // Emerald color
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AGRO GUATE - COTIZACIÓN COMERCIAL', 14, 20);

    // Customer & Info section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Cotización No: ${q.quoteNumber}`, 14, 40);
    doc.text(`Fecha: ${new Date(q.createdAt || Date.now()).toLocaleDateString('es-GT')}`, 14, 46);
    doc.text(`Cliente: ${q.customerName}`, 14, 52);
    if (q.customerPhone) doc.text(`Teléfono: ${q.customerPhone}`, 14, 58);
    doc.text(`Condición de Pago: ${q.paymentMethod.toUpperCase()}`, 140, 40);

    // Table of products
    const tableBody = q.items.map(item => [
      item.name,
      `Q${item.price.toFixed(2)}`,
      item.quantity.toString(),
      `Q${item.subtotal.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Producto / Insumo', 'Precio Unitario', 'Cantidad', 'Subtotal']],
      body: tableBody,
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: Q${q.subtotal.toFixed(2)}`, 140, finalY);
    if (q.discountAmount && q.discountAmount > 0) {
      doc.text(`Descuento (${q.discountPercent}%): -Q${q.discountAmount.toFixed(2)}`, 140, finalY + 6);
    }
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`TOTAL: Q${q.total.toFixed(2)}`, 140, finalY + 14);

    // Recommendation if present
    if (q.agronomicRecommendation) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text('Recomendación Técnica Agronómica:', 14, finalY + 25);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(q.agronomicRecommendation, 180);
      doc.text(lines, 14, finalY + 31);
    }

    doc.save(`Cotizacion_${q.quoteNumber}.pdf`);
    toast.success('¡PDF de cotización descargado!');
  } catch (err) {
    console.error('PDF error:', err);
    toast.error('Error al generar PDF');
  }
};

// Convert Quote to Sale Order
const handleConvertToSale = async (q: Quote) => {
  if (!q.id) return;
  if (q.status === 'converted') {
    toast.info('Esta cotización ya fue convertida previamente');
    return;
  }

  if (!confirm(`¿Deseas convertir la cotización ${q.quoteNumber} en una VENTA OFICIAL?\nEsto descontará automáticamente el stock del inventario y registrará la orden.`)) {
    return;
  }

  processingQuoteId.value = q.id;
  try {
    const orderId = await convertQuoteToSale(q.id);
    toast.success(`🚀 ¡Venta Registrada Exitosamente! Pedido #${orderId}`);
    await fetchQuotesData();
  } catch (err: any) {
    console.error('Error converting quote:', err);
    toast.error(err.message || 'Error al convertir cotización');
  } finally {
    processingQuoteId.value = null;
  }
};

const handleDeleteQuote = async (id?: string) => {
  if (!id) return;
  if (confirm('¿Eliminar esta cotización?')) {
    try {
      await deleteQuote(id);
      toast.success('Cotización eliminada');
      await fetchQuotesData();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  }
};
</script>

<template>
  <div class="space-y-6 font-outfit p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200">
          <font-awesome-icon icon="file-invoice-dollar" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Módulo de Cotizaciones Rápidas</h2>
          <p class="text-xs text-slate-500 font-medium">Genera propuestas, envía por WhatsApp y convierte a ventas en 1 clic</p>
        </div>
      </div>

      <button 
        @click="isModalOpen = true" 
        class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <font-awesome-icon icon="plus" /> Nueva Cotización
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
      <font-awesome-icon icon="search" class="text-slate-400 text-sm ml-2" />
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Buscar por cliente o número de cotización..." 
        class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <font-awesome-icon icon="spinner" spin class="text-4xl text-emerald-600 mb-3" />
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando cotizaciones...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredQuotes.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto text-2xl">
        <font-awesome-icon icon="file-alt" />
      </div>
      <h3 class="text-base font-bold text-slate-700">No hay cotizaciones registradas</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">Crea tu primera cotización para clientes o agricultores haciendo clic en el botón superior.</p>
    </div>

    <!-- Quotes Grid/List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="q in filteredQuotes" 
        :key="q.id" 
        class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group"
      >
        <div class="space-y-4">
          <!-- Card Top Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {{ q.quoteNumber }}
              </span>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ new Date(q.createdAt || Date.now()).toLocaleDateString('es-GT') }}
              </p>
            </div>

            <!-- Status badge -->
            <span 
              :class="[
                'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                q.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                q.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              ]"
            >
              {{ q.status === 'converted' ? '✅ Convertida a Venta' : 'Enviada' }}
            </span>
          </div>

          <!-- Customer Info -->
          <div>
            <h4 class="text-base font-black text-slate-800 tracking-tight">{{ q.customerName }}</h4>
            <p v-if="q.customerPhone" class="text-xs text-slate-500 font-medium">📞 {{ q.customerPhone }}</p>
            <p class="text-xs font-bold text-slate-400 mt-1 uppercase">
              Pago: <span class="text-slate-700">{{ q.paymentMethod }}</span>
            </p>
          </div>

          <!-- Items list snippet -->
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items ({{ q.items.length }})</span>
            <ul class="text-xs font-medium text-slate-700 divide-y divide-slate-100 max-h-24 overflow-y-auto">
              <li v-for="(it, i) in q.items" :key="i" class="py-1 flex justify-between">
                <span class="truncate pr-2">{{ it.name }} (x{{ it.quantity }})</span>
                <span class="font-bold">Q{{ it.subtotal.toFixed(2) }}</span>
              </li>
            </ul>
          </div>

          <!-- Total price display -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs font-bold text-slate-400 uppercase">Monto Total:</span>
            <span class="text-xl font-black text-emerald-600">Q{{ q.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <!-- Convert to Sale Button -->
          <button 
            v-if="q.status !== 'converted'"
            @click="handleConvertToSale(q)" 
            :disabled="processingQuoteId === q.id"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <font-awesome-icon icon="check-circle" /> 
            {{ processingQuoteId === q.id ? 'Convertiendo...' : 'Convertir a Venta' }}
          </button>

          <div class="flex gap-2">
            <button 
              @click="sendWhatsAppQuote(q)" 
              class="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <font-awesome-icon :icon="['fab', 'whatsapp']" /> WhatsApp
            </button>

            <button 
              @click="downloadPDF(q)" 
              class="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <font-awesome-icon icon="file-pdf" /> PDF
            </button>

            <button 
              @click="handleDeleteQuote(q.id)" 
              class="bg-rose-50 text-rose-600 hover:bg-rose-100 p-2 rounded-xl text-xs transition-colors"
            >
              <font-awesome-icon icon="trash-alt" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Quote Modal Component -->
    <QuoteModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false" 
      @created="fetchQuotesData" 
    />
  </div>
</template>
