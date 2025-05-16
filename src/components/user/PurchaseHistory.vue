<template>
    <div class="purchase-history">
      <h2>Historial de Compras</h2>
      <div v-if="purchaseHistory.length > 0">
        <div v-for="purchase in purchaseHistory" :key="purchase.id" class="purchase">
          <p><strong>Fecha:</strong> {{ purchase.date }}</p>
          <p><strong>Total:</strong> ${{ purchase.total }}</p>
        </div>
      </div>
      <p v-else>No hay compras registradas.</p>
    </div>
  </template>
  
  <script>
  import { auth, db } from "@/services/firebase";
  import { doc, getDoc } from "firebase/firestore";
  
  export default {
    name: "PurchaseHistory",
    data() {
      return {
        purchaseHistory: [],
      };
    },
    async created() {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          this.purchaseHistory = userDoc.data().purchaseHistory;
        }
      }
    },
  };
  </script>
  
  <style scoped>
  .purchase-history {
    padding: 1rem;
  }
  
  .purchase {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  </style>