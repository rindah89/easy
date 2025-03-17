export interface CreateAddressParams {
  userId: string;
  addressName: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault: boolean;
} 