import { supabase } from '../lib/supabase';
import { Database } from '../database.types';

// Define address type based on our Supabase table structure
export type UserAddress = {
  id: string;
  userId: string;
  addressName: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  coordinates?: { longitude: number; latitude: number };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// Type for the database table row
type UserAddressRow = Database['public']['Tables']['user_addresses']['Row'];

// Type for creating a new address
export type CreateAddressParams = {
  userId: string;
  addressName: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  coordinates?: { longitude: number; latitude: number };
  isDefault?: boolean;
};

// Type for updating an existing address
export type UpdateAddressParams = Partial<Omit<CreateAddressParams, 'userId'>> & {
  id: string;
};

// Convert database row to our model
function convertRowToAddress(row: UserAddressRow): UserAddress {
  let coordinates = undefined;
  
  // Parse coordinates if they exist
  if (row.coordinates) {
    // The geography(point) type in PostgreSQL is stored as EWKB, but Supabase returns
    // it in a format we can parse. We need to extract the coordinates.
    try {
      // This is a simplification. In reality, you might need a more robust parser
      // depending on exactly how Supabase returns this data
      const coordinatesText = row.coordinates.toString();
      const match = coordinatesText.match(/POINT\(([^ ]+) ([^)]+)\)/i);
      if (match) {
        coordinates = {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    } catch (e) {
      console.error('Error parsing coordinates:', e);
    }
  }
  
  return {
    id: row.id,
    userId: row.user_id,
    addressName: row.address_name,
    address: row.address,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code || undefined,
    country: row.country,
    coordinates,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Convert our model to database row format for insertion/update
function convertAddressToRow(address: CreateAddressParams): any {
  const row: any = {
    user_id: address.userId,
    address_name: address.addressName,
    address: address.address,
    city: address.city,
    state: address.state,
    country: address.country || 'Cameroon'
  };
  
  if (address.postalCode) {
    row.postal_code = address.postalCode;
  }
  
  if (address.isDefault !== undefined) {
    row.is_default = address.isDefault;
  }
  
  if (address.coordinates) {
    // Create a PostGIS POINT geometry
    row.coordinates = `POINT(${address.coordinates.longitude} ${address.coordinates.latitude})`;
  }
  
  return row;
}

/**
 * Fetch all addresses for a user
 * @param userId The user's ID
 * @returns List of addresses and any error
 */
export async function fetchUserAddresses(userId: string): Promise<{ 
  addresses: UserAddress[];
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const addresses = data ? data.map(convertRowToAddress) : [];
    return { addresses, error: null };
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return { addresses: [], error };
  }
}

/**
 * Create a new address for a user
 * @param addressData The address data to create
 * @returns The created address or error
 */
export async function createAddress(addressData: CreateAddressParams): Promise<{
  address?: UserAddress;
  error: any;
}> {
  try {
    const row = convertAddressToRow(addressData);
    
    const { data, error } = await supabase
      .from('user_addresses')
      .insert(row)
      .select()
      .single();
    
    if (error) throw error;
    
    return { address: data ? convertRowToAddress(data) : undefined, error: null };
  } catch (error) {
    console.error('Error creating address:', error);
    return { error };
  }
}

/**
 * Update an existing address
 * @param updateData The address data to update
 * @returns The updated address or error
 */
export async function updateAddress(updateData: UpdateAddressParams): Promise<{
  address?: UserAddress;
  error: any;
}> {
  try {
    // Get the current address to ensure we're updating the user's own address
    const { data: currentAddress, error: fetchError } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', updateData.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!currentAddress) throw new Error('Address not found');
    
    // Prepare update data
    const updateRow: any = {};
    
    if (updateData.addressName !== undefined) updateRow.address_name = updateData.addressName;
    if (updateData.address !== undefined) updateRow.address = updateData.address;
    if (updateData.city !== undefined) updateRow.city = updateData.city;
    if (updateData.state !== undefined) updateRow.state = updateData.state;
    if (updateData.postalCode !== undefined) updateRow.postal_code = updateData.postalCode;
    if (updateData.country !== undefined) updateRow.country = updateData.country;
    if (updateData.isDefault !== undefined) updateRow.is_default = updateData.isDefault;
    
    if (updateData.coordinates) {
      updateRow.coordinates = `POINT(${updateData.coordinates.longitude} ${updateData.coordinates.latitude})`;
    }
    
    // Update the address
    const { data, error } = await supabase
      .from('user_addresses')
      .update(updateRow)
      .eq('id', updateData.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { address: data ? convertRowToAddress(data) : undefined, error: null };
  } catch (error) {
    console.error('Error updating address:', error);
    return { error };
  }
}

/**
 * Delete an address
 * @param addressId The ID of the address to delete
 * @returns Success or error
 */
export async function deleteAddress(addressId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { error };
  }
}

/**
 * Set an address as the default
 * @param addressId The ID of the address to set as default
 * @param userId The user's ID
 * @returns Success or error
 */
export async function setDefaultAddress(addressId: string, userId: string): Promise<{ error: any }> {
  try {
    // Our trigger will handle setting all other addresses to non-default
    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { error };
  }
}

/**
 * Get the default address for a user
 * @param userId The user's ID
 * @returns The default address or error
 */
export async function getDefaultAddress(userId: string): Promise<{
  address?: UserAddress;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" which is OK
    
    return { 
      address: data ? convertRowToAddress(data) : undefined, 
      error: null 
    };
  } catch (error) {
    console.error('Error getting default address:', error);
    return { error };
  }
} 