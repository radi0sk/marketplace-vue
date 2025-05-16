// src/store/index.js
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
  plugins: [
    createPersistedState({
      key: 'marketplace_cart', // Key único para localStorage
      paths: ['cart'], // Solo persiste el estado 'cart'
      storage: window.localStorage, // Opcional (por defecto ya usa localStorage)
    })
  ],
  state: {
    cart: [], // Aquí se almacenarán los productos del carrito
  },
  mutations: {
    CLEAR_CART(state) {
      state.cart = [];
    },
    ADD_TO_CART(state, product) {
      const existingProduct = state.cart.find((p) => p.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
    },
    REMOVE_FROM_CART(state, productId) {
      state.cart = state.cart.filter((p) => p.id !== productId);
    },
    UPDATE_QUANTITY(state, { productId, quantity }) {
      const product = state.cart.find((p) => p.id === productId);
      if (product) {
        product.quantity = quantity;
      }
    },
  },
  actions: {
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product);
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },
    updateQuantity({ commit }, payload) {
      commit('UPDATE_QUANTITY', payload);
    },
  },
  getters: {
    cartTotal(state) {
      return state.cart.reduce((total, product) => total + product.price * product.quantity, 0);
    },
    // Opcional: Getter para contar items totales
    cartItemCount(state) {
      return state.cart.reduce((count, product) => count + product.quantity, 0);
    }
  },
});