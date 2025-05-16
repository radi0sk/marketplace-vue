<template>
    <div class="favorites">
      <h2>Mis Favoritos</h2>
      <div v-if="favorites.length > 0">
        <div v-for="product in favorites" :key="product.id" class="product">
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
        </div>
      </div>
      <p v-else>No tienes productos favoritos.</p>
    </div>
  </template>
  
  <script>
  import { auth, db } from "@/services/firebase";
  import { doc, getDoc } from "firebase/firestore";
  
  export default {
    name: "Favorites",
    data() {
      return {
        favorites: [],
      };
    },
    async created() {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          this.favorites = userDoc.data().favorites;
        }
      }
    },
  };
  </script>
  
  <style scoped>
  .favorites {
    padding: 1rem;
  }
  
  .product {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  </style>