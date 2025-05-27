<template>
  <div class="mayorista-request">
    <h3>Solicitud de Cuenta Mayorista</h3>
    <form @submit.prevent="submitRequest">
      <div class="form-group">
        <label>NIT o Identificación Tributaria:</label>
        <input v-model="form.nit" type="text" required />
      </div>
      
      <div class="form-group">
        <label>Volumen estimado de compra mensual (en unidades):</label>
        <input v-model="form.volumenCompra" type="number" min="1" required />
      </div>
      
      <div class="form-group">
        <label>Tiempo estimado entre compras (días):</label>
        <input v-model="form.frecuenciaCompra" type="number" min="1" required />
      </div>
      
      <div class="form-group">
        <label>Razón social o nombre de empresa:</label>
        <input v-model="form.razonSocial" type="text" required />
      </div>
      
      <div class="form-group">
        <label>Documento de identificación (PDF o imagen):</label>
        <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.png" required />
        <small v-if="file">Archivo seleccionado: {{ file.name }}</small>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Enviando...' : 'Enviar Solicitud' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useToast } from 'vue-toastification';
import { uploadFile } from '@/services/storage'; // Necesitarás implementar esto

export default {
  name: 'MayoristaRequest',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      form: {
        nit: '',
        volumenCompra: null,
        frecuenciaCompra: null,
        razonSocial: '',
        documentoUrl: ''
      },
      file: null,
      loading: false
    };
  },
  methods: {
    async handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async submitRequest() {
      this.loading = true;
      try {
        // 1. Subir documento de identificación
        const documentoUrl = await uploadFile(
          `mayorista_docs/${this.userId}/${this.file.name}`,
          this.file
        );
        
        // 2. Crear solicitud en la colección 'mayorista_requests'
        const requestData = {
          userId: this.userId,
          ...this.form,
          documentoUrl,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, 'mayorista_requests'), requestData);
        
        // 3. Actualizar perfil del usuario para mostrar que tiene solicitud pendiente
       await updateDoc(doc(db, 'users', this.userId), {
  mayoristaRequest: 'pending'
});

        
        this.toast.success('Solicitud enviada correctamente. Será revisada por el administrador.');
        this.$emit('request-submitted');
      } catch (error) {
        this.toast.error('Error al enviar la solicitud');
        console.error('Error submitting request:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.mayorista-request {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-submit {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #45a049;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>