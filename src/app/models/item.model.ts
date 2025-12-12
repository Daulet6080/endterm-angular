export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  thumbnail?: string;
  brand?: string;
  stock?: number;
  images?: string[];
}
