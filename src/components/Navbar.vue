<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-logo">Marketplace</router-link>
    </div>
    <ul class="navbar-links">
      <!-- Enlaces para todos los usuarios -->
      <li>
        <router-link to="/" class="navbar-link">Inicio</router-link>
      </li>
      <li>
        <router-link to="/cart" class="navbar-link">Carrito</router-link>
      </li>

      <!-- Enlaces para vendedores -->
      <li v-if="userRole === 'vendedor'">
        <router-link to="/seller" class="navbar-link">Panel de Vendedor</router-link>
      </li>

      <!-- Enlaces para mayoristas -->
      <li v-if="userRole === 'mayorista'">
        <router-link to="/wholesale" class="navbar-link">Mayorista</router-link>
      </li>

      <!-- Enlace de cierre de sesión (si el usuario está autenticado) -->
      <li v-if="isAuthenticated">
        <a href="#" class="navbar-link" @click="logout">Cerrar Sesión</a>
      </li>

      <!-- Enlace de inicio de sesión (si el usuario no está autenticado) -->
      <li v-else>
        <router-link to="/login" class="navbar-link">Iniciar Sesión</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "AppNavbar",
  data() {
    return {
      userRole: "cliente", // Puedes cambiar esto dinámicamente según el rol del usuario
      isAuthenticated: false, // Puedes cambiar esto dinámicamente según el estado de autenticación
    };
  },
  methods: {
    logout() {
      // Lógica para cerrar sesión
      this.isAuthenticated = false;
      this.userRole = "cliente"; // Restablecer el rol
      this.$router.push("/"); // Redirigir al inicio
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-logo {
  color: white;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-links li {
  margin-left: 1.5rem;
}

.navbar-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
}

.navbar-link:hover {
  text-decoration: underline;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .navbar-links {
    flex-direction: column;
    align-items: center;
  }

  .navbar-links li {
    margin: 0.5rem 0;
  }
}
</style>