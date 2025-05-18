<template>
  <div class="home-page">
    <!-- Banner Principal -->
    <section class="banner">
      <div class="banner-content">
        <h1>Bienvenido a Marketplace</h1>
        <p>Encuentra los mejores productos al mejor precio.</p>
        <router-link to="/products" class="cta-button">Explorar Productos</router-link>
      </div>
    </section>

    <!-- Categorías de Productos -->
    <section class="categories">
      <h2>Explorar por Categorías</h2>
      <div class="category-list">
        <!-- Agregar evento de clic a las tarjetas de categoría -->
        <div
          class="category-card"
          v-for="category in categories"
          :key="category.id"
          @click="goToSearchPage(category.id)"
        >
          <img :src="category.image" :alt="category.name" />
          <h3>{{ category.name }}</h3>
        </div>
      </div>
    </section>

    <!-- Productos Destacados -->
    <section class="featured-products">
      <h2>Productos Destacados</h2>
      <div class="product-list">
    <router-link 
      v-for="product in featuredProducts" 
      :key="product.id" 
      :to="`/product/${product.id}`" 
      class="product-card"
    >
      <div class="product-image-container">
        <img 
          :src="product.images && product.images.length > 0 ? product.images[0] : 'ruta/a/imagen/predeterminada.jpg'" 
          :alt="product.name" 
          class="product-image"
        />
        <button 
          class="add-to-cart-button"
          @click.prevent="addToCart(product)"
        >
          <i class="fas fa-shopping-cart"></i> Agregar al carrito
        </button>
      </div>
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <div class="price-rating">
          <span class="price">${{ product.price.toFixed(2) }}</span>
          <div class="rating">
            <i 
              v-for="star in 5" 
              :key="star" 
              class="fas fa-star" 
              :class="{ 'filled': star <= (product.rating || 0) }"
            ></i>
          </div>
        </div>
        <p class="description">{{ product.description || 'Descripción no disponible' }}</p>
      </div>
    </router-link>
  </div>
    </section>

    <!-- Información sobre la Plataforma -->
    <section class="about">
      <h2>¿Por qué elegirnos?</h2>
      <p>
        En Marketplace ofrecemos una amplia variedad de productos de alta calidad a precios
        competitivos. Nuestra plataforma es fácil de usar y segura para tus compras.
      </p>
    </section>

    <!-- Testimonios -->
    <section class="testimonials">
      <h2>Lo que dicen nuestros clientes</h2>
      <div class="testimonial-list">
        <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.id">
          <p>"{{ testimonial.message }}"</p>
          <p class="author">- {{ testimonial.author }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { db } from "@/services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "vue-toastification";

export default {
  name: "HomePage",
  data() {
    return {
      categories: [],
      featuredProducts: [],
      testimonials: [],
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    this.categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const productsSnapshot = await getDocs(collection(db, "products"));
    this.featuredProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const testimonialsSnapshot = await getDocs(collection(db, "testimonials"));
    this.testimonials = testimonialsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  methods: {
    goToSearchPage(categoryId) {
      this.$router.push({ path: "/search", query: { category: categoryId } });
    },
    
    addToCart(product) {
      this.$store.dispatch('addToCart', product);
      this.toast.success(`${product.name} agregado al carrito`); // ¡Funcionará!
    }
  },
};
</script>