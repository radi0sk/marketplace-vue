<template>
  <div class="confirmacion">
    <h1>¡Compra realizada con éxito!</h1>
    <router-link to="/purchase-history" class="btn-continuar">Historial de Pedidos</router-link>
    <p>Tu número de pedido es: {{ orderId }}</p>
    
    <router-link to="/" class="btn-continuar">Continuar comprando</router-link>
    <ReviewDialog 
      v-if="showReviewDialog"
      :orderId="orderId"
      @close="showReviewDialog = false"
    />
  </div>
</template>

<script>
import ReviewDialog from '@/components/ReviewDialog.vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export default {
  name: 'ConfirmacionCompra',
  components: { ReviewDialog },
  data() {
    return {
      orderId: 'No disponible',
      showReviewDialog: false,
      orderStatus: ''
    };
  },
  async mounted() {
    // Extraer el orderId de los parámetros de la ruta
    this.orderId = this.$route.query.orderId || 'No disponible';

    if (this.orderId !== 'No disponible') {
      // Obtener el estado del pedido desde Firestore
      const orderRef = doc(db, 'ordenes', this.orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        this.orderStatus = orderSnap.data().estado || '';
        
        // Mostrar el diálogo de reseña si el pedido está entregado
        if (this.orderStatus === 'pendiente') {
          setTimeout(() => {
            this.showReviewDialog = true;
          }, 3000);
        }
      }
    }

    // Mostrar notificación
    this.$root.$emit('show-notification', {
      message: `Compra completada! ID: ${this.orderId}`,
      type: 'success'
    });
  }
};
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