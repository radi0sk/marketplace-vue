import { createApp } from "vue";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from "./App.vue";
import router from "./router";
import Toast from 'vue-toastification';

// Plugins and Styles
import 'vue-toastification/dist/index.css';
import './assets/main.css';

// Firebase
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, increment } from "firebase/firestore";

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faCartPlus, 
  faCheckCircle, 
  faSpinner,
  faHeart, 
  faShoppingCart, 
  faSearch, 
  faEye,
  faCalendarAlt,
  faThLarge,
  faTag,
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faCaretDown,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { 
  faFacebook, 
  faInstagram, 
  faTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faCartPlus, 
  faCheckCircle, 
  faSpinner, 
  faHeart, 
  farHeart,
  faShoppingCart, 
  faSearch,
  faEye,
  faCalendarAlt,
  faThLarge,
  faTag,
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faCaretDown,
  faStar,
  faFacebook,
  faInstagram,
  faTwitter
);

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
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

app.mount("#app");

// Global Auth Tracking
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateDoc(doc(db, "users", user.uid), {
      visitCount: increment(1),
    });
  }
});