<template>
  <div class="admin-banner-manager">
    <h2>Gestionar Banners de la Página Principal</h2>

    <button class="add-new-button" @click="openAddBannerForm">
      Agregar Nuevo Banner
    </button>

    <div v-if="banners.length === 0 && !isLoading">
      <p>No hay banners creados aún. ¡Empieza agregando uno!</p>
    </div>

    <div class="banner-list-container" v-if="banners.length > 0 && !isLoading">
      <h3>Banners Existentes</h3>
      <div class="banner-cards-grid">
        <div class="banner-card" v-for="banner in banners" :key="banner.id">
          <img :src="banner.imageUrl || 'https://via.placeholder.com/150?text=No+Image'" alt="Banner Image" class="banner-card-image" />
          <div class="banner-card-content">
            <h4>{{ banner.title }}</h4>
            <p>{{ banner.description }}</p>
            <div class="banner-card-actions">
              <button class="edit-button" @click="openEditBannerForm(banner)">
                Editar
              </button>
              <button class="delete-button" @click="deleteBanner(banner.id, banner.imageUrl)">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="banner-form-modal-overlay" v-if="showBannerForm">
      <div class="banner-form-modal">
        <h3>{{ editingBannerId ? 'Editar Banner' : 'Agregar Nuevo Banner' }}</h3>
        <form @submit.prevent="saveBanner">
          <div class="form-group">
            <label for="bannerTitle">Título del Banner:</label>
            <input type="text" id="bannerTitle" v-model="currentBanner.title" required />
          </div>

          <div class="form-group">
            <label for="bannerDescription">Descripción del Banner:</label>
            <textarea id="bannerDescription" v-model="currentBanner.description" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label for="ctaText">Texto del Botón CTA:</label>
            <input type="text" id="ctaText" v-model="currentBanner.ctaButtonText" required />
          </div>

          <div class="form-group">
            <label for="ctaLink">Enlace del Botón CTA:</label>
            <input type="text" id="ctaLink" v-model="currentBanner.ctaButtonLink" required />
          </div>

          <div class="form-group">
            <label for="bannerOrder">Orden (para el carrusel):</label>
            <input type="number" id="bannerOrder" v-model.number="currentBanner.order" min="1" />
            <small>Los banners se ordenarán de menor a mayor.</small>
          </div>

          <div class="form-group">
            <label for="bannerImage">Imagen del Banner:</label>
            <input type="file" id="bannerImage" @change="handleImageUpload" accept="image/*" />
            <p v-if="currentBanner.imageUrl">
              Imagen actual: <a :href="currentBanner.imageUrl" target="_blank">{{ currentBanner.imageUrl }}</a>
            </p>
            <img v-if="currentBanner.imageUrl" :src="currentBanner.imageUrl" alt="Banner Preview" class="image-preview" />
          </div>

          <div class="form-actions">
            <button type="submit" class="save-button" :disabled="isSaving">
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button type="button" class="cancel-button" @click="closeBannerForm">
              Cancelar
            </button>
            <button type="button" class="delete-image-button" @click="deleteCurrentImage" v-if="currentBanner.imageUrl && editingBannerId" :disabled="isSaving">
              Eliminar Imagen
            </button>
          </div>
        </form>
      </div>
    </div>
    <p v-if="isLoading">Cargando banners...</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { db } from "@/services/firebase"; // Make sure firebase.js exports 'db'
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"; // Added addDoc, updateDoc, deleteDoc, query, orderBy
import { useToast } from "vue-toastification";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/services/cloudinary'; // Import Cloudinary services

export default {
  name: "AdminBannerManager",
  data() {
    return {
      banners: [],
      currentBanner: { // Holds data for the banner being added/edited
        title: "",
        description: "",
        ctaButtonText: "",
        ctaButtonLink: "",
        imageUrl: "",
        order: 1, // Default order
      },
      selectedFile: null,
      editingBannerId: null, // Stores the ID of the banner being edited
      showBannerForm: false,
      isSaving: false,
      isLoading: false,
      error: null,
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    this.fetchBanners();
  },
  methods: {
    async fetchBanners() {
      this.isLoading = true;
      this.error = null;
      try {
        const bannersCollectionRef = collection(db, "banners");
        const q = query(bannersCollectionRef, orderBy("order", "asc")); // Order by the 'order' field
        const querySnapshot = await getDocs(q);
        this.banners = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching banners:", error);
        this.error = "Error al cargar los banners.";
        this.toast.error("Error al cargar los banners.");
      } finally {
        this.isLoading = false;
      }
    },
    openAddBannerForm() {
      this.editingBannerId = null;
      this.currentBanner = {
        title: "",
        description: "",
        ctaButtonText: "",
        ctaButtonLink: "",
        imageUrl: "",
        order: (this.banners.length > 0 ? Math.max(...this.banners.map(b => b.order || 0)) + 1 : 1), // Suggest next order
      };
      this.selectedFile = null;
      this.showBannerForm = true;
    },
    openEditBannerForm(banner) {
      this.editingBannerId = banner.id;
      // Create a deep copy to avoid direct mutation before saving
      this.currentBanner = { ...banner };
      this.selectedFile = null; // No file selected initially for editing
      this.showBannerForm = true;
    },
    closeBannerForm() {
      this.showBannerForm = false;
      this.editingBannerId = null;
      this.selectedFile = null;
      this.currentBanner = { // Reset form data
        title: "",
        description: "",
        ctaButtonText: "",
        ctaButtonLink: "",
        imageUrl: "",
        order: 1,
      };
    },
    handleImageUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        // Optional: display a local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentBanner.imageUrl = e.target.result; // Temporarily show local preview
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        // If file input is cleared, clear the local preview, but keep existing Cloudinary URL if editing
        if (!this.editingBannerId) { // Only clear if adding new and no file selected
          this.currentBanner.imageUrl = "";
        }
      }
    },
    async saveBanner() {
      this.isSaving = true;
      this.error = null;
      try {
        let imageUrlToSave = this.currentBanner.imageUrl;

        // If a new file is selected, upload it
        if (this.selectedFile) {
          // If editing and existing image URL is present, delete the old one from Cloudinary
          if (this.editingBannerId && this.currentBanner.imageUrl && this.currentBanner.imageUrl.startsWith('http')) {
            try {
              const parts = this.currentBanner.imageUrl.split('/');
              const filenameWithExtension = parts[parts.length - 1];
              const publicId = filenameWithExtension.split('.')[0];
              await deleteImageFromCloudinary(publicId);
              this.toast.info("Imagen anterior eliminada de Cloudinary.");
            } catch (deleteError) {
              console.warn("Could not delete old image from Cloudinary (might not exist or bad publicId):", deleteError);
              this.toast.warning("No se pudo eliminar la imagen anterior de Cloudinary, pero se actualizará la nueva.");
            }
          }
          imageUrlToSave = await uploadImageToCloudinary(this.selectedFile);
          this.toast.success("Nueva imagen subida exitosamente.");
          this.selectedFile = null;
        }

        const bannerData = {
          title: this.currentBanner.title,
          description: this.currentBanner.description,
          ctaButtonText: this.currentBanner.ctaButtonText,
          ctaButtonLink: this.currentBanner.ctaButtonLink,
          imageUrl: imageUrlToSave,
          order: this.currentBanner.order || 1, // Ensure order is a number, default to 1
        };

        if (this.editingBannerId) {
          // Update existing banner
          const bannerRef = doc(db, "banners", this.editingBannerId);
          await updateDoc(bannerRef, bannerData);
          this.toast.success("Banner actualizado exitosamente!");
        } else {
          // Add new banner
          await addDoc(collection(db, "banners"), bannerData);
          this.toast.success("Nuevo banner agregado exitosamente!");
        }

        this.closeBannerForm();
        await this.fetchBanners(); // Refresh the list
      } catch (error) {
        console.error("Error saving banner:", error);
        this.error = "Error al guardar el banner.";
        this.toast.error("Error al guardar el banner.");
      } finally {
        this.isSaving = false;
      }
    },
    async deleteBanner(bannerId, imageUrl) {
      if (!confirm("¿Estás seguro de que quieres eliminar este banner? Esta acción es irreversible.")) {
        return;
      }

      this.isSaving = true; // Use isSaving to disable buttons during operation
      try {
        // Attempt to delete image from Cloudinary first if it exists
        if (imageUrl && imageUrl.startsWith('http')) {
          try {
            const parts = imageUrl.split('/');
            const filenameWithExtension = parts[parts.length - 1];
            const publicId = filenameWithExtension.split('.')[0];
            await deleteImageFromCloudinary(publicId);
            this.toast.info("Imagen del banner eliminada de Cloudinary.");
          } catch (imageDeleteError) {
            console.warn("Could not delete banner image from Cloudinary:", imageDeleteError);
            this.toast.warning("No se pudo eliminar la imagen del banner de Cloudinary, pero se eliminará el registro.");
          }
        }

        await deleteDoc(doc(db, "banners", bannerId));
        this.toast.success("Banner eliminado exitosamente.");
        await this.fetchBanners(); // Refresh the list
      } catch (error) {
        console.error("Error deleting banner:", error);
        this.error = "Error al eliminar el banner.";
        this.toast.error("Error al eliminar el banner.");
      } finally {
        this.isSaving = false;
      }
    },
    async deleteCurrentImage() {
      // For deleting an image while editing a banner without saving the banner itself
      if (!this.currentBanner.imageUrl || !this.editingBannerId) {
        this.toast.info("No hay imagen para eliminar o no estás editando un banner existente.");
        return;
      }

      const confirmDelete = confirm("¿Estás seguro de que quieres eliminar la imagen de este banner? Deberás guardar los cambios para que se aplique.");
      if (!confirmDelete) {
        return;
      }

      this.isSaving = true; // Indicate operation in progress
      try {
        const parts = this.currentBanner.imageUrl.split('/');
        const filenameWithExtension = parts[parts.length - 1];
        const publicId = filenameWithExtension.split('.')[0];

        await deleteImageFromCloudinary(publicId);
        this.currentBanner.imageUrl = ""; // Clear the URL in the local form data
        this.selectedFile = null; // Clear any pending file selection

        this.toast.success("Imagen eliminada de Cloudinary. ¡No olvides Guardar los cambios!");
      } catch (error) {
        console.error("Error deleting current image:", error);
        this.toast.error("Error al eliminar la imagen actual.");
      } finally {
        this.isSaving = false;
      }
    }
  },
};
</script>

<style scoped>
.admin-banner-manager {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
}

.add-new-button {
  display: block;
  width: auto;
  margin: 0 auto 2rem auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.add-new-button:hover {
  background-color: #0056b3;
}

.banner-list-container {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.banner-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.banner-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

.banner-card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.banner-card-content {
  padding: 1rem;
  flex-grow: 1;
}

.banner-card-content h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.2rem;
}

.banner-card-content p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.banner-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto; /* Push actions to the bottom */
}

.edit-button,
.delete-button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.edit-button {
  background-color: #28a745; /* Green */
  color: white;
}

.edit-button:hover {
  background-color: #218838;
}

.delete-button {
  background-color: #dc3545; /* Red */
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

/* Modal Overlay and Form Styles */
.banner-form-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.banner-form-modal {
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh; /* Limit height */
  overflow-y: auto; /* Enable scrolling for long forms */
}

.banner-form-modal h3 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input[type="file"] {
  padding: 0.5rem 0;
}

.image-preview {
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  max-height: 200px; /* Limit preview height */
  object-fit: contain; /* Ensure image fits */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 2rem;
}

.save-button,
.cancel-button,
.delete-image-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.save-button {
  background-color: #4CAF50; /* Green */
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #6c757d; /* Gray */
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.delete-image-button {
  background-color: #f44336; /* Red */
  color: white;
}

.delete-image-button:hover {
  background-color: #da190b;
}

small {
  color: #888;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.2rem;
}
</style>