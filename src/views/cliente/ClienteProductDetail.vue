<template>
    <div class="product-detail">
      <h2>{{ product.name }}</h2>
      <img :src="product.image" :alt="product.name" class="product-image" />
      <p class="product-description">{{ product.description }}</p>
      <p class="product-price">${{ product.price }}</p>
      <button @click="addToCart" class="add-to-cart-button">Agregar al Carrito</button>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";
  import { doc, getDoc } from "firebase/firestore";
  
  export default {
    name: "ClienteProductDetail",
    data() {
      return {
        product: {},
      };
    },
    async created() {
      const productId = this.$route.params.id;
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.product = { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("Producto no encontrado");
      }
    },
    methods: {
      addToCart() {
        // Lógica para agregar al carrito
        this.$store.dispatch("addToCart", this.product);
      },
    },
  };
  </script>
  
  <style scoped>
  .product-detail {
    padding: 1rem;
    text-align: center;
  }
  
  .product-image {
    max-width: 100%;
    border-radius: 8px;
  }
  
  .product-description {
    margin: 1rem 0;
  }
  
  .product-price {
    font-size: 1.5rem;
    color: #2c3e50;
    font-weight: bold;
  }
  
  .add-to-cart-button {
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-to-cart-button:hover {
    background-color: #3aa876;
  }
  </style>