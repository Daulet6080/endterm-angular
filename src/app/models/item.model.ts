export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  brand?: string;
  thumbnail: string;
  images?: string[];
  stock?: number;
}
