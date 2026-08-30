<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useToast } from 'vue-toastification';
import { printThermalTicket } from '@/utils/thermalPrinter';

const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const toast = useToast();

const orderId = (route.query.orderId as string) || 'Desconocido';
const testimonialMessage = ref('');
const submitting = ref(false);
const submitted = ref(false);

const imprimirTicketConfirmado = () => {
  if (cartStore.lastOrder) {
    printThermalTicket(cartStore.lastOrder);
  } else {
    toast.info("Puedes ver e imprimir tu ticket en la sección Mis Pedidos.");
  }
};

const submitTestimonial = async () => {
  if (!testimonialMessage.value.trim() || submitting.value) return;

  submitting.value = true;
  try {
    await addDoc(collection(db, 'testimonials'), {
      author: authStore.user?.displayName || 'Cliente Satisfecho',
      message: testimonialMessage.value,
      orderId: orderId,
      userId: authStore.user?.uid,
      fecha: serverTimestamp(),
      approved: true // Por ahora los aprobamos automáticamente
    });
    
    submitted.value = true;
    toast.success('¡Gracias por tu comentario!');
    testimonialMessage.value = '';
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    toast.error('No se pudo enviar el testimonio');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto py-20 px-4 text-center space-y-10 animate-fade-in">
    <!-- Success Icon -->
    <div class="relative inline-block">
       <div class="absolute inset-0 bg-primary-100 blur-3xl rounded-full scale-150 animate-pulse"></div>
       <div class="relative w-32 h-32 bg-primary-600 rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 animate-bounce-slow">
          <font-awesome-icon icon="check-circle" class="text-6xl" />
       </div>
    </div>

    <!-- Text content -->
    <div class="space-y-4">
       <h1 class="text-5xl font-bold text-slate-800 font-outfit">¡Compra Exitosa!</h1>
       <p class="text-slate-400 font-medium max-w-sm mx-auto">Tu pedido ha sido recibido y está siendo procesado por nuestro equipo.</p>
    </div>

    <!-- Order Info Card -->
    <div class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm inline-block">
       <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número de Pedido</p>
       <h2 class="text-2xl font-bold text-primary-600 font-outfit">{{ orderId }}</h2>
    </div>

    <!-- Testimonial Section -->
    <div v-if="!submitted" class="bg-slate-50 p-8 rounded-[40px] border border-slate-200 shadow-inner max-w-lg mx-auto space-y-4 transform transition-all hover:scale-[1.02]">
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-slate-800">¿Cómo fue tu experiencia?</h3>
        <p class="text-sm text-slate-500">Tu opinión nos ayuda a mejorar y a que otros confíen en nosotros.</p>
      </div>
      
      <textarea 
        v-model="testimonialMessage" 
        class="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-white"
        placeholder="Escribe aquí tu recomendación..."
        rows="3"
      ></textarea>
      
      <button 
        @click="submitTestimonial" 
        :disabled="!testimonialMessage.trim() || submitting"
        class="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 active:scale-95"
      >
        <font-awesome-icon v-if="submitting" icon="spinner" spin class="mr-2" />
        {{ submitting ? 'Enviando...' : 'Enviar Testimonio' }}
      </button>
    </div>

    <div v-else class="bg-primary-50 p-8 rounded-[40px] border border-primary-100 max-w-lg mx-auto animate-bounce-slow">
       <font-awesome-icon icon="heart" class="text-primary-500 text-3xl mb-2" />
       <h3 class="text-xl font-bold text-primary-800">¡Gracias por tu recomendación!</h3>
       <p class="text-primary-600">Tu comentario aparecerá pronto en nuestra página de inicio.</p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
       <button @click="imprimirTicketConfirmado" class="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
          <i class="fas fa-receipt text-base"></i> Imprimir Ticket POS (80mm)
       </button>
       <router-link to="/purchase-history" class="btn-primary !px-8 !py-4 shadow-xl shadow-primary-500/20">
          Ver mi Historial
       </router-link>
       <router-link to="/" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">
          Volver al Inicio
       </router-link>
    </div>

    <p class="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] pt-10">
       Recibirás un correo de confirmación pronto.
    </p>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
</style>