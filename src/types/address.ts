export interface Address {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}

export interface CreateAddressRequest {
  name: string;
  address: string;
  alley: string;
  plate: string;
  latitude: string;
  longitude: string;
}

export interface CreateAddressResponse {
  message: string;
  status: number;
  data: Address;
}