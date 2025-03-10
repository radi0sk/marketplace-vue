<template>
    <div class="vendedor-home">
      <VendedorDashboard />
      <VendedorProductForm />
      <VendedorWholesalePriceManager />
      <VendedorSalesStatistics />
      <VendedorDiscountManager />
      <VendedorOrderManager />
    </div>
  </template>
  
  <script>
  import VendedorDashboard from "@/components/vendedor/VendedorDashboard.vue";
  import VendedorProductForm from "@/components/vendedor/VendedorProductForm.vue";
  import VendedorWholesalePriceManager from "@/components/vendedor/VendedorWholesalePriceManager.vue";
  import VendedorSalesStatistics from "@/components/vendedor/VendedorSalesStatistics.vue";
  import VendedorDiscountManager from "@/components/vendedor/VendedorDiscountManager.vue";
  import VendedorOrderManager from "@/components/vendedor/VendedorOrderManager.vue";
  
  export default {
    name: "VendedorHome",
    components: {
      VendedorDashboard,
      VendedorProductForm,
      VendedorWholesalePriceManager,
      VendedorSalesStatistics,
      VendedorDiscountManager,
      VendedorOrderManager,
    },
  };
  </script>
  
  <style scoped>
  .vendedor-home {
    padding: 1rem;
  }
  </style>