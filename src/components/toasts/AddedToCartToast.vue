<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; padding: 10px;">
    <div style="font-weight: bold; margin-bottom: 8px;">{{ message }}</div>
    <button
      @click="goToCart"
      style="
        padding: 8px 15px;
        background-color: #42b983;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.2s ease;
      "
    >
      Pagar
    </button>
  </div>
</template>

<script>
import router from '@/router';

export default {
  props: {
    message: String,
    closeToast: {
      type: Function,
      default: () => {} // Valor por defecto vacío
    }
  },
  methods: {
    goToCart() {
      router.push('/cart');
      if (typeof this.closeToast === 'function') {
        this.closeToast();
      }
    }
  }
};
</script>