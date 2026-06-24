export interface CarrierType {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface CarrierPackageFee {
  carrier_type_id: number;
  package_id: number;
  transportation_fee: number;
  packaging_fee: number;
}

export interface CalculateFeeRequest {
  carrier_type_id: number;
  package_id: number
}