// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

// Product types
export interface ProductOffer {
  id: string;
  platform: 'daraz' | 'temu';
  title: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  seller: string;
  sellerRating?: number;
  location?: string;
  imageUrl: string;
  productUrl: string;
  specifications?: Record<string, string>;
  crawledAt: string;
}

export interface ProductGroup {
  id: string;
  name: string;
  brand: string;
  category: string;
  model?: string;
  thumbnail: string;
  lowestPrice: number;
  highestPrice: number;
  averageRating: number;
  totalOffers: number;
  offers: ProductOffer[];
  attributes: Record<string, string>;
}

// Search types
export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  platforms: ('daraz' | 'temu')[];
  minRating?: number;
  categories?: string[];
}

export interface SearchSort {
  field: 'price' | 'rating' | 'offers';
  direction: 'asc' | 'desc';
}

// Admin types
export interface CrawlerStatus {
  id: string;
  name: string;
  platform: 'daraz' | 'temu';
  status: 'running' | 'idle' | 'error' | 'paused';
  lastRun: string;
  nextRun: string;
  productsProcessed: number;
  errorCount: number;
  successRate: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalSearches: number;
  activeCrawlers: number;
  productsToday: number;
  errorsToday: number;
}
