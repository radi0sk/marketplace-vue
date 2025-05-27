<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/">Marketplace</router-link>
    </div>
    <div class="navbar-menu">
      <!-- Opciones para usuarios no autenticados -->
      <div class="navbar-item" v-if="!user">
        <router-link to="/">Inicio</router-link>
        <router-link to="/products">Productos</router-link>
      </div>

      <!-- Carrito de compras (visible para todos) -->
      <div class="navbar-item">
        <router-link to="/cart">
          Carrito
          <span v-if="cartItemCount > 0" class="cart-count">{{ cartItemCount }}</span>
        </router-link>
      </div>

      <!-- Opciones para usuarios autenticados -->
      <div class="navbar-item" v-if="user">
        <div class="user-panel" @click="toggleDropdown">
          <img :src="user.photoURL" alt="User Photo" class="user-photo" />
          <span>{{ user.displayName }}</span>
          <i class="fas fa-caret-down"></i>
        </div>
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <!-- Opciones comunes para todos los usuarios autenticados -->
          <router-link to="/profile" class="dropdown-item">Perfil</router-link>
          <router-link to="/purchase-history" class="dropdown-item">Historial de Compras</router-link>
          <router-link to="/favorites" class="dropdown-item">Favoritos</router-link>

          <!-- Opciones solo para administradores -->
          <router-link v-if="userRole === 'admin'" to="/admin" class="dropdown-item">Admin</router-link>
          <router-link v-if="userRole === 'admin'" to="ProductManagement" class="dropdown-item">Gestionar Productos</router-link>

          <!-- Cerrar sesión -->
          <button @click="logout" class="dropdown-item">Cerrar Sesión</button>
        </div>
      </div>

      <!-- Enlace de inicio de sesión para usuarios no autenticados -->
      <div class="navbar-item" v-if="!user">
        <router-link to="/login">Iniciar Sesión</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { auth, db } from "@/services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { mapGetters } from 'vuex'; // Importa mapGetters

export default {
  name: "AppNavbar",
  data() {
    return {
      user: null,
      userRole: null,
      isDropdownOpen: false,
    };
  },
  async created() {
    auth.onAuthStateChanged(async (user) => {
      this.user = user;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.userRole = userDoc.data().role;
            this.$root.$emit('show-notification', {
              message: `Bienvenido ${user.displayName || ''}`,
              type: 'success'
            });
          }
        } catch (error) {
          console.error("Error al obtener rol:", error);
          this.$root.$emit('show-notification', {
            message: 'Error al cargar información de usuario',
            type: 'error'
          });
        }
      }
    });
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    async logout() {
      try {
        await signOut(auth);
        this.$root.$emit('show-notification', {
          message: 'Sesión cerrada correctamente',
          type: 'success'
        });
        this.$router.push("/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        this.$root.$emit('show-notification', {
          message: 'Error al cerrar sesión',
          type: 'error'
        });
      }
    },
  },
  computed: {
    ...mapGetters(['cartItemCount']), // Mapea el getter cartItemCount del store
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #42b983;
  color: white;
}


.cart-count {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.8em;
  margin-left: 5px;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  align-items: center;
}

.navbar-item {
  margin-left: 1rem;
  position: relative;
}

.user-panel {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-photo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

button.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}
</style>