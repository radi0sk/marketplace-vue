import { createRouter, createWebHistory } from "vue-router";

// Importa tus componentes
import HomePage from "../views/HomePage.vue";
import ShoppingCart from "../views/ShoppingCart.vue";
import SellerPanel from "../views/SellerPanel.vue";
import WholesaleSection from "../views/WholesaleSection.vue";

import ClienteProductDetail from "@/views/cliente/ClienteProductDetail.vue";
import ClienteShoppingCart from "@/components/cliente/ClienteShoppingCart.vue";
import ClienteCheckoutForm from "@/components/cliente/ClienteCheckoutForm.vue";
import ClienteOrderSummary from "@/components/cliente/ClienteOrderSummary.vue";
import MayoristaHome from "@/views/mayorista/MayoristaHome.vue";
import MayoristaProductDetail from "@/views/mayorista/MayoristaProductDetail.vue";
import MayoristaShoppingCart from "@/components/mayorista/MayoristaShoppingCart.vue";
import MayoristaCheckoutForm from "@/components/mayorista/MayoristaCheckoutForm.vue";
import MayoristaOrderSummary from "@/components/mayorista/MayoristaOrderSummary.vue";
import VendedorHome from "@/views/vendedor/VendedorHome.vue";

// Define las rutas
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },

  {
    path: "/cart",
    name: "Cart",
    component: ShoppingCart,
  },
  {
    path: "/seller",
    name: "Seller",
    component: SellerPanel,
  },
  {
    path: "/wholesale",
    name: "Wholesale",
    component: WholesaleSection,
  },
  { path: "/mayorista", component: MayoristaHome },
  { path: "/mayorista/product/:id", component: MayoristaProductDetail },
  { path: "/mayorista/cart", component: MayoristaShoppingCart },
  { path: "/mayorista/checkout", component: MayoristaCheckoutForm },
  { path: "/mayorista/order-summary", component: MayoristaOrderSummary },
  { path: "/product/:id", component: ClienteProductDetail },
  { path: "/cart", component: ClienteShoppingCart },
  { path: "/checkout", component: ClienteCheckoutForm },
  { path: "/order-summary", component: ClienteOrderSummary },
  { path: "/vendedor", component: VendedorHome },
];

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes, // Asegúrate de que 'routes' esté siendo usado aquí
});

export default router;