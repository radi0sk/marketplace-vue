<template>
    <div class="product-list">
      <h2>Productos Disponibles</h2>
      <div class="products">
        <ClienteProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </template>
  
  <script>
  import ClienteProductCard from "./ClienteProductCard.vue";
  
  export default {
    name: "ClienteProductList",
    components: {
      ClienteProductCard,
    },
    data() {
      return {
        products: [], // Aquí se cargarán los productos desde Firestore
      };
    },
    async created() {
      // Cargar productos desde Firestore
      const querySnapshot = await getDocs(collection(db, "products"));
      this.products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  };
  </script>
  
  <style scoped>
  .product-list {
    padding: 1rem;
  }
  
  .products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  </style>