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
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  order_index: number;
  is_main: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  mode?: string;
}

export interface Order {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer_email: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus = 'pending' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
export type EventType = 'created' | 'status_change' | 'temperature_log' | 'document_added' | 'location_update' | 'note';
export type DocType = 'guia_remision' | 'packing_list' | 'cert_origen' | 'factura' | 'sanitario' | 'otro';

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  event_type: EventType;
  description: string;
  location: string | null;
  temperature: number | null;
  created_at: string;
}

export interface ShipmentDocument {
  id: string;
  shipment_id: string;
  doc_type: DocType;
  name: string;
  file_url: string | null;
  notes: string | null;
  issued_at: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string | null;
  order?: Order | null;
  status: ShipmentStatus;
  destination_country: string | null;
  destination_city: string | null;
  carrier: string | null;
  tracking_number: string | null;
  temp_min: number | null;
  temp_max: number | null;
  dispatch_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  events?: ShipmentEvent[];
  documents?: ShipmentDocument[];
}

export interface ContactRequest {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  pais: string | null;
  tipo_cliente: string | null;
  productos: string | null;
  volumen: string | null;
  mensaje: string | null;
  leido: boolean;
  created_at: string;
}
