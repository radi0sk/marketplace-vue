<template>
  <header class="agro-header">
    <div class="header-container">
      <!-- Logo y marca -->
      <div class="brand-section">
        <router-link to="/" class="brand-link">
          <img src="@/assets/logo.png" alt="AgroMarket" class="brand-logo">
          <span class="brand-name">AgroMarket GT</span>
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

    <router-link to="/pagos" class="nav-link">
      <span>Pagos</span>
    </router-link>
    <router-link to="/envioPaqueteria" class="nav-link">
      <span>Envío</span>
    </router-link>
    <router-link to="/contacto" class="nav-link">
      <span>Contacto</span>
    </router-link>
    <router-link to="/nosotros" class="nav-link">
      <span>Nosotros</span>
    </router-link>
    <router-link to="/cart" class="nav-link cart-link" v-if="userRole == 'admin' || userRole === 'cliente'">
      <font-awesome-icon
        :icon="['fas', 'shopping-cart']"
        :class="{ 'has-items': cartItemCount > 0 }"
      />
      <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
    </router-link>
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
                <router-link to="/admin/brands" class="dropdown-item">
                  <i class="fas fa-chart-line"></i> Marcas
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
<style scoped>/* Estilos generales del header */
.agro-header {
  background-color: #2c3e50; /* Nuevo color de fondo principal */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 10px;
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
  color: #FFFFFF; /* Blanco puro para el texto de la marca sobre fondo oscuro */
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
  border: 1px solid #5a7da0; /* Borde sutil que combine con el fondo */
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  padding-right: 40px;
  background-color: #FFFFFF; /* Fondo blanco para el input */
  color: #1C1C1C; /* Negro suave para el texto del input */
}

.search-input::placeholder {
  color: #888; /* Color del placeholder */
}

.search-input:focus {
  border-color: #1F3A93; /* Azul oscuro para el foco */
  box-shadow: 0 0 0 2px rgba(31, 58, 147, 0.2); /* Sombra con el color principal */
}

.search-button {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 40px;
  background-color: transparent;
  color: #1F3A93; /* Azul oscuro para el icono de búsqueda */
  border: none;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: #002B5B; /* Azul secundario en hover */
}

/* Dropdown de resultados */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #FFFFFF; /* Blanco puro para el fondo del dropdown */
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
  border-bottom: 1px solid #E0E0E0; /* Gris suave para el borde */
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #F2F2F2; /* Gris suave en hover */
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
  color: #1C1C1C; /* Negro suave para el título del producto */
}

.result-price {
  margin: 0;
  font-weight: bold;
  color: #1F3A93; /* Azul oscuro para el precio */
  font-size: 0.9rem;
}

.search-footer {
  padding: 0.8rem;
  text-align: center;
  font-weight: 500;
  color: #1F3A93; /* Azul oscuro para el texto del footer */
  cursor: pointer;
  background-color: #F2F2F2; /* Gris suave para el fondo del footer */
}

.search-footer:hover {
  background-color: #E0E0E0; /* Gris más oscuro en hover */
}

/* Navegación principal */
.main-nav {
  display: flex;
  gap: 1.5rem;
  margin: 0 2rem;
}

.nav-link {
  color: #FFFFFF; /* Blanco puro para los enlaces de navegación sobre fondo oscuro */
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
  color: #002B5B; /* Azul secundario en hover */
}

.nav-link i {
  font-size: 1.1rem;
  color: #FFFFFF; /* Blanco puro para los iconos de navegación */
}

/* Carrito */
.cart-link {
  position: relative;
}

.cart-link svg {
  color: #FFFFFF; /* Blanco puro para el icono del carrito */
  transition: color 0.3s ease;
}

.cart-link .has-items {
  color: #F2F2F2; /* Gris suave cuando tiene ítems */
}

.cart-badge {
  background-color: #1F3A93; /* Azul oscuro para el badge */
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
  background-color: #1F3A93; /* Azul oscuro para el botón de ingresar */
  color: #FFFFFF; /* Blanco puro para el texto */
}

.login-link:hover {
  background-color: #002B5B; /* Azul secundario en hover */
  color: #FFFFFF;
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
  border: 2px solid #FFFFFF; /* Blanco puro para el borde del avatar */
}

.user-name {
  color: #FFFFFF; /* Blanco puro para el nombre de usuario */
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
  background-color: #FFFFFF; /* Blanco puro para el fondo del dropdown */
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
  color: #1C1C1C; /* Negro suave para los ítems del dropdown */
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  color: #1F3A93; /* Azul oscuro para los iconos del dropdown */
}

.dropdown-item:hover {
  background-color: #F2F2F2; /* Gris suave en hover */
  color: #002B5B; /* Azul secundario en hover */
  border-left-color: #1F3A93; /* Azul oscuro para el borde izquierdo en hover */
}

.dropdown-divider {
  height: 1px;
  background-color: #E0E0E0; /* Gris suave para el divisor */
  margin: 0.3rem 0;
}

.logout-item {
  color: #FF4D4D; /* Rojo para el logout (siempre es bueno mantener un color distintivo para esta acción) */
}

.logout-item i {
  color: #FF4D4D; /* Rojo para el icono de logout */
}

/* Responsive (mantener los estilos existentes o ajustarlos si es necesario para los nuevos colores) */
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
}</style>