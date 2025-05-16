<template>
  <div class="profile">
    <h2>Perfil de Usuario</h2>
    <div v-if="user">
      <img :src="user.photoURL" alt="User Photo" class="user-photo" />
      <p><strong>Nombre:</strong> {{ user.displayName }}</p>
      <p><strong>Correo:</strong> {{ user.email }}</p>
    </div>
    <div v-else>
      <p>Cargando perfil...</p>
    </div>
  </div>
</template>

<script>
import { auth } from "@/services/firebase";
import { useToast } from "vue-toastification";

export default {
  name: "UserProfile",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      user: null,
    };
  },
  created() {
    auth.onAuthStateChanged((user) => {
      this.user = user;
      if (!user) {
        this.toast.warning("No hay usuario autenticado");
      }
    }, (error) => {
      this.toast.error("Error al cargar el perfil de usuario");
      console.error("Error loading user profile:", error);
    });
  },
};
</script>


<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.user-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>