<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { chatWithAgroAsesor } from '@/services/aiService';

const isOpen = ref(false);
const message = ref("");
const chatHistory = ref<{ role: string; parts: { text: string }[] }[]>([]);
const loading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && chatHistory.value.length === 0) {
    // Bienvenida inicial
    chatHistory.value.push({
      role: "model",
      parts: [{ text: "¡Qué tal, mucho gusto! Soy AgroAsesor de Agro Guate. ¿En qué le puedo ayudar hoy con su siembra o ganado? Cuénteme, ¿en qué parte de nuestra bella Guatemala se encuentra?" }]
    });
  }
};

const sendMessage = async () => {
  if (!message.value.trim() || loading.value) return;

  const userText = message.value;
  message.value = "";
  
  // Agregar mensaje del usuario a la historia
  chatHistory.value.push({
    role: "user",
    parts: [{ text: userText }]
  });

  loading.value = true;
  
  await scrollToBottom();

  const response = await chatWithAgroAsesor(userText, chatHistory.value.slice(1, -1));
  
  chatHistory.value.push({
    role: "model",
    parts: [{ text: response }]
  });

  loading.value = false;
  await scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const formatText = (text: string) => {
  // Simple formatting for bold, images and links
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full h-40 object-cover rounded-2xl my-3 border border-slate-100 shadow-sm">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="inline-block mt-1 text-primary-600 font-bold hover:underline bg-primary-50 px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider"><i class="fas fa-external-link-alt mr-1"></i> $1</a>')
    .replace(/\n/g, '<br>');
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] font-outfit">
    <!-- Bubble -->
    <button 
      @click="toggleChat"
      class="w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group relative"
    >
      <i v-if="!isOpen" class="fas fa-robot text-2xl animate-bounce"></i>
      <i v-else class="fas fa-times text-2xl"></i>
      
      <!-- Tooltip -->
      <span v-if="!isOpen" class="absolute right-20 bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        ¿Dudas con tu siembra? ¡Pregúntame!
      </span>
    </button>

    <!-- Chat Window -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col flex-grow">
        <!-- Header -->
        <div class="bg-primary-600 p-6 text-white flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <i class="fas fa-seedling text-xl"></i>
          </div>
          <div>
            <h3 class="font-black text-sm tracking-tight leading-none">AgroAsesor IA</h3>
            <p class="text-[10px] font-medium text-primary-200 mt-1 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              En línea • Experto Agrícola
            </p>
          </div>
        </div>

        <!-- Chat Body -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
          <div 
            v-for="(msg, i) in chatHistory" 
            :key="i"
            :class="[
              'flex gap-3 max-w-[85%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            ]"
          >
            <div 
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs shadow-sm',
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-primary-600 border border-slate-100'
              ]"
            >
              <i :class="msg.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div 
              :class="[
                'p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed',
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              ]"
              v-html="formatText(msg.parts[0].text)"
            ></div>
          </div>

          <div v-if="loading" class="flex gap-3 max-w-[85%] animate-pulse">
            <div class="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-primary-600">
               <i class="fas fa-robot text-xs"></i>
            </div>
            <div class="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none text-xs font-bold text-slate-400">
               Analizando catálogo y clima...
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 bg-white border-t border-slate-100">
          <form @submit.prevent="sendMessage" class="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <input 
              v-model="message"
              type="text" 
              placeholder="Escribe tu duda aquí..."
              class="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2"
            />
            <button 
              type="submit"
              :disabled="loading || !message.trim()"
              class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-all"
            >
              <i class="fas fa-paper-plane text-xs"></i>
            </button>
          </form>
          <p class="text-[8px] text-slate-400 text-center mt-2 font-bold uppercase tracking-widest">Impulsado por AgroAsesor AI • Guatemala</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Custom Scrollbar */
div::-webkit-scrollbar {
  width: 4px;
}
div::-webkit-scrollbar-track {
  background: transparent;
}
div::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
