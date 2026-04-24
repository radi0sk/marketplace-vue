export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  mainImage?: string;
  categoria: string;
  lineaProduccion?: string;
  especieCultivo?: string[];
  etapaVida?: string;
  ingredienteActivo?: string;
  dosis?: string;
  periodoCarencia?: string;
  marcaFabricante?: string;
  stock?: number;
  features?: { name: string; value: string }[];
  status?: string;
  createdAt?: string;
  views?: number;
  rating?: number;
  vendorId?: string;
  vendorName?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProject {
  uid: string;
  email: string | null;
  displayName: string;
  role?: 'admin' | 'cliente' | 'asociado';
  photoURL?: string;
}
