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
  <div class="product-actions">
    <button class="add-to-cart-button" @click.prevent="addToCart(product)">
      <font-awesome-icon :icon="['fas', 'shopping-cart']" />
    </button>
    <button 
      class="favorite-button"
      @click.prevent="toggleFavorite(product)"
      :class="{ 'is-favorite': favoriteStatus[product.id] }"
    >
      <font-awesome-icon 
        :icon="favoriteStatus[product.id] ? ['fas', 'heart'] : ['far', 'heart']" 
      />
    </button>
  </div>
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
import { db, auth } from "@/services/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useToast } from "vue-toastification";

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: "HomePage",
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      categories: [],
      featuredProducts: [],
      testimonials: [],
      favoriteStatus: {}
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
    async toggleFavorite(product) {
    const user = auth.currentUser;
    if (!user) {
      this.toast.error("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const productId = product.id;
      const isFavorite = this.favoriteStatus[productId];

      if (isFavorite) {
        // Remover de favoritos
        await updateDoc(userRef, {
          favorites: arrayRemove(productId)
        });
        this.toast.success("Producto eliminado de favoritos");
      } else {
        // Agregar a favoritos
        await updateDoc(userRef, {
          favorites: arrayUnion(productId)
        });
        this.toast.success("Producto agregado a favoritos");
      }

      // Actualizar estado local
      product.isFavorite = !product.isFavorite

    } catch (error) {
      console.error("Error updating favorites:", error);
      this.toast.error("Error al actualizar favoritos");
    }
  },

  async checkFavorites() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const favorites = userDoc.data().favorites || [];
        // Inicializar el estado de favoritos para todos los productos
        this.featuredProducts.forEach(product => {
          this.$set(this.favoriteStatus, product.id, favorites.includes(product.id));
        });
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  },
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

<style scoped>

.product-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem; /* Espacio entre botones */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.add-to-cart-button, 
.favorite-button {
  padding: 0.5rem;
  background-color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.add-to-cart-button {
  background-color: #42b983;
  color: white;
}

.favorite-button {
  background-color: white;
  color: #666;
}

.favorite-button.is-favorite {
  color: #c62828;
}

.home-page {
  padding: 1rem;
}

.banner {
  background-image: url("https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png");
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
.product-card {
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  position: relative;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 8px;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}





.product-info {
  text-align: left;
}

.price-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.rating {
  color: #ddd;
}

.rating .filled {
  color: #ffc107;
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-details {
  display: inline-block;
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.view-details:hover {
  text-decoration: underline;
}
.testimonial-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer; /* Cambiar el cursor al pasar sobre las tarjetas de categoría */
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