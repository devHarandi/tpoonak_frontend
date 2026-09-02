export interface CreateOrderRequest {
  carrier_type_id: number;
  vehicle_type_id: number;
  address_id?: number;
  is_same_day_delivery: boolean;
  is_in_person_pickup: boolean;
  description: string;
  packages: Array<{
    package_id: number;
    quantity: number;
    packaging_quantity: number;
  }>;
  carrier_type_text?: string;
}

export interface Order {
  id: number;
  user: number;
  user_mobile: string;
  user_first_name: string;
  user_last_name: string;
  /** نام شرکتِ مشتری؛ برای مشتری حقیقی رشته‌ی خالی است. */
  user_company_name: string;
  /** مجموع تعداد بسته‌های سفارش. */
  total_quantity: number;
  is_in_person_pickup:boolean;
  carrier_type_title: string;
  carrier_type_text_display: string;
  address_details: string;
  address_alley: string;
  address_plate: string;
  is_same_day_delivery: boolean;
  status: string;
  payment_status: string;
  description: string;
  packages: Array<{
    package_id: number;
    package_name: string;
    quantity: number;
    packaging_quantity: number;
  }>;
  /** برای مشتری فقط نام و تصویر اختیاری برمی‌گردد؛ شماره موبایل هرگز عمومی نیست. */
  carrier: null | {
    id: number;
    first_name?: string;
    last_name?: string;
    profile_image?: string | null;
    mobile?: string;
    profile?: {
      first_name: string;
      last_name: string;
      profile_image?: string | null;
      mobile: string;
      verified_phone: boolean;
      roles: Array<{ id: number; name: string }>;
    };
  };
  images: Array<{ image: string }>;
  total_amount: string;
  vehicle_type_name:string;
  created_at: string;
  updated_at: string;
  collected_at: string;
}

export interface CreateOrderResponse {
  message: string;
  status: number;
  data: Order;
}

export interface GetOrdersResponse {
  message: string;
  status: number;
  data: Order[];
}

export interface GetOrderResponse {
  message: string;
  status: number;
  data: Order;
}

export interface VehicleType {
  id: number;
  name: string;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetVehicleTypeResponse {
  message: string;
  status: number;
  data: VehicleType[];
}

export interface GetCanCreateOrder {
  message: string;
  status: number;
  data: {
      can_create:boolean;
      message:string
  };
}

export interface GetSystemSetting {
  message: string;
  status: number;
  data: {
      id:number;
      can_create_order:boolean;
      image_slide1:string;
      image_slide2:string;
      image_slide3:string;
      created_at: string;
      updated_at: string;
  };
}

export interface GetChangeSystemSetting {
  message: string;
  status: number;
  data: {
      id:number;
      can_create_order:boolean;
  };
}

export interface SetChangeSystemSetting {
  can_create_order:boolean;
}
