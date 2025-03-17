import { supabase } from '../../lib/supabase';

export interface CreateAddressParams {
  userId: string;
  addressName: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault: boolean;
}

// Address service functions
const addressService = {
  // Create new address
  async createAddress(params: CreateAddressParams) {
    return await supabase
      .from('user_addresses')
      .insert([
        {
          user_id: params.userId,
          address_name: params.addressName,
          address: params.address,
          city: params.city,
          state: params.state,
          postal_code: params.postalCode,
          is_default: params.isDefault,
        },
      ])
      .select();
  },

  // Get user addresses
  async getUserAddresses(userId: string) {
    return await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
  },

  // Update address
  async updateAddress(addressId: number, params: Partial<CreateAddressParams>) {
    const updateData: any = {};
    
    if (params.addressName) updateData.address_name = params.addressName;
    if (params.address) updateData.address = params.address;
    if (params.city) updateData.city = params.city;
    if (params.state) updateData.state = params.state;
    if (params.postalCode) updateData.postal_code = params.postalCode;
    if (params.isDefault !== undefined) updateData.is_default = params.isDefault;
    
    return await supabase
      .from('user_addresses')
      .update(updateData)
      .eq('id', addressId)
      .select();
  },

  // Delete address
  async deleteAddress(addressId: number) {
    return await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);
  },

  // Set address as default
  async setDefaultAddress(userId: string, addressId: number) {
    // First, update all user's addresses to non-default
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
      
    // Then set the specified address as default
    return await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select();
  }
};

export default addressService; 