<template>
    <div class="wholesale-price-manager">
      <h2>Gestión de Precios para Mayoristas</h2>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio Mayorista</th>
            <th>Cantidad Mínima</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>
              <input type="number" v-model="product.wholesalePrice" />
            </td>
            <td>
              <input type="number" v-model="product.minWholesaleQuantity" />
            </td>
            <td>
              <button @click="updateProduct(product)">Guardar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    name: "VendedorWholesalePriceManager",
    data() {
      return {
        products: [], // Aquí se cargarán los productos desde Firestore
      };
    },
    async created() {
      // Cargar productos desde Firestore
      // Ejemplo:
      // this.products = await obtenerProductosDesdeFirestore();
    },
    methods: {
      async updateProduct(product) {
        // Aquí puedes agregar la lógica para actualizar el producto en Firestore
        // Ejemplo:
        // await actualizarProductoEnFirestore(product);
        alert(`Precio del producto ${product.name} actualizado exitosamente`);
      },
    },
  };
  </script>
  
  <style scoped>
  .wholesale-price-manager {
    padding: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background-color: #f9f9f9;
  }
  
  input {
    width: 80px;
    padding: 0.25rem;
  }
  
  button {
    padding: 0.25rem 0.5rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #3aa876;
  }
  </style>