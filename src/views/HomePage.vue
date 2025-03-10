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
        <div class="category-card" v-for="category in categories" :key="category.id">
          <img :src="category.image" :alt="category.name" />
          <h3>{{ category.name }}</h3>
        </div>
      </div>
    </section>

    <!-- Productos Destacados -->
    <section class="featured-products">
      <h2>Productos Destacados</h2>
      <div class="product-list">
        <div class="product-card" v-for="product in featuredProducts" :key="product.id">
          <img :src="product.image" :alt="product.name" />
          <h3>{{ product.name }}</h3>
          <p>${{ product.price }}</p>
          <router-link :to="`/product/${product.id}`" class="view-details">Ver Detalles</router-link>
        </div>
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
import { db } from "@/firebase"; // Importa la instancia de Firestore
import { collection, getDocs } from "firebase/firestore";

export default {
  name: "HomePage",
  data() {
    return {
      categories: [], // Categorías cargadas desde Firestore
      featuredProducts: [], // Productos destacados cargados desde Firestore
      testimonials: [], // Testimonios cargados desde Firestore
    };
  },
  async created() {
    // Cargar categorías desde Firestore
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    this.categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cargar productos destacados desde Firestore
    const productsSnapshot = await getDocs(collection(db, "products"));
    this.featuredProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cargar testimonios desde Firestore
    const testimonialsSnapshot = await getDocs(collection(db, "testimonials"));
    this.testimonials = testimonialsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};
</script>

<style scoped>
.home-page {
  padding: 1rem;
}

.banner {
  background-image: url("https://via.placeholder.com/1200x400");
  background-size: cover;
  background-position: center;
  color: white;
  padding: 2rem;
  text-align: center;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.banner-content p {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
}

.cta-button:hover {
  background-color: #3aa876;
}

.categories,
.featured-products,
.about,
.testimonials {
  margin: 2rem 0;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.category-list,
.product-list,
.testimonial-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.category-card,
.product-card,
.testimonial-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background-color: #f9f9f9;
}

.category-card img,
.product-card img {
  max-width: 100%;
  border-radius: 8px;
}

.product-card h3 {
  margin: 0.5rem 0;
}

.product-card p {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.view-details {
  display: inline-block;
  margin-top: 0.5rem;
  color: #42b983;
  text-decoration: none;
}

.view-details:hover {
  text-decoration: underline;
}

.testimonial-card p {
  font-style: italic;
  color: #666;
}

.testimonial-card .author {
  margin-top: 0.5rem;
  font-weight: bold;
}
</style>