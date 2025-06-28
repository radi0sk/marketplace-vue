<template>
  <div class="home-page">
  <section class="banner-carousel">
      <div class="carousel-inner" :style="{ transform: `translateX(-${currentBannerIndex * 100}%)` }">
        <div class="banner-slide" v-for="banner in banners" :key="banner.id">
          <div class="banner-content" :style="{ backgroundImage: `url(${banner.imageUrl})` }">
            <h1>{{ banner.title }}</h1>
            <p>{{ banner.description }}</p>
            <router-link :to="banner.ctaButtonLink" class="cta-button">{{ banner.ctaButtonText }}</router-link>
          </div>
        </div>
      </div>
      <button class="carousel-button prev" @click="prevBanner" v-if="banners.length > 1">❮</button>
      <button class="carousel-button next" @click="nextBanner" v-if="banners.length > 1">❯</button>
      <div class="carousel-indicators" v-if="banners.length > 1">
        <span v-for="(banner, index) in banners" :key="banner.id + '-indicator'"
              :class="{ active: index === currentBannerIndex }"
              @click="goToBanner(index)"></span>
      </div>
    </section>

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

    <section class="brands">
      <h2>Nuestras Marcas</h2>
      <div class="slider-container">
        <button class="slider-button prev"
                @click="scrollSlider('brand', -1)"
                :disabled="!canScrollPrevBrand">❮</button>
        <div class="slider-list" ref="brandList">
          <div v-for="(brand, index) in duplicatedBrands"
               :key="`${brand.id}-${index}`"
               class="slider-card brand-card"
               @click="goToBrandProducts(brand.id)">
            <img :src="brand.imageUrl" :alt="brand.name" />
          </div>
        </div>
        <button class="slider-button next"
                @click="scrollSlider('brand', 1)"
                :disabled="!canScrollNextBrand">❯</button>
      </div>
    </section>

    <section class="about">
      <h2>¿Por qué elegirnos?</h2>
      <p>
        En Marketplace ofrecemos una amplia variedad de productos de alta calidad a precios
        competitivos. Nuestra plataforma es fácil de usar y segura para tus compras.
      </p>
    </section>

    <section class="testimonials">
      <h2>Lo que dicen nuestros clientes</h2>
      <div class="slider-container"> <button class="slider-button prev"
                @click="scrollSlider('testimonial', -1)"
                :disabled="!canScrollPrevTestimonial">❮</button>
        <div class="slider-list" ref="testimonialList"> <div class="slider-card testimonial-card" v-for="(testimonial, index) in duplicatedTestimonials" :key="`${testimonial.id}-${index}`">
            <p>"{{ testimonial.reviewText }}"</p>
            <p class="author">- {{ testimonial.userName }}</p>
          </div>
        </div>
        <button class="slider-button next"
                @click="scrollSlider('testimonial', 1)"
                :disabled="!canScrollNextTestimonial">❯</button>
      </div>
    </section>
  </div>
</template>
<script>
import { db, auth } from "@/services/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, query, orderBy } from "firebase/firestore"; // Added query, orderBy
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
      canScrollPrevBrand: false,
      canScrollNextBrand: true,
      canScrollPrevTestimonial: false,
      canScrollNextTestimonial: true,
      scrollInterval: null,
      brands: [],
      banners: [], // Changed to an array to hold multiple banners
      currentBannerIndex: 0,
      bannerAutoScrollInterval: null,
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    // Fetch all banners
    await this.fetchAllBanners(); // Changed to fetch all banners

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
    const brandsSnapshot = await getDocs(collection(db, "brands"));
    this.brands = brandsSnapshot.docs.map((doc) => ({
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
    },
    duplicatedBrands() {
      return [...this.brands, ...this.brands, ...this.brands];
    },
    duplicatedTestimonials() {
      return [...this.testimonials, ...this.testimonials, ...this.testimonials];
    }
  },
  methods: {
    async fetchAllBanners() { // New method to fetch all banners
      try {
        // Order by 'order' field if you add it to your banner documents
        const bannersQuery = query(collection(db, "banners"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(bannersQuery);
        this.banners = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // If no banners are found, you might want to set a default one
        if (this.banners.length === 0) {
          this.banners.push({
            id: 'default-banner',
            title: "Bienvenido a Marketplace",
            description: "Encuentra los mejores productos al mejor precio.",
            ctaButtonText: "Explorar Productos",
            ctaButtonLink: "/products",
            imageUrl: "https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png" // Default image
          });
        }
        this.startBannerAutoScroll(); // Start auto-scroll after banners are loaded
      } catch (error) {
        console.error("Error fetching banners:", error);
        this.toast.error("Error al cargar los banners.");
      }
    },
    prevBanner() {
      if (this.banners.length <= 1) return;
      this.currentBannerIndex = (this.currentBannerIndex - 1 + this.banners.length) % this.banners.length;
      this.resetBannerAutoScroll();
    },
    nextBanner() {
      if (this.banners.length <= 1) return;
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
      this.resetBannerAutoScroll();
    },
    goToBanner(index) {
      if (index >= 0 && index < this.banners.length) {
        this.currentBannerIndex = index;
        this.resetBannerAutoScroll();
      }
    },
    startBannerAutoScroll() {
      if (this.banners.length <= 1) return; // No need to auto-scroll if only one banner
      clearInterval(this.bannerAutoScrollInterval); // Clear any existing interval
      this.bannerAutoScrollInterval = setInterval(() => {
        this.nextBanner();
      }, 5000); // Change banner every 5 seconds
    },
    resetBannerAutoScroll() {
      clearInterval(this.bannerAutoScrollInterval);
      this.startBannerAutoScroll();
    },
    scrollSlider(type, direction) {
      const list = this.$refs[`${type}List`];
      if (!list) return;

      const scrollAmount = direction * (type === 'category' ? 200 : type === 'testimonial' ? 400 : 300);
      list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    },
    checkScroll() {
      const check = (type) => {
        const list = this.$refs[`${type}List`];
        if (list) {
          this[`canScrollPrev${type.charAt(0).toUpperCase() + type.slice(1)}`] = list.scrollLeft > 0;
          this[`canScrollNext${type.charAt(0).toUpperCase() + type.slice(1)}`] =
            list.scrollLeft < (list.scrollWidth - list.clientWidth - 5);
        }
      };

      check('category');
      check('product');
      check('brand');
      check('testimonial');
    },
    startAutoScroll() {
      this.scrollInterval = setInterval(() => {
        this.scrollSlider('product', 1);
      }, 3000);
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
          this.favoriteStatus = Object.fromEntries(
            this.featuredProducts.map(product => [
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
    },
    goToBrandProducts(brandId) {
      this.$router.push({
        name: 'Products',
        query: { brand: brandId }
      });
    }
  },
  // Removed the watch for banner.imageUrl since it's now handled by individual banner-slide styles
  mounted() {
    this.checkScroll();
    ['categoryList', 'productList', 'brandList', 'testimonialList'].forEach(ref => {
      this.$refs[ref]?.addEventListener('scroll', this.checkScroll);
    });
    this.startAutoScroll();
    this.checkFavorites();
    // bannerAutoScroll is now handled inside fetchAllBanners
  },
  beforeUnmount() {
    clearInterval(this.scrollInterval);
    clearInterval(this.bannerAutoScrollInterval); // Clear banner auto-scroll interval
    ['categoryList', 'productList', 'brandList', 'testimonialList'].forEach(ref => {
      this.$refs[ref]?.removeEventListener('scroll', this.checkScroll);
    });
  }
}
</script>

<style scoped>
/* Color Palette Variables */
:root {
  --soft-gray: #F2F2F2;
  --dark-blue: #1F3A93;
  --secondary-blue: #002B5B;
  --pure-white: #FFFFFF;
  --soft-black: #1C1C1C;
  --accent-green: #42b983; /* Keeping for toast/success messages if needed, otherwise will be removed */
}

/* General Page Styling */
.home-page {
   /* Slightly more padding for better spacing */
  background: linear-gradient(to bottom, var(--soft-gray), #e0e0e0); /* Elegant gradient background */
  color: var(--soft-black); /* Default text color */
}


h1, h2 {
  color: var(--dark-blue); /* Headings in dark blue */
  margin-bottom: 1.5rem; /* More space below headings */
  text-align: center;
}

p {
  color: #555; /* Slightly lighter text for paragraphs */
}

/* --- Banner Carousel Section --- */
.banner-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
 
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 3rem;
}

.carousel-inner {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.banner-slide {
  flex: 0 0 100%; /* Each slide takes full width of the carousel */
}

.banner-content {
  /* This now acts as the individual banner slide with its own background image */
  background-size: cover;
  background-position: center;
  color: var(--pure-white);
  
  text-align: center;
 
  min-height: 300px; /* Ensure a minimum height for the banner */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.banner-content h1 {
  color: var(--pure-white); /* Override to white for readability on banner */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Add text shadow for contrast */
}

.banner-content p {
  color: var(--pure-white); /* Override to white for readability on banner */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.cta-button {
  padding: 1rem 2rem; /* More generous padding */
  background: linear-gradient(45deg, var(--dark-blue), var(--secondary-blue)); /* Blue gradient */
  color: var(--pure-white);
  text-decoration: none;
  border-radius: 8px; /* Rounded buttons */
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Fluid animation */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Button shadow */
  display: inline-block; /* Allows padding and shadow */
}

.cta-button:hover {
  background: linear-gradient(45deg, var(--secondary-blue), var(--dark-blue)); /* Inverted gradient on hover */
  transform: translateY(-3px); /* Subtle lift effect */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3); /* Enhanced shadow on hover */
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: var(--pure-white);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.carousel-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-button.prev {
  left: 10px;
}

.carousel-button.next {
  right: 10px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1;
}

.carousel-indicators span {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.carousel-indicators span.active {
  background-color: var(--pure-white);
  transform: scale(1.2);
}
/* --- Sliders (Categories, Featured Products, Brands, Testimonials) --- */
.slider-container {
  position: relative;
  margin: 2rem 0; /* More margin */
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
  width: 280px; /* Slightly wider cards */
  scroll-snap-align: start;
  border: none; /* Remove default border */
  border-radius: 16px; /* Softer rounded borders */
  padding: 1.5rem; /* More padding */
  background-color: var(--pure-white); /* White card background */
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Fluid animation */
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Elegant shadow */
}

.slider-card:hover {
  transform: translateY(-8px) scale(1.02); /* Lift and slight scale on hover */
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
}

/* Specific styles for category cards */
.categories .slider-card {
  width: 200px; /* Slightly smaller for categories */
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.categories .slider-card img {
  width: 100%;
  height: 140px; /* Taller images for categories */
  object-fit: cover;
  border-radius: 12px; /* Slightly less rounded than card */
  margin-bottom: 0.75rem;
}

/* Styles for navigation buttons */
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(45deg, var(--dark-blue), var(--secondary-blue)); /* Blue gradient */
  color: var(--pure-white);
  border: none;
  border-radius: 50%;
  width: 48px; /* Larger buttons */
  height: 48px;
  font-size: 1.5rem; /* Larger icon */
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slider-button:hover:not(:disabled) {
  background: linear-gradient(45deg, var(--secondary-blue), var(--dark-blue)); /* Inverted gradient on hover */
  transform: translateY(-50%) scale(1.1); /* Subtle scale on hover */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.slider-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--soft-gray); /* Grey out disabled buttons */
  color: #999;
}

.slider-button.prev {
  left: 15px;
}

.slider-button.next {
  right: 15px;
}

/* --- Product Cards --- */
.product-card {
  width: 280px; /* Consistent with slider-card */
  text-decoration: none;
  color: var(--soft-black);
}

.product-image-container {
  position: relative;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 12px; /* Consistent rounded corners */
}

.product-image {
  width: 100%;
  height: 220px; /* Slightly taller product images */
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card:hover .product-image {
  transform: scale(1.08); /* More pronounced scale on product image hover */
}

.product-actions {
  position: absolute;
  bottom: 15px; /* Slightly higher */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem; /* More space between buttons */
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.add-to-cart-button,
.favorite-button {
  padding: 0.6rem; /* Slightly larger buttons */
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; /* Consistent size */
  height: 36px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.add-to-cart-button {
  background: var(--dark-blue); /* Dark blue for add to cart */
  color: var(--pure-white);
}

.add-to-cart-button:hover {
  background: var(--secondary-blue); /* Secondary blue on hover */
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.favorite-button {
  background-color: var(--pure-white);
  color: var(--dark-blue); /* Blue heart outline */
}

.favorite-button.is-favorite {
  color: #e74c3c; /* Red for favorited heart */
  background-color: var(--pure-white); /* Stays white for filled heart */
}

.favorite-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.product-info {
  text-align: left;
}

.price-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.75rem 0; /* More vertical space */
}

.price {
  font-size: 1.4rem; /* Larger price font */
  font-weight: bold;
  color: var(--dark-blue); /* Price in dark blue */
}

.rating {
  color: #ccc; /* Lighter grey for empty stars */
}

.rating .filled {
  color: #f39c12; /* A more vibrant star color */
}

.description {
  color: #666;
  font-size: 0.95rem; /* Slightly larger description */
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Allow 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- Brands Section --- */
.brands {
  margin: 3rem 0;
}

.brand-card {
  width: 180px; /* Consistent with category cards */
  height: 120px; /* Slightly taller */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--pure-white);
  padding: 1rem; /* More padding */
  cursor: pointer;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.brand-card img {
  max-width: 90%; /* Slightly smaller to allow more padding */
  max-height: 90%;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.6; /* More subtle initial opacity */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.brand-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.brand-card:hover img {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.05);
}

/* --- About Section --- */
.about {
  margin: 3rem 0;
  text-align: center;
  padding: 2rem;
  background-color: var(--pure-white);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.about h2 {
  color: var(--dark-blue);
}

.about p {
  max-width: 800px;
  margin: 0.5rem auto 0;
  line-height: 1.6;
  color: var(--soft-black);
}

/* --- Testimonials Section (MODIFICADO) --- */
.testimonials {
  margin: 3rem 0;
  text-align: center;
}

/* Reutiliza los estilos de .slider-container y .slider-list */
/* El .slider-card ya tiene los estilos base, solo ajustamos el width */
.testimonial-card {
  width: 350px; /* Ancho específico para las tarjetas de testimonio */
  border: none; /* Elimina borde duplicado si lo había */
  border-radius: 16px; /* Bordes redondeados consistentes */
  padding: 2rem; /* Más padding para el contenido */
  background-color: var(--pure-white); /* Fondo blanco */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Sombra elegante */
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex; /* Para centrar el contenido verticalmente */
  flex-direction: column;
  justify-content: space-between; /* Empuja el autor hacia abajo */
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.testimonial-card p {
  font-style: italic;
  color: var(--soft-black);
  margin-bottom: 1rem;
  line-height: 1.5;
  text-align: left; /* Alinea el texto del testimonio a la izquierda */
  flex-grow: 1; /* Permite que el párrafo ocupe el espacio disponible */
}

.testimonial-card .author {
  margin-top: 1rem;
  font-weight: bold;
  color: var(--dark-blue);
  font-size: 1.05rem;
  text-align: right; /* Alinea el autor a la derecha */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .slider-card, .product-card, .brand-card {
    width: 250px;
  }
  .testimonial-card {
    width: 300px; /* Ajuste para testimonios en tablets */
  }
}

@media (max-width: 768px) {
  .banner-content h1 {
    font-size: 2.2rem;
  }
  .banner-content p {
    font-size: 1rem;
  }
  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
  .slider-card {
    width: 220px;
  }
  .categories .slider-card {
    width: 160px;
  }
  .product-card {
    width: 220px;
  }
  .brand-card {
    width: 150px;
    height: 100px;
  }
  .testimonial-card {
    width: 260px; /* Ajuste para testimonios en móviles */
  }
  .slider-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 1rem;
  }
  .banner-content h1 {
    font-size: 1.8rem;
  }
  .banner-content p {
    font-size: 0.9rem;
  }
  h2 {
    font-size: 1.6rem;
  }
  .slider-card, .product-card {
    width: 180px;
  }
  .categories .slider-card {
    width: 140px;
  }
  .brand-card {
    width: 120px;
    height: 80px;
  }
  .testimonial-card {
    width: 200px; /* Ajuste para testimonios en móviles muy pequeños */
  }
  .slider-button {
    display: none; /* Hide slider buttons on very small screens, rely on touch scroll */
  }
}
</style>