<template>
  <div class="product-detail">
    <!-- Galería de imágenes (izquierda) -->
    <div class="product-gallery">
      <img :src="mainImage" :alt="product.name" class="main-image">
      <div v-if="product.images?.length > 1" class="thumbnails">
        <img 
          v-for="(img, i) in product.images" 
          :key="i"
          :src="img"
          @click="mainImage = img"
          :class="{ active: img === mainImage }"
          class="thumbnail"
        >
      </div>
    </div>

    <!-- Información del producto  (derecha) -->
    <div class="product-info">
      <div class="product-header">
        <span class="category">{{ product.category }}</span>
        <h1>{{ product.name }}</h1>
        <span class="sku">SKU: {{ product.sku || 'N/A' }}</span>
      </div>

      <div class="price-section">
        <span class="price">${{ product.price.toFixed(2) }}</span>
        <span class="iva">Precios incluyen IVA</span>
      </div>

      <div class="quantity-selector">
        <label>Cantidad:</label>
        <div class="qty-controls">
          <button @click="quantity > 1 ? quantity-- : null" :disabled="quantity <= 1">-</button>
          <input type="number" v-model.number="quantity" min="1">
          <button @click="quantity++">+</button>
        </div>
      </div>

      <button @click="addToCart" class="btn primary">
        Añadir al carrito
      </button>
      <button 
        @click="toggleFavorite" 
        class="favorite-btn"
        :class="{ 'is-favorite': isFavorite }"
      >
        <i class="fas" :class="isFavorite ? 'fa-heart' : 'fa-heart-o'"></i>
        {{ isFavorite ? 'En favoritos' : 'Agregar a favoritos' }}
      </button>

      <button @click="contactAdvisor" class="btn secondary">
        Hablar con un asesor
      </button>

     

      <!-- Descripción y detalles -->
      <div class="product-details">
        <h2>{{ product.name }}</h2>
        <div class="description" v-html="product.description"></div>
        
        <div v-if="product.specifications?.length" class="specs">
          <h3>Especificaciones:</h3>
          <ul>
            <li v-for="(spec, i) in product.specifications" :key="i">
              <strong>{{ spec.key }}:</strong> {{ spec.value }}
            </li>
          </ul>
        </div>

        <div class="shipping-info">
          <h3>Tipo de envío:</h3>
          <p>{{ product.shippingType || 'Cobrar' }}</p>
          <div class="notes">
            <p>Confirmar con tu asesor tiempo de entrega final.</p>
            <p>Producto bajo pedido por favor preguntar por existencias y tiempo de entrega.</p>
            <p>Por política de las paqueterías no se hacen envíos a zonas extendidas, el paquete llegará a la sucursal más cercana para su recolección.</p>
            <p>La empresa asignará la paquetería y el tiempo estimado de llegada corre por cuenta de la misma.</p>
          </div>
        </div>

        <div class="payment-methods">
          <h3>Métodos de pago</h3>
          <div class="method-icons">
            <div class="method">
              <font-awesome-icon :icon="icons.cash" />
              <span>Efectivo</span>
            </div>
            <div class="method">
              <font-awesome-icon :icon="icons.collect" />
              <span>Cobrar</span>
            </div>
            <div class="method">
              <font-awesome-icon :icon="icons.bank" />
              <span>Transferencia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useToast } from "vue-toastification";
import { 
  faMoneyBillWave as cashIcon,
  faHandHoldingUsd as collectIcon,
  faUniversity as bankIcon
} from '@fortawesome/free-solid-svg-icons';

export default {
  name: "ClienteProductDetail",
  data() {
    return {
      product: {
        name: "",
        price: 0,
        images: [],
        specifications: [],
        shippingType: "Cobrar"
      },
      quantity: 1,
      mainImage: "",
      icons: {
        cash: cashIcon,
        collect: collectIcon,
        bank: bankIcon
      },
      isFavorite: false,
      loadingFavorite: false
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    try {
      const productId = this.$route.params.id;
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.product = { id: docSnap.id, ...docSnap.data() };
        if (this.product.images?.length) {
          this.mainImage = this.product.images[0];
        }
        await this.checkIfFavorite();
      } else {
        this.toast.error("Producto no encontrado");
      }
    } catch (error) {
      this.toast.error("Error al cargar el producto");
      console.error("Error fetching product:", error);
    }
  },
  methods: {
    async checkIfFavorite() {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const favorites = userDoc.data().favorites || [];
          this.isFavorite = favorites.includes(this.product.id);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    }, async toggleFavorite() {
      if (this.loadingFavorite) return;
      this.loadingFavorite = true;
      
      const user = auth.currentUser;
      if (!user) {
        this.toast.error("Debes iniciar sesión para agregar a favoritos");
        this.loadingFavorite = false;
        return;
      }
      
      try {
        const userRef = doc(db, "users", user.uid);
        
        if (this.isFavorite) {
          // Remover de favoritos
          await updateDoc(userRef, {
            favorites: arrayRemove(this.product.id)
          });
          this.toast.success("Producto eliminado de favoritos");
        } else {
          // Agregar a favoritos
          await updateDoc(userRef, {
            favorites: arrayUnion(this.product.id)
          });
          this.toast.success("Producto agregado a favoritos");
        }
        
        this.isFavorite = !this.isFavorite;
      } catch (error) {
        console.error("Error updating favorites:", error);
        this.toast.error("Error al actualizar favoritos");
      } finally {
        this.loadingFavorite = false;
      }
    },
    addToCart() {
      if (!this.$store) {
        this.toast.error("Error al agregar al carrito");
        console.error("Vuex store no está disponible.");
        return;
      }

      this.$store.dispatch("addToCart", {
        ...this.product,
        quantity: this.quantity
      });
      
      this.toast.success(`${this.product.name} (${this.quantity}) agregado al carrito`);
    },
    contactAdvisor() {
      this.toast.info("Un asesor se pondrá en contacto contigo pronto");
    }
  }
};
</script>

<style scoped>
.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.favorite-btn:hover {
  background-color: #e0e0e0;
}

.favorite-btn.is-favorite {
  background-color: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
}

.favorite-btn i {
  font-size: 1.2rem;
}

.favorite-btn.is-favorite i {
  color: #c62828;
}
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.product-gallery {
  position: sticky;
  top: 1rem;
  align-self: start;
}

.main-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumbnail:hover {
  border-color: #42b983;
}

.thumbnail.active {
  border: 2px solid #42b983;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category {
  color: #666;
  font-size: 0.9rem;
}

h1 {
  font-size: 1.8rem;
  margin: 0;
  color: #333;
}

.sku {
  color: #777;
  font-size: 0.9rem;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.iva {
  font-size: 0.9rem;
  color: #666;
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qty-controls {
  display: flex;
  align-items: center;
}

.qty-controls button {
  width: 2rem;
  height: 2rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  font-size: 1rem;
  cursor: pointer;
}

.qty-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-controls input {
  width: 3rem;
  height: 2rem;
  text-align: center;
  margin: 0 0.5rem;
  border: 1px solid #ddd;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #42b983;
  color: white;
}

.btn.primary:hover {
  background-color: #3aa876;
}

.btn.secondary {
  background-color: #2c3e50;
  color: white;
}

.btn.secondary:hover {
  background-color: #1a252f;
}

.payment-options {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 0.25rem;
}

.payment-options small {
  font-size: 0.8rem;
  color: #666;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

h2, h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.2rem;
}

.description {
  line-height: 1.6;
}

.specs ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.specs li {
  margin-bottom: 0.5rem;
}

.shipping-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.25rem;
}

.notes p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #555;
}

.payment-methods {
  margin-top: 1.5rem;
}

.method-icons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
}

.method svg {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
  
  .product-gallery {
    position: static;
  }
}
</style>