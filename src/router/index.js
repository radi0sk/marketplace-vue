import { createRouter, createWebHistory } from "vue-router";
import { auth, db } from '@/services/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Importaciones de componentes
const HomePage = () => import('@/views/HomePage.vue');
const ProductsPage = () => import('@/views/ProductsPage.vue');
const ShoppingCart = () => import('@/views/ShoppingCart.vue');
const LoginPage = () => import('@/views/Auth/LoginPage.vue');
const Pagar = () => import('@/views/Pagar.vue');
const Confirmacion = () => import('@/components/Confirmacion.vue');

// Componentes de cliente
const ClienteProductDetail = () => import('@/views/cliente/ClienteProductDetail.vue');
import PaymentOptions from '../views/PaymentOptions.vue';
import EnvioPaqueteria from "../views/envioPaqueteria.vue";
import ContactoInstitucional from "@/views/contactoInstitucional.vue";
import NosotrosInstitucional from "@/views/nosotrosInstitucional.vue";


// Componentes de usuario
const Profile = () => import('@/views/user/Profile.vue');
const FavoritesView = () => import('@/views/user/FavoritesView.vue');
const PurchaseHistory = () => import('@/views/user/PurchaseHistory.vue');
const UserOrderDetail = () => import('@/views/user/OrderDetail.vue');

// Componentes de admin
import AdminBannerManager from '../views/admin/AdminBannerManager.vue';
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue');
const ProductManagement = () => import('@/views/admin/ProductManagement.vue');
const AddProduct = () => import('@/views/admin/AddProduct.vue');
const EditProduct = () => import('@/views/admin/EditProduct.vue');
const OrderManagement = () => import('@/views/admin/OrderManagement.vue');
const AdminOrderDetail = () => import('@/views/admin/OrderDetail.vue');
const SalesStatistics = () => import('@/views/admin/SalesStatistics.vue');


const routes = [
  // Rutas públicas
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { title: "Inicio" }
  },
  {
    path: "/products",
    name: "Products",
    component: ProductsPage,
    meta: { title: "Productos" }
  },
  {
    path: '/pagos',
    name: 'Pagos',
    component: PaymentOptions
  },
  {
    path: '/contacto',
    name: 'contacto',
    component: ContactoInstitucional
  },
   {
    path: '/nosotros',
    name: 'nosostros',
    component: NosotrosInstitucional
  },
   {
    path: '/envioPaqueteria',
    name: 'envioPaqueteria',
    component: EnvioPaqueteria
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: ClienteProductDetail,
    meta: { title: "Detalle del Producto" }
  },
 
  {
    path: "/cart",
    name: "Cart",
    component: ShoppingCart,
    meta: { title: "Carrito de Compras" }
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { title: "Iniciar Sesión", requiresGuest: true }
  },

  // Rutas de usuario autenticado
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { title: "Perfil", requiresAuth: true }
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesView,
    meta: { title: "Favoritos", requiresAuth: true }
  },
  {
    path: "/purchase-history",
    name: "PurchaseHistory",
    component: PurchaseHistory,
    meta: { title: "Historial de Compras", requiresAuth: true }
  },
  {
    path: "/orden/:id",
    name: "UserOrderDetail",
    component: UserOrderDetail,
    meta: { title: "Detalle de Orden", requiresAuth: true },
    props: true
  },
  {
    path: "/pagar",
    name: "Pagar",
    component: Pagar,
    meta: { title: "Pagar", requiresAuth: true }
  },
  {
    path: "/confirmacion",
    name: "Confirmacion",
    component: Confirmacion,
    meta: { title: "Confirmación", requiresAuth: true },
    props: true
  },

  // Rutas de administrador
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { title: "Panel de Administración", requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "products",
        name: "ProductManagement",
        component: ProductManagement,
        meta: { title: "Gestión de Productos" }
      },
      // En el children del AdminDashboard
{
  path: "/admin/brands",
  name: "BrandManagement",
  component: () => import('@/views/admin/BrandManagement.vue'),
  meta: { title: "Gestión de Marcas" }
},
{
  path: "/admin/brands/add",
  name: "AddBrand",
  component: () => import('@/views/admin/AddBrand.vue'),
  meta: { title: "Agregar Marca" }
},
{
  path: "/admin/brands/edit/:id",
  name: "EditBrand",
  component: () => import('@/views/admin/EditBrand.vue'),
  meta: { title: "Editar Marca" },
  props: true
},
{
    path: '/admin/banner', // This will be your admin path
    name: 'AdminBannerManager',
    component: AdminBannerManager,
    // meta: { requiresAuth: true, requiresAdmin: true } // Add meta fields for auth/admin guards
  },
      {
        path: "products/add",
        name: "AddProduct",
        component: AddProduct,
        meta: { title: "Agregar Producto" }
      },
      {
        path: "products/edit/:id",
        name: "EditProduct",
        component: EditProduct,
        meta: { title: "Editar Producto" },
        props: true
      },
      {
        path: "orders",
        name: "OrderManagement",
        component: OrderManagement,
        meta: { title: "Gestión de Pedidos" }
      },
      {
        path: "orders/:id",
        name: "AdminOrderDetail",
        component: AdminOrderDetail,
        meta: { title: "Detalle de Pedido" },
        props: true
      },
      {
        path: "sales-statistics",
        name: "SalesStatistics",
        component: SalesStatistics,
        meta: { title: "Estadísticas de Ventas" }
      }
    ]
  },

  // Redirección para rutas no encontradas
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});

// Guardia de navegación para autenticación y roles
// En index.js, reemplaza el beforeEach actual con este:

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  
  // Verificar estado de autenticación
  const currentUser = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });

  // Obtener rol del usuario si está autenticado
  let userRole = null;
  if (currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      userRole = userDoc.exists() ? userDoc.data().role : 'cliente';
    } catch (error) {
      console.error('Error obteniendo rol del usuario:', error);
      userRole = 'cliente';
    }
  }

  // Lógica de redirección
  if (requiresGuest && currentUser) {
    next('/'); // Usuario autenticado no puede acceder a páginas de invitado
  } else if (requiresAuth && !currentUser) {
    next('/login'); // Usuario no autenticado intentando acceder a página protegida
  } else if (requiresAdmin && userRole !== 'admin') {
    next('/'); // Usuario no admin intentando acceder a página de admin
  } else {
    next(); // Todo en orden, permitir navegación
  }
});

// Cambiar el título de la página según la ruta
router.afterEach((to) => {
  const title = to.meta.title || 'Marketplace';
  document.title = `${title} | Marketplace`;
});

export default router;