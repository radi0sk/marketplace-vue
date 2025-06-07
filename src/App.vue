<template>
  <div id="app">
    <!-- Navbar -->
    <AppNavbar />

    <!-- Contenido dinámico basado en la ruta -->
    <router-view />

    <!-- Imagen de logo (opcional) -->
    <AppFooter />
    
  </div>
</template>

<script>
// Importa el componente Navbar
import AppNavbar from "./components/Navbar.vue";
import AppFooter from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    AppNavbar,
    AppFooter, // Registra el componente Navbar listo
  },
};
</script>

<style>
/* Estilos globales */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

/* Estilos para el logo (opcional) */
.logo {
  width: 100px;
  margin-top: 20px;
}
</style>