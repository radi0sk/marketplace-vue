<template>
  <header class="agro-header">
    <div class="header-container">
      <!-- Logo y marca -->
      <div class="brand-section">
        <router-link to="/" class="brand-link">
          <img src="@/assets/logo.png" alt="AgroMarket" class="brand-logo">
          <span class="brand-name">AgroMarket</span>
        </router-link>
      </div>

      <!-- Buscador con dropdown -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar productos..." 
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @keyup.enter="performSearch"
            class="search-input"
            ref="searchInput"
          />
          <button @click="performSearch" class="search-button">
            <font-awesome-icon :icon="['fas', 'search']" />
          </button>
        </div>
        
        <!-- Dropdown de resultados -->
        <div 
          v-show="showResults && searchResults.length > 0" 
          class="search-results-dropdown"
          @mousedown.prevent
        >
          <div 
            v-for="product in searchResults" 
            :key="product.id" 
            class="search-result-item"
            @click="goToProduct(product)"
          >
            <img 
              :src="product.images?.[0] || require('@/assets/producto.png')" 
              :alt="product.name"
              class="result-image"
            />
            <div class="result-info">
              <h4>{{ product.name }}</h4>
              <p class="result-price">${{ product.price }}</p>
            </div>
          </div>
          <div class="search-footer" @click="viewAllResults">
            Ver todos los resultados para "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <!-- Navegación principal -->
      <nav class="main-nav">
        <router-link to="/products" class="nav-link">
          <i class="fas fa-seedling"></i>
          <span>Productos</span>
        </router-link>

        <template v-if="!userRole || userRole === 'cliente'">
          <router-link to="/cart" class="nav-link cart-link">
            <font-awesome-icon 
              :icon="['fas', 'shopping-cart']" 
              :class="{ 'has-items': cartItemCount > 0 }" 
            />
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </router-link>
        </template>
      </nav>

      <!-- Panel de usuario -->
      <div class="user-section">
        <template v-if="!user">
          <router-link to="/login" class="auth-link login-link">
            <i class="fas fa-sign-in-alt"></i>
            <span>Ingresar</span>
          </router-link>
        </template>

        <template v-else>
          <div class="user-panel" @click="toggleDropdown">
            <img :src="user.photoURL || require('@/assets/usuario.png')" 
                 alt="Usuario" 
                 class="user-avatar">
            <span class="user-name">{{ user.displayName || 'Mi Cuenta' }}</span>
            <i class="fas fa-caret-down"></i>
            
            <div v-if="showDropdown" class="dropdown-menu">
              <template v-if="userRole === 'cliente'">
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user"></i> Mi Perfil
                </router-link>
                <router-link to="/purchase-history" class="dropdown-item">
                  <i class="fas fa-user"></i> Mis pedidos 
                </router-link>
                <router-link to="/favorites" class="dropdown-item">
                  <i class="fas fa-heart"></i> Favoritos
                </router-link>
              </template>
              
              <template v-if="userRole === 'admin'">
                <router-link to="/cart" class="dropdown-item">
                  <i class="fas fa-user" :class="{ 'has-items': cartItemCount > 0 }"></i> carito
                </router-link>
               <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user"></i> Mi Perfil
                </router-link>
                <router-link to="/favorites" class="dropdown-item">
                  <i class="fas fa-heart"></i> Favoritos
                </router-link>
                <router-link to="/purchase-history" class="dropdown-item">
                  <i class="fas fa-user"></i> Mis pedidos 
                </router-link>
                <router-link to="/admin/products" class="dropdown-item">
                  <i class="fas fa-boxes"></i> Productos
                </router-link>
                  <router-link to="/admin/orders" class="dropdown-item">
                  <i class="fas fa-clipboard-list"></i> Pedidos
                </router-link>
                <router-link to="/admin/sales-statistics" class="dropdown-item">
                  <i class="fas fa-chart-line"></i> Estadísticas
                </router-link>
              
              </template>
              
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item logout-item">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import { auth, db } from '@/services/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { mapGetters } from 'vuex'

export default {
  name: 'AppHeader',
  data() {
    return {
      user: null,
      userRole: null,
      showDropdown: false,
      searchQuery: '',
      searchResults: [],
      showResults: false,
      searchTimeout: null,
      // Configuración de búsqueda
      searchConfig: {
        debounceTime: 300, // Tiempo de espera en ms (cambia aquí)
        minSearchLength: 2, // Mínimo de caracteres para buscar
        maxResults: 5, // Máximo de resultados a mostrar
        searchFields: ['name', 'description', 'category'] // Campos donde buscar
      }
    }
  },
  computed: {
    ...mapGetters(['cartItemCount'])
  },
  created() {
    auth.onAuthStateChanged(async (user) => {
      this.user = user
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          this.userRole = userDoc.exists() ? userDoc.data().role : 'cliente'
        } catch (error) {
          console.error('Error obteniendo rol del usuario:', error)
          this.userRole = 'cliente'
        }
      } else {
        this.userRole = null
      }
    })
  },
  methods: {
    // Método principal para manejar la entrada de texto
    handleSearchInput() {
      console.log('🔍 Texto ingresado:', this.searchQuery, '- Longitud:', this.searchQuery.length)
      
      // Limpiar el timeout anterior si existe
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
        console.log('⏰ Timeout anterior cancelado')
      }
      
      // Si el query está vacío, limpiar resultados
      if (!this.searchQuery.trim()) {
        this.searchResults = []
        this.showResults = false
        console.log('🧹 Query vacío - resultados limpiados')
        return
      }
      
      // Si el query es muy corto, no buscar aún
      if (this.searchQuery.trim().length < this.searchConfig.minSearchLength) {
        this.searchResults = []
        this.showResults = false
        console.log(`📏 Query muy corto (min: ${this.searchConfig.minSearchLength}) - no se busca`)
        return
      }
      
      // Establecer un nuevo timeout para la búsqueda
      console.log(`⏱️ Iniciando timeout de ${this.searchConfig.debounceTime}ms`)
      this.searchTimeout = setTimeout(() => {
        console.log('🚀 Ejecutando búsqueda después del timeout')
        this.searchProducts()
      }, this.searchConfig.debounceTime)
    },
    
    handleSearchFocus() {
      console.log('Input enfocado')
      if (this.searchResults.length > 0 && this.searchQuery.trim()) {
        this.showResults = true
      }
    },
    
    handleSearchBlur( ) {
      console.log('Input desenfocado')
      // Pequeño retraso para permitir hacer clic en los resultados
      setTimeout(() => {
        this.showResults = false
      }, 200)
    },
    
    async searchProducts() {
      console.log('🔎 Iniciando búsqueda de productos con query:', this.searchQuery)
      
      if (!this.searchQuery.trim() || this.searchQuery.trim().length < this.searchConfig.minSearchLength) {
        this.searchResults = []
        this.showResults = false
        return
      }
      
      try {
        const productsRef = collection(db, "products")
        const searchTerm = this.searchQuery.toLowerCase().trim()
        console.log('🎯 Término de búsqueda procesado:', searchTerm)
        
        // Búsqueda en múltiples campos
        let allResults = []
        
        // 1. Búsqueda en nombre (más relevante)
        console.log('📝 Buscando en campo: name')
        const nameQuery = query(
          productsRef,
          where("name", ">=", searchTerm),
          where("name", "<=", searchTerm + "\uf8ff"),
          limit(10)
        )
        
        const nameSnapshot = await getDocs(nameQuery)
        nameSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.name && data.name.toLowerCase().includes(searchTerm)) {
            allResults.push({
              id: doc.id,
              ...data,
              relevance: 3 // Mayor relevancia para nombre
            })
          }
        })
        
        // 2. Si tienes campo 'category', buscar ahí también
        if (this.searchConfig.searchFields.includes('category')) {
          console.log('🏷️ Buscando en campo: category')
          const categoryQuery = query(
            productsRef,
            where("category", ">=", searchTerm),
            where("category", "<=", searchTerm + "\uf8ff"),
            limit(10)
          )
          
          const categorySnapshot = await getDocs(categoryQuery)
          categorySnapshot.docs.forEach(doc => {
            const data = doc.data()
            // Evitar duplicados
            if (!allResults.find(r => r.id === doc.id) && 
                data.category && data.category.toLowerCase().includes(searchTerm)) {
              allResults.push({
                id: doc.id,
                ...data,
                relevance: 2 // Menor relevancia para categoría
              })
            }
          })
        }
        
        // 3. Búsqueda amplia si no hay suficientes resultados
        if (allResults.length < 3) {
          console.log('🔍 Búsqueda amplia - pocos resultados encontrados')
          const broadQuery = query(productsRef, limit(20))
          const broadSnapshot = await getDocs(broadQuery)
          
          broadSnapshot.docs.forEach(doc => {
            const data = doc.data()
            
            // Buscar en nombre
            if (data.name && data.name.toLowerCase().includes(searchTerm) && 
                !allResults.find(r => r.id === doc.id)) {
              allResults.push({
                id: doc.id,
                ...data,
                relevance: 1
              })
            }
            
            // Buscar en descripción si existe
            if (this.searchConfig.searchFields.includes('description') &&
                data.description && data.description.toLowerCase().includes(searchTerm) && 
                !allResults.find(r => r.id === doc.id)) {
              allResults.push({
                id: doc.id,
                ...data,
                relevance: 1
              })
            }
          })
        }
        
        // Ordenar por relevancia y limitar resultados
        this.searchResults = allResults
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, this.searchConfig.maxResults)
        
        this.showResults = this.searchResults.length > 0
        
        console.log('✅ Búsqueda completada:', {
          resultados: this.searchResults.length,
          datos: this.searchResults.map(r => ({ 
            name: r.name, 
            relevance: r.relevance 
          }))
        })
        
      } catch (error) {
        console.error("❌ Error buscando productos:", error)
        this.searchResults = []
        this.showResults = false
      }
    },
    
    performSearch() {
      console.log('Ejecutando búsqueda completa')
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/products',
          query: { search: this.searchQuery.trim() }
        })
        this.hideSearchResults()
      }
    },
    
    goToProduct(product) {
      console.log('Navegando a producto:', product.id)
      this.$router.push(`/product/${product.id}`)
      this.hideSearchResults()
    },
    
    viewAllResults() {
      console.log('Viendo todos los resultados')
      this.performSearch()
    },
    
    hideSearchResults() {
      this.showResults = false
      this.searchQuery = ''
      this.searchResults = []
    },
    
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    
    async logout() {
  try {
    await signOut(auth);
    this.$router.push('/');
    this.showDropdown = false;
    // Opcional: Mostrar mensaje de éxito
    this.$toast.success('Sesión cerrada correctamente');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    this.$toast.error('Error al cerrar sesión');
  }
},
    
    closeDropdown(e) {
      if (!this.$el.contains(e.target)) {
        this.showDropdown = false
      }
    },
    
    handleOutsideClick(e) {
      // Cerrar dropdown de usuario
      if (this.showDropdown && !this.$el.querySelector('.user-panel').contains(e.target)) {
        this.showDropdown = false
      }
      
      // Cerrar resultados de búsqueda
      if (this.showResults && !this.$el.querySelector('.search-container').contains(e.target)) {
        this.showResults = false
      }
    }
  },
  mounted() {
    console.log('Componente Navbar montado correctamente')
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    // Limpiar event listeners y timeouts
    document.removeEventListener('click', this.handleOutsideClick)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
:root {
  --verde-primario: #2E7D32;
  --verde-secundario: #388E3C;
  --amarillo-maiz: #FFF59D;
  --naranja-cosecha: #FF8F00;
  --gris-claro: #FAFAFA;
  --gris-medio: #757575;
  --rojo-carniceria: #B71C1C;
  --blanco: #FFFFFF;
  --sombra: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Estilos generales del header */
.agro-header {
  background-color: var(--verde-primario);
  box-shadow: var(--sombra);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Estilos de la marca */
.brand-section {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  height: 40px;
  margin-right: 10px;
}

.brand-name {
  color: var(--blanco);
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Roboto', sans-serif;
}

/* Estilos del buscador */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 1.5rem;
  position: relative;
}

.search-input-wrapper {
  display: flex;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  padding-right: 40px;
}

.search-input:focus {
  border-color: var(--verde-secundario);
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
}

.search-button {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 40px;
  background-color: transparent;
  color: var(--verde-secundario);
  border: none;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: var(--verde-primario);
}

/* Dropdown de resultados */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  padding: 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.result-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.result-info {
  flex: 1;
}

.result-info h4 {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  color: #333;
}

.result-price {
  margin: 0;
  font-weight: bold;
  color: var(--verde-primario);
  font-size: 0.9rem;
}

.search-footer {
  padding: 0.8rem;
  text-align: center;
  font-weight: 500;
  color: var(--verde-primario);
  cursor: pointer;
  background-color: #f5f5f5;
}

.search-footer:hover {
  background-color: #eee;
}

/* Navegación principal */
.main-nav {
  display: flex;
  gap: 1.5rem;
  margin: 0 2rem;
}

.nav-link {
  color: var(--blanco);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--amarillo-maiz);
}

.nav-link i {
  font-size: 1.1rem;
}

/* Carrito */
.cart-link {
  position: relative;
}

.cart-link svg {
  color: #000;
  transition: color 0.3s ease;
}

.cart-link .has-items {
  color: var(--rojo-carniceria);
}

.cart-badge {
  background-color: var(--naranja-cosecha);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  font-weight: bold;
  position: absolute;
  top: -8px;
  right: -12px;
}

/* Panel de usuario */
.user-section {
  position: relative;
}

.auth-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}

.login-link {
  background-color: var(--amarillo-maiz);
  color: var(--verde-primario);
}

.login-link:hover {
  background-color: var(--naranja-cosecha);
  color: var(--blanco);
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  position: relative;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--amarillo-maiz);
}

.user-name {
  color: var(--blanco);
  font-weight: 500;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Menú desplegable usuario */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--blanco);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  overflow: hidden;
  z-index: 1001;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  color: var(--gris-medio);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  color: var(--verde-primario);
}

.dropdown-item:hover {
  background-color: var(--gris-claro);
  color: var(--verde-primario);
  border-left-color: var(--naranja-cosecha);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--gris-claro);
  margin: 0.3rem 0;
}

.logout-item {
  color: var(--rojo-carniceria);
}

.logout-item i {
  color: var(--rojo-carniceria);
}

/* Responsive */
@media (max-width: 992px) {
  .header-container {
    flex-wrap: wrap;
  }
  
  .search-container {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin: 1rem 0 0 0;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0.8rem;
  }
  
  .brand-name {
    display: none;
  }
  
  .search-container {
    margin: 0 0.5rem;
  }
  
  .search-input {
    padding: 0.5rem;
  }
  
  .main-nav {
    margin: 0;
    gap: 1rem;
  }
  
  .user-section {
    margin-left: auto;
  }
  
  .dropdown-menu {
    right: auto;
    left: 0;
  }
}
</style>