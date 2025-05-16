<template>
  <div class="product-card">
    <div class="product-image-container">
      <img :src="product.image" :alt="product.name" class="product-image" />
      <button @click="addToCart" class="add-to-cart-button" aria-label="Añadir al carrito">
        <i class="fas fa-cart-plus"></i>
      </button>
      <span v-if="product.discount > 0" class="discount-badge">
        -{{ product.discount }}%
      </span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="price-container">
        <span class="current-price">${{ calculatePrice(product.price, product.discount) }}</span>
        <span v-if="product.discount > 0" class="original-price">${{ product.price.toFixed(2) }}</span>
      </div>
      <router-link :to="`/product/${product.id}`" class="view-details-button">
        Ver Detalles
      </router-link>
    </div>
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
  methods: {
    calculatePrice(price, discount) {
      return (price * (1 - discount / 100)).toFixed(2);
    },
    addToCart() {
      this.$store.dispatch('addToCart', { ...this.product, quantity: 1 });
      this.$root.$emit('show-notification', {
        message: `${this.product.name} añadido al carrito`,
        type: 'success'
      });
    }
  },
};
</script>

<style scoped>
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.add-to-cart-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .add-to-cart-button {
  opacity: 1;
}

.add-to-cart-button:hover {
  background-color: #3aa876;
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: #ff4d4d;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-info {
  padding: 1rem;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.current-price {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}

.view-details-button {
  display: block;
  text-align: center;
  padding: 0.5rem;
  background-color: #f5f5f5;
  color: #42b983;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.view-details-button:hover {
  background-color: #e9e9e9;
}
</style>