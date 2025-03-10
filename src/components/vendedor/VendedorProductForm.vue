<template>
    <div class="product-form">
      <h2>Publicar Nuevo Producto</h2>
      <form @submit.prevent="submitProduct">
        <label for="name">Nombre del Producto:</label>
        <input type="text" id="name" v-model="product.name" required />
  
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="product.description" required></textarea>
  
        <label for="price">Precio:</label>
        <input type="number" id="price" v-model="product.price" required />
  
        <label for="wholesalePrice">Precio Mayorista:</label>
        <input type="number" id="wholesalePrice" v-model="product.wholesalePrice" required />
  
        <label for="minWholesaleQuantity">Cantidad Mínima para Mayorista:</label>
        <input type="number" id="minWholesaleQuantity" v-model="product.minWholesaleQuantity" required />
  
        <label for="image">URL de la Imagen:</label>
        <input type="url" id="image" v-model="product.image" required />
  
        <button type="submit" class="submit-button">Publicar Producto</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "VendedorProductForm",
    data() {
      return {
        product: {
          name: "",
          description: "",
          price: 0,
          wholesalePrice: 0,
          minWholesaleQuantity: 0,
          image: "",
        },
      };
    },
    methods: {
      async submitProduct() {
        // Aquí puedes agregar la lógica para guardar el producto en Firestore
        // Ejemplo:
        // await agregarProductoAFirestore(this.product);
        alert("Producto publicado exitosamente");
        this.resetForm();
      },
      resetForm() {
        this.product = {
          name: "",
          description: "",
          price: 0,
          wholesalePrice: 0,
          minWholesaleQuantity: 0,
          image: "",
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .product-form {
    padding: 1rem;
  }
  
  label {
    display: block;
    margin: 0.5rem 0;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .submit-button {
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .submit-button:hover {
    background-color: #3aa876;
  }
  </style>