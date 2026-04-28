export interface Feature {
  name: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: number; // Regular Price (with card surcharge)
  cashPrice?: number; // Offer Price (cash payment)
  comparePrice?: number;
  wholesaleMin: number;
  wholesalePrice: number;
  cost: number;
  stock: number;
  brand: string;
  model: string;
  weight: number;
  dimensions: string;
  features: Feature[];
  categoria: string;
  lineaProduccion: string;
  especieCultivo: string[];
  etapaVida: string;
  ingredienteActivo?: string;
  dosis?: string;
  periodoCarencia?: string;
  marcaFabricante?: string;
  tags: string | string[];
  shippingType: 'free' | 'calculated' | 'fixed';
  shippingCost: number;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  status: 'active' | 'draft' | 'archived';
  images: string[];
  mainImage?: string;
  createdBy?: string;
  vendorId?: string;
  vendorName?: string;
  createdAt?: string;
  updatedAt?: string;
}
