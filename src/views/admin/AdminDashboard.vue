<template>
  <div class="admin-dashboard">
    <h1>Panel de Control Administrativo</h1>
    <nav class="admin-nav">
      <router-link 
        v-for="link in adminLinks" 
        :key="link.path" 
        :to="link.path"
        active-class="active"
      >
        <i :class="link.icon"></i> {{ link.text }}
      </router-link>
    </nav>
    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      adminLinks: [
        { path: '/admin/products', text: 'Gestión de Productos', icon: 'fas fa-boxes' },
        { path: '/admin/orders', text: 'Gestión de Pedidos', icon: 'fas fa-clipboard-list' },
        { path: '/admin/sales-statistics', text: 'Estadísticas', icon: 'fas fa-chart-line' },
        { path: '/admin/brands', text: 'Gestión de Marcas', icon: 'fas fa-tag' }, // Nuevo
        { path: '/admin/banner', text: 'Gestión de Banners', icon: 'fas fa-image' } // Nuevo
      ]
    };
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 1rem;
}

.admin-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.admin-nav a {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 4px;
  transition: all 0.3s;
}

.admin-nav a:hover {
  background-color: #f0f0f0;
}

.admin-nav a.active {
  background-color: #42b983;
  color: white;
}

.admin-nav i {
  margin-right: 0.5rem;
}

.admin-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
</style>