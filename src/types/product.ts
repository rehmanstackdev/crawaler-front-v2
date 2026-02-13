export interface Product {
  title: string;
  price: number;
  rating: number;
  link: string;
  image: string;
  platform: 'Daraz' | 'Telemart' | 'OLX';
  score?: number;
}

export interface SearchResults {
  query: string;
  total: number;
  daraz: Product[];
  telemart: Product[];
  ranked: Product[];
}
