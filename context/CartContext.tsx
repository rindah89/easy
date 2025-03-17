import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Version tag for cart data structure
const CART_VERSION = '1.0';
const CART_STORAGE_KEY = 'easyD_cart';
const CART_TEMP_STORAGE_KEY = 'easyD_cart_temp';
const MAX_CART_AGE_DAYS = 30; // Cart items expire after 30 days
const MAX_STORAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB max storage size

// Define types for cart items
export type CartItemColorDetail = {
  color: string;
  label: string;
  quantity: number;
  length: number;
};

export type CartItem = {
  id: string;
  productName: string;
  pricePerMeter: number;
  currency: string;
  totalPrice: number;
  totalQuantity: number;
  totalMeters: number;
  colorDetails: CartItemColorDetail[];
  notes?: string;
  addedAt: string;
  // New fields for supporting different product types
  productType?: 'textile' | 'medication' | 'food' | 'grocery' | 'furniture' | string;
  image?: string;
  category?: string;
  // Additional fields for specific product types
  weight?: number; // For food/grocery in grams
  dimensions?: string; // For furniture (WxDxH)
  expiryDate?: string; // For food/grocery
  servingSize?: string; // For food
  brand?: string; // General brand information
};

// Optimized cart item for list rendering with only necessary fields
export type OptimizedCartItem = {
  id: string;
  productName: string;
  totalPrice: number;
  totalQuantity: number;
  currency: string;
  productType?: 'textile' | 'medication' | 'food' | 'grocery' | 'furniture' | string;
  image?: string;
  category?: string;
  brand?: string; // Including brand in optimized view
};

// Define the cart context type
type CartContextType = {
  cartItems: CartItem[];
  optimizedCartItems: OptimizedCartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  isLoading: boolean;
};

// Create the cart context
const CartContext = createContext<CartContextType>({
  cartItems: [],
  optimizedCartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  getCartCount: () => 0,
  isLoading: true,
});

// Helper function to validate cart item
const validateCartItem = (item: CartItem): boolean => {
  if (!item || typeof item !== 'object') return false;
  
  // Check required fields
  if (!item.id || typeof item.id !== 'string') return false;
  if (!item.productName || typeof item.productName !== 'string') return false;
  if (typeof item.pricePerMeter !== 'number' || isNaN(item.pricePerMeter)) return false;
  if (!item.currency || typeof item.currency !== 'string') return false;
  if (typeof item.totalPrice !== 'number' || isNaN(item.totalPrice)) return false;
  if (typeof item.totalQuantity !== 'number' || isNaN(item.totalQuantity)) return false;
  if (typeof item.totalMeters !== 'number' || isNaN(item.totalMeters)) return false;
  
  // For non-textile products, we have simplified colorDetails requirement
  const isNonTextileProduct = ['medication', 'food', 'grocery', 'furniture'].includes(item.productType || '');
  
  // Validate colorDetails array - less strict for non-textile products
  if (!Array.isArray(item.colorDetails)) return false;
  
  if (!isNonTextileProduct && item.colorDetails.length === 0) return false;
  
  for (const colorDetail of item.colorDetails) {
    if (!colorDetail.color || typeof colorDetail.color !== 'string') return false;
    if (!colorDetail.label || typeof colorDetail.label !== 'string') return false;
    if (typeof colorDetail.quantity !== 'number' || colorDetail.quantity <= 0) return false;
    if (typeof colorDetail.length !== 'number' || colorDetail.length <= 0) return false;
  }
  
  // Notes is optional
  if (item.notes !== undefined && typeof item.notes !== 'string') return false;
  
  // Validate date format
  if (!item.addedAt || !(new Date(item.addedAt)).getTime()) return false;
  
  // Optional fields validation
  if (item.productType !== undefined && typeof item.productType !== 'string') return false;
  if (item.image !== undefined && typeof item.image !== 'string') return false;
  if (item.category !== undefined && typeof item.category !== 'string') return false;
  
  // Product-specific optional fields validation
  if (item.weight !== undefined && (typeof item.weight !== 'number' || isNaN(item.weight))) return false;
  if (item.dimensions !== undefined && typeof item.dimensions !== 'string') return false;
  if (item.expiryDate !== undefined) {
    if (typeof item.expiryDate !== 'string') return false;
    // Check if it's a valid date format
    if (!(new Date(item.expiryDate)).getTime()) return false;
  }
  if (item.servingSize !== undefined && typeof item.servingSize !== 'string') return false;
  if (item.brand !== undefined && typeof item.brand !== 'string') return false;
  
  return true;
};

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Create optimized cart items for rendering
  const optimizedCartItems = useMemo(() => {
    return cartItems.map(item => ({
      id: item.id,
      productName: item.productName,
      totalPrice: item.totalPrice,
      totalQuantity: item.totalQuantity,
      currency: item.currency,
      productType: item.productType,
      image: item.image,
      category: item.category,
      brand: item.brand,
    }));
  }, [cartItems]);

  // Function to get storage key with user ID for future migration support
  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${CART_STORAGE_KEY}_${user.id}`;
    }
    return CART_STORAGE_KEY;
  }, [user?.id]);

  // Function to clean up expired items
  const cleanupExpiredItems = useCallback((items: CartItem[]): CartItem[] => {
    const now = new Date();
    const maxAge = MAX_CART_AGE_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    return items.filter(item => {
      const addedDate = new Date(item.addedAt);
      const age = now.getTime() - addedDate.getTime();
      return age < maxAge;
    });
  }, []);

  // Function to create backup before making changes
  const backupCart = async (items: CartItem[]) => {
    try {
      const tempData = {
        version: CART_VERSION,
        items,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CART_TEMP_STORAGE_KEY, JSON.stringify(tempData));
    } catch (error) {
      console.error('Failed to backup cart:', error);
    }
  };

  // Function to restore from backup if available
  const restoreFromBackup = async (): Promise<CartItem[]> => {
    try {
      const backupData = await AsyncStorage.getItem(CART_TEMP_STORAGE_KEY);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        if (parsed.version === CART_VERSION && Array.isArray(parsed.items)) {
          return parsed.items.filter(item => validateCartItem(item));
        }
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error);
    }
    return [];
  };

  // Function to save cart with validation and error handling
  const saveCart = async (items: CartItem[]): Promise<void> => {
    try {
      // Validate items before saving
      const validItems = items.filter(item => validateCartItem(item));
      
      // Clean up expired items
      const cleanedItems = cleanupExpiredItems(validItems);
      
      // Create backup before saving
      await backupCart(cleanedItems);
      
      // Check storage size
      const cartData = {
        version: CART_VERSION,
        items: cleanedItems,
        lastUpdated: new Date().toISOString(),
      };
      
      const serializedData = JSON.stringify(cartData);
      
      if (serializedData.length > MAX_STORAGE_SIZE_BYTES) {
        throw new Error('Cart storage size exceeded maximum limit');
      }
      
      // Save to storage
      await AsyncStorage.setItem(getStorageKey(), serializedData);
      
      // Update state
      setCartItems(cleanedItems);
    } catch (error) {
      console.error('Failed to save cart:', error);
      throw error;
    }
  };

  // Function to load cart with error recovery
  const loadCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Try to load from main storage
      const storageKey = getStorageKey();
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          
          // Handle version changes
          if (parsed.version === CART_VERSION && Array.isArray(parsed.items)) {
            // Validate and clean up items
            const validItems = parsed.items.filter(item => validateCartItem(item));
            const cleanedItems = cleanupExpiredItems(validItems);
            
            setCartItems(cleanedItems);
            
            // If data is corrupted or items were filtered, save the cleaned version
            if (cleanedItems.length !== parsed.items.length) {
              await saveCart(cleanedItems);
            }
            
            setIsLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('Failed to parse cart data:', parseError);
          // Fall through to recovery options
        }
      }
      
      // If no valid data, try to restore from backup
      const backupItems = await restoreFromBackup();
      if (backupItems.length > 0) {
        setCartItems(backupItems);
        await saveCart(backupItems);
        setIsLoading(false);
        return;
      }
      
      // If all else fails, start with empty cart
      setCartItems([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
      setIsLoading(false);
    }
  };

  // Load cart on initial mount
  useEffect(() => {
    loadCart();
  }, []);

  // Reload cart when user changes
  useEffect(() => {
    loadCart();
  }, [user?.id]);

  // Function to add item to cart
  const addToCart = async (item: CartItem): Promise<void> => {
    try {
      if (!validateCartItem(item)) {
        throw new Error('Invalid cart item');
      }
      
      // Check if item already exists by ID
      const exists = cartItems.some(existingItem => existingItem.id === item.id);
      
      let updatedItems: CartItem[];
      
      if (exists) {
        // Replace existing item
        updatedItems = cartItems.map(existingItem => 
          existingItem.id === item.id ? item : existingItem
        );
      } else {
        // Add new item
        updatedItems = [...cartItems, item];
      }
      
      await saveCart(updatedItems);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  // Function to remove item from cart
  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      await saveCart(updatedItems);
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  // Function to clear cart
  const clearCart = async (): Promise<void> => {
    try {
      await saveCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  // Function to get cart count
  const getCartCount = (): number => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        optimizedCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Function for future Supabase migration
export async function migrateCartToSupabase(userId: string) {
  try {
    if (!userId) return false;
    
    const localCart = await AsyncStorage.getItem(`easyD_cart_items_${CART_VERSION}_${userId}`);
    if (localCart) {
      // This is a placeholder for future implementation
      console.log('Ready to migrate cart for user:', userId);
      // After successful migration to Supabase:
      // await AsyncStorage.removeItem(`easyD_cart_items_${CART_VERSION}_${userId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
} 