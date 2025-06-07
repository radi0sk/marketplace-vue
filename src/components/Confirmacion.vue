<template>
  <div class="confirmacion">
    <h1>¡Compra realizada con éxito!</h1>
    <router-link to="/purchase-history" class="btn-continuar">Historial de Pedidos</router-link>
    <p>Tu número de pedido es: {{ orderId }}</p>
    
    <router-link to="/" class="btn-continuar">Continuar comprando</router-link>
  </div>
</template>

<script>
export default {
  name: 'ConfirmacionCompra',
  props: {
    orderId: {
      type: String,
      required: false,
      default: 'No disponible'
    }
  },
  mounted() {
    // Mostrar notificación cuando el componente se monta
    this.$root.$emit('show-notification', {
      message: `Compra completada! ID: ${this.orderId}`,
      type: 'success'
    });
  }
}
</script>

<style scoped>
.confirmacion {
  text-align: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.btn-continuar {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-continuar:hover {
  background-color: #3aa876;
}
</style>