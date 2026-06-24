export interface Package {
  id: number;
  name: string;
  price: string;
  packaging_price: string;
  width: number | null;
  height: number | null;
  length: number | null;
  is_active: boolean;
  created_at: string;
}