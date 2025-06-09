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

    <!-- Categorías de Productos  -->
      <section class="categories">
    <h2>Explorar por Categorías</h2>
    <div class="slider-container">
      <button class="slider-button prev" 
              @click="scrollSlider('category', -1)" 
              :disabled="!canScrollPrevCategory">❮</button>
      <div class="slider-list" ref="categoryList">
        <div v-for="(category, index) in duplicatedCategories" 
             :key="`${category.id}-${index}`"
             class="slider-card"
             @click="goToSearchPage(category.id)">
          <img :src="category.image" :alt="category.name" />
          <h3>{{ category.name }}</h3>
        </div>
      </div>
      <button class="slider-button next" 
              @click="scrollSlider('category', 1)"
              :disabled="!canScrollNextCategory">❯</button>
    </div>
  </section>
    <!-- Productos Destacados -->
     <section class="featured-products">
    <h2>Productos Destacados</h2>
    <div class="slider-container">
      <button class="slider-button prev" 
              @click="scrollSlider('product', -1)" 
              :disabled="!canScrollPrevProduct">❮</button>
      <div class="slider-list" ref="productList">
        <router-link v-for="(product, index) in duplicatedProducts" 
                    :key="`${product.id}-${index}`"
                    :to="`/product/${product.id}`" 
                    class="slider-card product-card">
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
      <button class="slider-button next" 
              @click="scrollSlider('product', 1)"
              :disabled="!canScrollNextProduct">❯</button>
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
import AddedToCartToast from '@/components/toasts/AddedToCartToast.vue';
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
      favoriteStatus: {},
       canScrollPrevCategory: false,
      canScrollNextCategory: true,
      canScrollPrevProduct: false,
      canScrollNextProduct: true,
      scrollInterval: null
    }
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
  computed: {
    duplicatedCategories() {
      return [...this.categories, ...this.categories, ...this.categories];
    },
    duplicatedProducts() {
      return [...this.featuredProducts, ...this.featuredProducts, ...this.featuredProducts];
    }
  },
  methods: {
    scrollProducts(direction) {
    const list = this.$refs.productList; // Asegúrate de que el ref coincida
    if (list) {
      list.scrollBy({
        left: direction * 300, // Ajusta este valor según el ancho de tus cards
        behavior: 'smooth'
      });
    }
  },    scrollSlider(type, direction) {
      const list = this.$refs[`${type}List`];
      if (!list) return;
      
      const scrollAmount = direction * (type === 'category' ? 200 : 300);
      list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    },
    checkScroll() {
      const check = (type) => {
        const list = this.$refs[`${type}List`];
        if (list) {
          this[`canScrollPrev${type.charAt(0).toUpperCase() + type.slice(1)}`] = list.scrollLeft > 0;
          this[`canScrollNext${type.charAt(0).toUpperCase() + type.slice(1)}`] = 
            list.scrollLeft < (list.scrollWidth - list.clientWidth - 1);
        }
      };
      
      check('category');
      check('product');
    },
    startAutoScroll() {
      this.scrollInterval = setInterval(() => {
        this.scrollSlider('category', 1);
        this.scrollSlider('product', 1);
      }, 3000);
    },
 scrollCategories(direction) {
  const list = this.$refs.categoryList;
  if (list) { // Verificación añadida
    list.scrollBy({
      left: direction * 200,
      behavior: 'smooth'
    });
  }
},


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
      await updateDoc(userRef, {
        favorites: arrayRemove(productId)
      });
      this.toast.success("Producto eliminado de favoritos");
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(productId)
      });
      this.toast.success("Producto agregado a favoritos");
    }

    // En Vue 3, simplemente actualiza la propiedad reactiva directamente
    this.favoriteStatus = {
      ...this.favoriteStatus,
      [productId]: !isFavorite
    };

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
      // Crear un nuevo objeto reactivo
      this.favoriteStatus = Object.fromEntries(
        this.products.map(product => [
          product.id, 
          favorites.includes(product.id)
        ])
      );
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
},
    goToSearchPage(categoryId) {
      this.$router.push({ 
        name: 'Products', 
        query: { category: categoryId } 
      });
    },
    
      addToCart(product) {
      this.$store.dispatch('addToCart', product);

      this.toast.success({
        component: AddedToCartToast,
        props: {
          message: `"${product.name}" agregado al carrito!`
        }
      });
    }
  },
  mounted() {
    this.checkScroll();
    ['categoryList', 'productList'].forEach(ref => {
      this.$refs[ref]?.addEventListener('scroll', this.checkScroll);
    });
    this.startAutoScroll();
  },
  beforeUnmount() {
    clearInterval(this.scrollInterval);
    ['categoryList', 'productList'].forEach(ref => {
      this.$refs[ref]?.removeEventListener('scroll', this.checkScroll);
    });
  }

}
</script>

<style scoped>
/* Añade para responsive: */
@media (max-width: 768px) {
  .product-card {
    width: 200px;
  }

}
/* Estilos unificados para sliders */
.slider-container {
  position: relative;
  margin: 1rem 0;
}

.slider-list {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.slider-list::-webkit-scrollbar {
  display: none;
}

.slider-card {
  flex: 0 0 auto;
  width: 250px;
  scroll-snap-align: start;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.slider-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Estilos específicos para categorías */
.categories .slider-card {
  width: 180px;
  text-align: center;
}

.categories .slider-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

/* Estilos para botones de navegación */
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: opacity 0.3s;
}

.slider-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-button.prev {
  left: 10px;
}

.slider-button.next {
  right: 10px;
}


.product-list {
  display: flex; /* Obligatorio para el slider */
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Oculta scrollbar en Firefox */
}

.product-list::-webkit-scrollbar {
  display: none; /* Oculta scrollbar en Chrome/Safari */
}

/* Ajusta el tamaño de las cards (opcional) */
.product-card {
  flex: 0 0 auto; 
  width: 250px; /* Ancho fijo para cada producto */
  /* ... (mantén tus estilos actuales de hover, etc.) ... */
}


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

/* Estilos para el slider de categorías */


.prev {
  left: 10px;
}

.next {
  right: 10px;
}
.categories {
  margin: 2rem 0;
  overflow: hidden; /* Oculta el scroll fuera del contenedor */
}

.category-slider-container {
  position: relative;
}

.category-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto; /* Permite scroll horizontal */
  scroll-behavior: smooth; /* Desplazamiento suave */
  padding-bottom: 1rem; /* Espacio para evitar cortar sombras */
  -webkit-overflow-scrolling: touch; /* Mejor scroll en móviles */
}
.category-list,
.product-list {
  will-change: transform; /* Optimiza animaciones */
}

/* Oculta la barra de scroll (opcional) */
.category-list::-webkit-scrollbar {
  display: none;
}

.category-card {
  flex: 0 0 auto; /* Evita que las cards se estiren */
  width: 250px; /* Ancho fijo para cada categoría */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.category-card h3 {
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: center;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

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