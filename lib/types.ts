export interface Item {
  id: string;
  name: string;
  category: string;
  weight: number; // in grams
  packed: boolean;
  bagId?: string;
  size?: string; // e.g., "M", "XL", "10", "EU 42"
  brand?: string; // optional brand name
  photoUrl?: string; // optional photo of the item
}

export interface Bag {
  id: string;
  name: string;
  capacity: number; // in grams
  color: string;
}

export interface BagConfig {
  id: string;
  name: string;
  bags: Bag[];
  items: Item[];
  tripType: 'weekend' | 'week' | 'month' | 'extended';
  tripDuration: number; // in days
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  departureTime?: string; // HH:mm format
  returnTime?: string; // HH:mm format
  ticketUrl?: string; // stored file reference
  createdAt: number;
  updatedAt: number;
}

export const ITEM_CATEGORIES = [
  'Clothing',
  'Toiletries',
  'Electronics',
  'Documents',
  'Shoes',
  'Accessories',
  'Books',
  'Food & Snacks',
  'Other',
];



export const DEFAULT_BAGS: Bag[] = [
  { id: '1', name: 'Main Bag', capacity: 5000, color: 'bg-primary' },
  { id: '2', name: 'Daypack', capacity: 2000, color: 'bg-accent' },
];
