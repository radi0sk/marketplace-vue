<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { collection, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(true);
const stats = ref({
  totalSales: 0,
  pendingBalance: 0,
  totalOrders: 0,
  activeProducts: 0
});

const recentSales = ref<any[]>([]);
const pendingQuestions = ref<any[]>([]);
const answeringId = ref<string | null>(null);
const answerText = ref("");

const fetchPartnerData = async () => {
  if (!authStore.user) return;
  
  try {
    loading.value = true;
    
    // Fetch Sales...
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("vendorId", "==", authStore.user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    recentSales.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch Pending Questions
    const questionsRef = collection(db, "questions");
    const qQ = query(
      questionsRef,
      where("vendorId", "==", authStore.user.uid),
      where("answer", "==", null),
      orderBy("createdAt", "desc")
    );
    const questionsSnap = await getDocs(qQ);
    pendingQuestions.value = questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Stats...
  } catch (error) {
    // ...
  }
};

const submitAnswer = async (questionId: string) => {
  if (!answerText.value.trim()) return;
  try {
    await updateDoc(doc(db, "questions", questionId), {
      answer: answerText.value,
      answeredAt: new Date().toISOString()
    });
    toast.success("Respuesta enviada");
    answeringId.value = null;
    answerText.value = "";
    fetchPartnerData();
  } catch (e) {
    toast.error("Error al enviar respuesta");
  }
};

    // Calculate stats (Mocked if no real data)
    stats.value.totalOrders = recentSales.value.length;
    stats.value.totalSales = recentSales.value.reduce((acc, curr) => acc + (curr.total || 0), 0);
    stats.value.pendingBalance = stats.value.totalSales * 0.9; // Example: 90% for partner

    // Get active products
    const productsRef = collection(db, "products");
    const pq = query(productsRef, where("vendorId", "==", authStore.user.uid));
    const productsSnap = await getDocs(pq);
    stats.value.activeProducts = productsSnap.size;

  } catch (error) {
    console.error("Error fetching partner dashboard:", error);
    toast.error("Error al cargar datos del panel");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPartnerData);

const formatDate = (date: any) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString();
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-800 font-outfit">Panel de Socio</h1>
          <p class="text-slate-500 font-medium">Gestiona tus ventas y catálogo en Agro Guate</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <router-link to="/admin/products" class="px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold shadow-sm border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-2">
            <i class="fas fa-boxes text-primary-500"></i> Gestionar Inventario
          </router-link>
          <router-link to="/admin/products/add" class="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2">
            <i class="fas fa-plus"></i> Nuevo Producto
          </router-link>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <i class="fas fa-wallet text-xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Pendiente</p>
          <p class="text-2xl font-black text-slate-800 font-outfit">Q{{ stats.pendingBalance.toFixed(2) }}</p>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <i class="fas fa-chart-line text-xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</p>
          <p class="text-2xl font-black text-slate-800 font-outfit">Q{{ stats.totalSales.toFixed(2) }}</p>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <i class="fas fa-shopping-bag text-xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Pedidos</p>
          <p class="text-2xl font-black text-slate-800 font-outfit">{{ stats.totalOrders }}</p>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <i class="fas fa-box text-xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Productos Activos</p>
          <p class="text-2xl font-black text-slate-800 font-outfit">{{ stats.activeProducts }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Sales -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <i class="fas fa-history text-slate-400"></i> Ventas Recientes
            </h2>
            <!-- Table... -->
          </div>

          <!-- Pending Questions -->
          <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
             <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
               <i class="fas fa-question-circle text-primary-500"></i> Preguntas Pendientes
               <span v-if="pendingQuestions.length" class="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-lg">{{ pendingQuestions.length }}</span>
             </h2>

             <div v-if="pendingQuestions.length === 0" class="text-center py-10 text-slate-400 italic">
               No tienes preguntas pendientes por ahora.
             </div>

             <div v-else class="space-y-6">
                <div v-for="q in pendingQuestions" :key="q.id" class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">De: {{ q.userName }}</p>
                   <p class="text-sm font-bold text-slate-800 mb-4">{{ q.question }}</p>
                   
                   <div v-if="answeringId === q.id" class="space-y-3">
                      <textarea v-model="answerText" placeholder="Escribe tu respuesta..." class="w-full p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium h-24 transition-all"></textarea>
                      <div class="flex justify-end gap-2">
                         <button @click="answeringId = null" class="px-4 py-2 text-xs font-bold text-slate-400">Cancelar</button>
                         <button @click="submitAnswer(q.id)" class="px-6 py-2 bg-primary-600 text-white rounded-lg text-xs font-black shadow-lg shadow-primary-500/20">Enviar Respuesta</button>
                      </div>
                   </div>
                   <button v-else @click="answeringId = q.id" class="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-primary-600 hover:bg-primary-50 transition-all">
                     Responder Pregunta
                   </button>
                </div>
             </div>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="space-y-6">
          <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-500/20">
            <h3 class="text-xl font-bold mb-4">Información de Depósito</h3>
            <div v-if="authStore.user?.bankAccount" class="space-y-4">
              <div>
                <p class="text-primary-200 text-[10px] font-black uppercase tracking-widest">Banco</p>
                <p class="font-bold">{{ authStore.user.bankAccount.bankName }}</p>
              </div>
              <div>
                <p class="text-primary-200 text-[10px] font-black uppercase tracking-widest">Cuenta</p>
                <p class="font-bold">{{ authStore.user.bankAccount.accountNumber }}</p>
              </div>
              <router-link to="/profile" class="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-center text-sm font-bold border border-white/20 transition-all">
                Editar Datos
              </router-link>
            </div>
            <div v-else class="space-y-4">
              <p class="text-primary-100 text-sm">No has configurado una cuenta para recibir tus pagos.</p>
              <router-link to="/profile" class="block w-full py-3 bg-white text-primary-700 rounded-xl text-center text-sm font-bold shadow-lg transition-all">
                Configurar Ahora
              </router-link>
            </div>
          </div>

          <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Ayuda para Socios</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all text-sm font-medium">
                  <font-awesome-icon :icon="['fab', 'whatsapp']" class="text-emerald-500 text-lg" /> Soporte VIP Socios
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all text-sm font-medium">
                  <i class="fas fa-file-invoice text-amber-500 text-lg"></i> Guía de Comisiones
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
