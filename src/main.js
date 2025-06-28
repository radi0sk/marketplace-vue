import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from './store';
import Toast from 'vue-toastification';

import 'vue-toastification/dist/index.css';
import { auth, db } from "@/services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faCartPlus, 
  faCheckCircle, 
  faSpinner,
  faHeart, 
  faShoppingCart, 
  faSearch, 
  faEye,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Configuración de iconos (asegúrate de incluir farHeart)
library.add(
  faCartPlus, 
  faCheckCircle, 
  faSpinner, 
  faHeart, 
  farHeart,  // <-- ¡Este es el que faltaba!
  faShoppingCart, 
  faSearch,
  faEye,
  faCalendarAlt
);

const app = createApp(App);



// Resto de tu configuración...
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  icon: true
});

app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
app.use(store);

app.mount("#app");

auth.onAuthStateChanged((user) => {
  if (user) {
    updateDoc(doc(db, "users", user.uid), {
      visitCount: increment(1),
    });
  }
});