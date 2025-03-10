<template>
    <div class="discount-manager">
      <h2>Gestión de Descuentos</h2>
      <form @submit.prevent="applyDiscount">
        <label for="product">Producto:</label>
        <select id="product" v-model="selectedProduct" required>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
  
        <label for="discount">Descuento (%):</label>
        <input type="number" id="discount" v-model="discount" required />
  
        <button type="submit" class="submit-button">Aplicar Descuento</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "VendedorDiscountManager",
    data() {
      return {
        products: [], // Aquí se cargarán los productos desde Firestore
        selectedProduct: "",
        discount: 0,
      };
    },
    async created() {
      // Cargar productos desde Firestore
      // Ejemplo:
      // this.products = await obtenerProductosDesdeFirestore();
    },
    methods: {
      async applyDiscount() {
        // Aquí puedes agregar la lógica para aplicar el descuento en Firestore
        // Ejemplo:
        // await aplicarDescuentoEnFirestore(this.selectedProduct, this.discount);
        alert("Descuento aplicado exitosamente");
      },
    },
  };
  </script>
  
  <style scoped>
  .discount-manager {
    padding: 1rem;
  }
  
  label {
    display: block;
    margin: 0.5rem 0;
  }
  
  input,
  select {
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