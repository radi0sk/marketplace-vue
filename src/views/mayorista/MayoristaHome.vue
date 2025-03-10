<template>
    <div class="mayorista-home">
      <h1>Bienvenido, Mayorista</h1>
      <MayoristaProductList />
    </div>
  </template>
  
  <script>
  import MayoristaProductList from "@/components/mayorista/MayoristaProductList.vue";
  
  export default {
    name: "MayoristaHome",
    components: {
      MayoristaProductList,
    },
  };
  </script>
  
  <style scoped>
  .mayorista-home {
    padding: 1rem;
  }
  </style>