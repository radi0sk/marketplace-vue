<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>Perfil de Usuario</h2>
      <div v-if="isEditing" class="edit-buttons">
        <button @click="saveProfile" class="btn-save">Guardar</button>
        <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
      </div>
      <button v-else @click="startEditing" class="btn-edit">Editar Perfil</button>
    </div>

    <div v-if="user" class="profile-content">
      <!-- Sección de información  básica -->
      <div class="profile-section">
        <h3>Información Básica</h3>
        <div class="avatar-section">
          <img :src="user.photoURL || defaultAvatar" alt="User Photo" class="user-avatar" />
          <div v-if="isEditing">
            <input type="file" ref="avatarInput" @change="handleAvatarChange" accept="image/*" style="display: none" />
            <button @click="$refs.avatarInput.click()" class="btn-change-avatar">Cambiar foto</button>
            <div v-if="avatarPreview" class="avatar-preview">
              <img :src="avatarPreview" alt="Preview" class="preview-image" />
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Nombre:</label>
          <input v-if="isEditing" v-model="editableUser.name" type="text" />
          <p v-else>{{ user.name || 'No proporcionado' }}</p>
        </div>
        
        <div class="form-group">
          <label>Correo:</label>
          <p>{{ user.email }}</p>
        </div>
        
        <div class="form-group">
          <label>Teléfono:</label>
          <input v-if="isEditing" v-model="editableUser.telefono" type="tel" />
          <p v-else>{{ user.telefono || 'No proporcionado' }}</p>
        </div>
        
        <div class="form-group">
          <label>Tipo de usuario:</label>
          <select v-if="isEditing" v-model="editableUser.role">
            <option value="cliente">Cliente Normal</option>
            <option value="mayorista">Mayorista</option>
          </select>
          <p v-else>{{ userRoleDisplay }}</p>
        </div>
      </div>

      <!-- Sección de direcciones -->
      <div class="profile-section">
        <h3>Direcciones de Envío</h3>
        <div v-if="user.direccionEnvio" class="address-card">
          <p><strong>Dirección principal:</strong></p>
          <p>{{ user.direccionEnvio.nombre }}</p>
          <p>{{ user.direccionEnvio.direccion }}</p>
          <p>{{ user.direccionEnvio.ciudad }}, {{ user.direccionEnvio.departamento }}</p>
          <p>Código Postal: {{ user.direccionEnvio.codigoPostal }}</p>
          <button v-if="isEditing" @click="editAddress" class="btn-edit-address">Editar Dirección</button>
        </div>
        <div v-else>
          <p>No hay dirección registrada</p>
          <button v-if="isEditing" @click="addAddress" class="btn-add-address">Añadir Dirección</button>
        </div>
      </div>

      <!-- Sección de historial de compras -->
      <div class="profile-section" v-if="user.purchaseHistory && user.purchaseHistory.length > 0">
        <h3>Historial de Compras</h3>
        <div class="order-list">
          <div v-for="orderId in user.purchaseHistory.slice(0, 3)" :key="orderId" class="order-item">
            <p>Orden #{{ orderId }}</p>
            <router-link :to="`/user/orders/${orderId}`">Ver detalles</router-link>
          </div>
          <router-link to="/user/purchase-history" class="view-all">Ver todo el historial</router-link>
        </div>
      </div>

      <!-- Sección de favoritos -->
      <div class="profile-section" v-if="user.favorites && user.favorites.length > 0">
        <h3>Productos Favoritos</h3>
        <div class="favorites-grid">
          <div v-for="productId in user.favorites.slice(0, 4)" :key="productId" class="favorite-item">
            <router-link :to="`/product/${productId}`">
              <img :src="getProductImage(productId)" alt="Producto favorito" class="favorite-image" />
            </router-link>
          </div>
        </div>
        <router-link to="/favorites" class="view-all">Ver todos los favoritos</router-link>
      </div>
    </div>

    <div v-else class="loading-section">
      <p>Cargando perfil...</p>
    </div>

    <!-- Modal para editar dirección -->
    <div v-if="showAddressModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editingAddress ? 'Editar Dirección' : 'Añadir Dirección' }}</h3>
        <div class="form-group">
          <label>Nombre completo:</label>
          <input v-model="addressForm.nombre" type="text" />
        </div>
        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="addressForm.direccion" type="text" />
        </div>
        <div class="form-group">
          <label>Ciudad:</label>
          <input v-model="addressForm.ciudad" type="text" />
        </div>
        <div class="form-group">
          <label>Departamento:</label>
          <input v-model="addressForm.departamento" type="text" />
        </div>
        <div class="form-group">
          <label>Código Postal:</label>
          <input v-model="addressForm.codigoPostal" type="text" />
        </div>
        <div class="form-group">
          <label>Tiempo estimado de entrega (días):</label>
          <input v-model="addressForm.tiempoEntrega" type="number" min="1" />
        </div>
        <div class="modal-buttons">
          <button @click="saveAddress" class="btn-save">Guardar</button>
          <button @click="cancelAddressEdit" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/services/firebase";
import { useToast } from "vue-toastification";
import { uploadImageToCloudinary } from "@/services/cloudinary";
import { 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default {
  name: "UserProfile",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      user: null,
      editableUser: {},
      isEditing: false,
      avatarFile: null,
      avatarPreview: null,
      showAddressModal: false,
      editingAddress: false,
      addressForm: {
        nombre: "",
        direccion: "",
        ciudad: "",
        departamento: "",
        codigoPostal: "",
        tiempoEntrega: 3
      },
      defaultAvatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      favoriteProducts: [],
      loadingFavorites: false
    };
  },
  computed: {
    userRoleDisplay() {
      const roles = {
        'cliente': 'Cliente Normal',
        'mayorista': 'Mayorista',
        'admin': 'Administrador'
      };
      return roles[this.user?.role] || this.user?.role;
    }
  },
  async created() {
    try {
      await this.loadUserProfile();
    } catch (error) {
      console.error("Error in created hook:", error);
      this.toast.error("Error al inicializar el perfil");
    }
  },
  methods: {
    async loadUserProfile() {
      try {
        const auth = await import("@/services/firebase").then(m => m.auth);
        auth.onAuthStateChanged(async (authUser) => {
          if (authUser) {
            const userDoc = await getDoc(doc(db, "users", authUser.uid));
            if (userDoc.exists()) {
              this.user = {
                ...authUser,
                ...userDoc.data()
              };
              this.editableUser = { ...this.user };
              await this.loadFavoriteProducts();
            } else {
              this.user = authUser;
              this.editableUser = { ...authUser };
            }
          } else {
            this.toast.warning("No hay usuario autenticado");
          }
        });
      } catch (error) {
        this.toast.error("Error al cargar el perfil de usuario");
        console.error("Error loading user profile:", error);
        throw error; // Re-lanzamos el error para que pueda ser capturado por el creado
      }
    },
    
    async loadFavoriteProducts() {
      if (!this.user?.favorites?.length) {
        this.favoriteProducts = [];
        return;
      }
      
      this.loadingFavorites = true;
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("__name__", "in", this.user.favorites.slice(0, 4)));
        const snapshot = await getDocs(q);
        
        this.favoriteProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        this.toast.error("Error al cargar productos favoritos");
      } finally {
        this.loadingFavorites = false;
      }
    },
    
    getProductImage(productId) {
  if (!this.favoriteProducts || this.favoriteProducts.length === 0) {
    return this.defaultAvatar;
  }
  
  const product = this.favoriteProducts.find(p => p.id === productId);
  
  // Si encontramos el producto y tiene imagen principal, la devolvemos
  if (product?.mainImage) {
    return product.mainImage;
  }
  
  // Si el producto tiene imágenes pero no mainImage, tomamos la primera
  if (product?.images?.length > 0) {
    return product.images[0];
  }
  
  // Si no hay imágenes, devolvemos la imagen por defecto
  return this.defaultAvatar;
},
    
    startEditing() {
      this.isEditing = true;
    },
    
    cancelEdit() {
      this.isEditing = false;
      this.editableUser = { ...this.user };
      this.avatarFile = null;
      this.avatarPreview = null;
    },
    
    async saveProfile() {
      try {
        // Actualizar foto de perfil si hay una nueva
        if (this.avatarFile) {
          const photoURL = await uploadImageToCloudinary(this.avatarFile);
          this.editableUser.photoURL = photoURL;
        }
        
        // Actualizar datos en Firestore
        const userRef = doc(db, "users", this.user.uid);
        await updateDoc(userRef, {
          name: this.editableUser.name,
          telefono: this.editableUser.telefono,
          role: this.editableUser.role,
          ...(this.editableUser.photoURL && { photoURL: this.editableUser.photoURL })
        });
        
        // Actualizar datos locales
        this.user = {
          ...this.user,
          name: this.editableUser.name,
          telefono: this.editableUser.telefono,
          role: this.editableUser.role,
          ...(this.editableUser.photoURL && { photoURL: this.editableUser.photoURL })
        };
        
        this.isEditing = false;
        this.toast.success("Perfil actualizado correctamente");
      } catch (error) {
        this.toast.error("Error al actualizar el perfil");
        console.error("Error updating profile:", error);
      }
    },
    
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.avatarFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.avatarPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    editAddress() {
      this.editingAddress = true;
      this.addressForm = { ...this.user.direccionEnvio };
      this.showAddressModal = true;
    },
    
    addAddress() {
      this.editingAddress = false;
      this.addressForm = {
        nombre: this.user.name || "",
        direccion: "",
        ciudad: "",
        departamento: "",
        codigoPostal: "",
        tiempoEntrega: 3
      };
      this.showAddressModal = true;
    },
    
    async saveAddress() {
      try {
        const userRef = doc(db, "users", this.user.uid);
        await updateDoc(userRef, {
          direccionEnvio: this.addressForm
        });
        
        this.user.direccionEnvio = this.addressForm;
        this.showAddressModal = false;
        this.toast.success("Dirección guardada correctamente");
      } catch (error) {
        this.toast.error("Error al guardar la dirección");
        console.error("Error saving address:", error);
      }
    },
    
    cancelAddressEdit() {
      this.showAddressModal = false;
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.profile-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-edit, .btn-save, .btn-cancel, .btn-change-avatar, .btn-edit-address, .btn-add-address {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-edit {
  background-color: #4CAF50;
  color: white;
}

.btn-save {
  background-color: #2196F3;
  color: white;
  margin-right: 0.5rem;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-change-avatar {
  background-color: #FF9800;
  color: white;
  display: block;
  margin-top: 0.5rem;
}

.btn-edit-address, .btn-add-address {
  background-color: #9C27B0;
  color: white;
  margin-top: 1rem;
}

.avatar-preview {
  margin-top: 1rem;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.address-card {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.order-list {
  margin-top: 1rem;
}

.order-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.favorite-item {
  aspect-ratio: 1/1;
}

.favorite-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.view-all {
  display: inline-block;
  margin-top: 1rem;
  color: #2196F3;
  text-decoration: none;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.loading-section {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>