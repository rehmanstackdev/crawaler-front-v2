export interface Product {
  title: string;
  price: number;
  rating: number;
  link: string;
  image: string;
  platform: 'Daraz' | 'Telemart' | 'OLX';
  seller?: string;
  score?: number;
}

export interface VariantOffer {
  title: string;
  price: number;
  rating: number;
  link: string;
  image: string;
  platform: string;
  seller: string;
  score?: number;
  color?: string | null;
  ram?: string | null;
  storage?: string | null;
}

export interface VariantGroup {
  variantKey: string;
  name: string;
  color: string | null;
  ram: string | null;
  storage: string | null;
  offers: VariantOffer[];
  lowestPrice: number;
  highestPrice: number;
  totalOffers: number;
  thumbnail: string;
}

export interface SearchResults {
  query: string;
  total: number;
  daraz: Product[];
  telemart: Product[];
  ranked: Product[];
  variantGroups: VariantGroup[];
  derivedQuery?: string;
}
