<template>
    <div class="product-card">
      <img :src="product.image" :alt="product.name" class="product-image" />
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">${{ product.price }}</p>
      <router-link :to="`/product/${product.id}`" class="product-detail-link"
        >Ver Detalles</router-link
      >
    </div>
  </template>
  
  <script>
  export default {
    name: "ClienteProductCard",
    props: {
      product: {
        type: Object,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  
  .product-image {
    max-width: 100%;
    border-radius: 8px;
  }
  
  .product-name {
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }
  
  .product-price {
    font-size: 1.1rem;
    color: #2c3e50;
    font-weight: bold;
  }
  
  .product-detail-link {
    display: inline-block;
    margin-top: 0.5rem;
    color: #42b983;
    text-decoration: none;
  }
  
  .product-detail-link:hover {
    text-decoration: underline;
  }
  </style>