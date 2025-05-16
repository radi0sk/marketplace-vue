import { createRouter, createWebHistory } from "vue-router";

// Importa tus componentes
import HomePage               from "../views/HomePage.vue";
import ShoppingCart           from "../views/ShoppingCart.vue";

import ClienteProductDetail   from "@/views/cliente/ClienteProductDetail.vue";

import AdminDashboard         from "@/views/admin/AdminDashboard.vue";
import ProductManagement      from "@/views/admin/ProductManagement.vue";
import PopularProducts        from "@/views/admin/PopularProducts.vue";
import OutOfStockProducts     from "@/views/admin/OutOfStockProducts.vue";

import LoginPage              from "@/views/Auth/LoginPage.vue";
import ClienteShoppingCart    from "@/components/cliente/ClienteShoppingCart.vue";
import ClienteCheckoutForm    from "@/components/cliente/ClienteCheckoutForm.vue";
import ClienteOrderSummary    from "@/components/cliente/ClienteOrderSummary.vue";
import ProductsPage from '@/views/ProductsPage.vue';
import Confirmacion from '../components/Confirmacion.vue';


import SearchPage from '@/components/cliente/SearchPage.vue';



// Define las rutas
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: '/products',  // La URL que quieres manejar
    name: 'Products',   // Un nombre para referenciarla fácilmente
    component: ProductsPage,  // El componente que se mostrará
  },
  {
    path: "/cart",
    name: "Cart",
    component: ShoppingCart,
  },
  {
    path: '/search', // Ruta de la página de búsqueda
    name: 'Search',
    component: SearchPage, // Asocia esta ruta al componente SearchPage
  },
  {
    path: '/ProductManagement', // Ruta de la página de gestión de productos
    name: 'ProductManagement',
    component: ProductManagement, // Asocia esta ruta al componente ProductManagement
  },
  {
    path: '/pagar',
    name: 'Pagar',
    component: () => import('@/views/Pagar.vue'),
  },
  


  
  { path: "/product/:id", component: ClienteProductDetail },
  {
    path: '/confirmacion',
    name: 'Confirmacion',
    component: Confirmacion,
    props: true // Esto permite pasar props mediante la ruta
  },
  { path: "/cart", component: ClienteShoppingCart },
  { path: "/checkout", component: ClienteCheckoutForm },
  { path: "/order-summary", component: ClienteOrderSummary },
  {
    path: '/orden/:id',
    name: 'DetalleOrden',
    component: () => import('@/views/user/OrderDetail.vue'), // Asegúrate de crear este componente
    props: true
  },

  { path: "/login", component: LoginPage },
  { path: "/profile",
    name: "Profile", component: () => import("@/views/user/Profile.vue"), },
  { path: "/purchase-history",
    name: "PurchaseHistory",  component: () => import("@/views/user/PurchaseHistory.vue"),},
  {
      path: "/favorites",
      name: "Favorites",
      component: () => import("@/views/user/Profile.vue"),
    },
  {
      path: "/purchase-history",
      name: "PurchaseHistory",
      component: () => import("@/views/user/PurchaseHistory.vue"),
    },
    {
      path: "/admin",
      component: AdminDashboard,
      children: [
        { path: "products", component: ProductManagement },
        { path: "products/add", component: () => import("@/views/admin/AddProduct.vue") },
        { 
          path: "products/edit/:id", 
          name: "EditProduct",
          component: () => import("@/views/admin/EditProduct.vue"),
          props: true
        },
        { 
          path: "orders", 
          component: () => import("@/views/admin/OrderManagement.vue") 
        },
        { 
          path: "orders/:id", 
          name: "OrderDetail",
          component: () => import("@/views/admin/OrderDetail.vue"),
          props: true
        },
        { path: "sales-statistics", component: () => import("@/views/admin/SalesStatistics.vue") },
        { path: "popular-products", component: PopularProducts },
        { path: "out-of-stock", component: OutOfStockProducts },
      ],
    },
    

];

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes, // Asegúrate de que 'routes' esté siendo usado aquí
});

export default router;