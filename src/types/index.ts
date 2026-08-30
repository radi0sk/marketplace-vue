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
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number; // Regular Price (with card surcharge)
  cashPrice?: number; // Offer Price (cash payment)
  comparePrice?: number;
  wholesaleMin?: number;
  wholesalePrice?: number;
  cost?: number;
  stock: number;
  brand: string;
  model: string;
  weight?: number;
  dimensions?: string;
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
  shippingType?: 'free' | 'calculated' | 'fixed';
  shippingCost?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  status?: 'active' | 'draft' | 'archived';
  images: string[];
  mainImage?: string;
  createdBy?: string;
  vendorId?: string;
  vendorName?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  rating?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProject {
  uid: string;
  email: string | null;
  displayName: string;
  role?: 'admin' | 'cliente' | 'asociado' | 'mayorista';
  isPartner?: boolean;
  photoURL?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
  };
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  fincaName?: string;
  department?: string;
  municipality?: string;
  address?: string;
  mainCrops?: string[]; // ej. Maíz, Café, Hortalizas, Aguacate
  parcelSize?: number; // Tamaño en Manzanas o Hectáreas
  parcelUnit?: 'mz' | 'ha' | 'cu';
  currentDebt?: number; // Saldo pendiente / Cuenta por cobrar
  creditLimit?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DosageCalculation {
  productId?: string;
  productName?: string;
  areaSize: number;
  areaUnit: 'mz' | 'ha' | 'cu'; // Manzanas, Hectáreas, Cuerdas
  dosePerUnit: number; // Ej: 2.5
  doseUnit: string; // Ej: Litros, Kg, Copas, Sacos
  totalAmountNeeded: number;
  sprayerCapacityLiters?: number; // Ej: 16L, 20L
  waterVolumePerAreaLiters?: number; // Ej: 200 Litros por Manzana
  totalSprayerPumps?: number; // Número de bombas de espalda
  dosePerPump?: number; // Cantidad de producto por bomba
  applicationNotes?: string;
}

export interface QuoteItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  discountPercent?: number;
  subtotal: number;
  dosageInfo?: string;
}

export interface Quote {
  id?: string;
  quoteNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  total: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'credito';
  agronomicRecommendation?: string;
  dosageCalculation?: DosageCalculation;
  status: 'draft' | 'sent' | 'approved' | 'converted' | 'cancelled';
  convertedOrderId?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldVisit {
  id?: string;
  customerId: string;
  customerName: string;
  fincaName?: string;
  visitDate: string;
  cropType: string;
  cropPhase?: string;
  diagnosis: string;
  pestOrDeficiency?: string;
  recommendedTreatment: string;
  suggestedProducts?: { productId: string; name: string; quantity: number }[];
  followUpDate?: string;
  photos?: string[];
  agronomistName?: string;
  createdAt?: string;
}

