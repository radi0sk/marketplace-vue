<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const orderId = route.query.orderId || 'Desconocido';
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

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
       <router-link to="/purchase-history" class="btn-primary !px-10 !py-4 shadow-xl shadow-primary-500/20">
          Ver mi Historial
       </router-link>
       <router-link to="/" class="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">
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