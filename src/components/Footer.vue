<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-slate-900 text-white pt-20 pb-10 mt-20 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 right-0 w-1/3 h-full bg-primary-600/5 blur-[120px] rounded-full"></div>
    
    <div class="container mx-auto px-4 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        <!-- Brand Section -->
        <div class="space-y-6">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-transform duration-300">
              <font-awesome-icon icon="shopping-cart" class="text-white text-lg" />
            </div>
            <span class="text-xl font-bold tracking-tight text-white font-outfit uppercase">Agro <span class="text-primary-500">Guate</span></span>
          </router-link>
          <p class="text-slate-400 text-sm leading-relaxed max-w-xs">
            Conectando a los mejores productores con los consumidores más exigentes. Calidad, confianza y frescura en cada entrega.
          </p>
          <div class="flex items-center gap-4 text-slate-400">
             <a href="#" class="hover:text-primary-500 transition-colors"><font-awesome-icon :icon="['fab', 'facebook']" class="text-xl" /></a>
             <a href="#" class="hover:text-primary-500 transition-colors"><font-awesome-icon :icon="['fab', 'instagram']" class="text-xl" /></a>
             <a href="#" class="hover:text-primary-500 transition-colors"><font-awesome-icon :icon="['fab', 'twitter']" class="text-xl" /></a>
          </div>
        </div>

        <!-- Contact Links -->
        <div class="space-y-6">
          <h3 class="text-sm font-bold text-primary-500 uppercase tracking-widest">Contacto</h3>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <font-awesome-icon icon="envelope" class="text-slate-500 mt-1" />
              <div>
                <p class="text-xs text-slate-500 uppercase font-bold tracking-tighter">Email</p>
                <a href="mailto:pedrora3@gmail.com" class="text-sm hover:text-primary-500 transition-colors">pedrora3@gmail.com</a>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <font-awesome-icon icon="phone" class="text-slate-500 mt-1" />
              <div>
                <p class="text-xs text-slate-500 uppercase font-bold tracking-tighter">Teléfono</p>
                <p class="text-sm text-slate-200">+502 3846 5461</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Quick Links -->
        <div class="space-y-6">
          <h3 class="text-sm font-bold text-primary-500 uppercase tracking-widest">Plataforma</h3>
          <ul class="space-y-3">
            <li><router-link to="/" class="text-sm text-slate-400 hover:text-white transition-colors">Inicio</router-link></li>
            <li><router-link to="/products" class="text-sm text-slate-400 hover:text-white transition-colors">Nuestros Productos</router-link></li>
            <li><router-link to="/cart" class="text-sm text-slate-400 hover:text-white transition-colors">Carrito de Compras</router-link></li>
            <li><router-link to="/favorites" class="text-sm text-slate-400 hover:text-white transition-colors">Lista de Deseos</router-link></li>
          </ul>
        </div>

        <!-- Newsletter (UI Only) -->
        <div class="space-y-6">
           <h3 class="text-sm font-bold text-primary-500 uppercase tracking-widest">Suscríbete</h3>
           <p class="text-xs text-slate-400 italic">Recibe ofertas exclusivas y novedades agrícolas.</p>
           <div class="relative group">
              <input type="email" placeholder="EmailAddress" class="w-full bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary-500/20" />
              <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20">
                 <font-awesome-icon icon="paper-plane" />
              </button>
           </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          © {{ currentYear }} Agro Guate. Desarrollado con ❤️ para Guatemala.
        </p>
        <div class="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <a href="#" class="hover:text-white transition-colors">Privacidad</a>
          <a href="#" class="hover:text-white transition-colors">Términos</a>
          <a href="#" class="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>