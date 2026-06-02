export interface Category {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  image_url: string | null;
  order_index: number;
}

export interface Product {
  id: string;
  slug: string;
  category_id: string;
  category?: Category;
  name_es: string;
  name_en: string;
  scientific_name: string | null;
  description_es: string;
  description_en: string;
  blurb_es: string | null;
  blurb_en: string | null;
  price: number;
  tags: string[];
  origin: string | null;
  fao_zone: string | null;
  presentation: string | null;
  packaging: string | null;
  sizing: string | null;
  measures: string | null;
  featured: boolean;
  retail: boolean;
  active: boolean;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  order_index: number;
  is_main: boolean;
}

export interface Quote {
  id: string;
  user_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  notes: string | null;
  created_at: string;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  product?: Product;
  quantity_kg: number;
  unit_price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
