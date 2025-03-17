import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, FlatList, ActivityIndicator, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../../components/CustomText';
import { Divider } from '../../components/CustomDivider';
import { Button } from '../../components/Button';
import { useCart, CartItem } from '../../context/CartContext';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { 
    cartItems, 
    optimizedCartItems, 
    removeFromCart, 
    clearCart, 
    isLoading 
  } = useCart();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  // Refresh cart data when screen is focused
  useFocusEffect(
    useCallback(() => {
      // This is where we would refresh cart data if needed
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }, [])
  );

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Add some items before checking out.');
      return;
    }

    // Navigate to the checkout screen
    router.push('/checkout');
  };

  // Handle remove item with error handling
  const handleRemoveItem = (itemId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${productName} from your cart?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId);
            } catch (error) {
              console.error('Failed to remove item:', error);
              Alert.alert(
                'Error',
                'There was an issue removing this item. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  // Handle view item details
  const handleViewItemDetails = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // If loading, show loading indicator
  if (isLoading || refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Shopping Cart
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  
  // Find the currency from any item (assuming they all use the same currency)
  const currency = cartItems.length > 0 ? cartItems[0].currency : '$';

  // Render empty cart
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Shopping Cart
          </Text>
        </View>
        
        <View style={styles.emptyCartContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={80}
            color={theme.colors.onSurfaceVariant}
            style={styles.emptyCartIcon}
          />
          <Text variant="titleMedium" style={styles.emptyCartTitle}>
            Your cart is empty
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptyCartText, { color: theme.colors.onSurfaceVariant }]}
          >
            Looks like you haven't added any items to your cart yet.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.navigate('/(tabs)')}
            style={styles.shopButton}
            fullWidth
            icon="shopping"
          >
            Start Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Render cart with items
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      <CustomHeader 
        title={t('food.cart')} 
        showBackButton={false}
        showAvatar={true}
      />

      {/* Use FlatList with optimizedCartItems for better performance */}
      <FlatList
        data={optimizedCartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => {
          const isExpanded = expandedItemId === item.id;
          const fullItem = cartItems.find(cartItem => cartItem.id === item.id);
          
          return (
            <Animated.View 
              entering={FadeInRight.duration(300)} 
              exiting={FadeOutLeft.duration(300)}
              style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}
            >
              <TouchableOpacity 
                style={styles.cartItemHeader}
                onPress={() => handleViewItemDetails(item.id)}
              >
                <MaterialCommunityIcons 
                  name={
                    item.productType === 'medication' ? "pill" : 
                    item.productType === 'food' ? "food" :
                    item.productType === 'grocery' ? "food-apple" :
                    item.productType === 'furniture' ? "sofa" :
                    "package-variant-closed"
                  } 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text variant="titleMedium" style={styles.itemTitle}>
                  {item.productName}
                </Text>
                {item.brand && (
                  <Text variant="bodySmall" style={styles.brandText}>
                    {item.brand}
                  </Text>
                )}
                <View style={styles.headerActions}>
                  <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.onSurfaceVariant} 
                    style={{ marginRight: 12 }}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id, item.productName)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <Divider style={styles.itemDivider} />

              <View style={styles.itemBasicInfo}>
                <View style={styles.itemBasicDetail}>
                  <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                    Total Quantity:
                  </Text>
                  <Text variant="bodyMedium">
                    {item.totalQuantity} {
                      item.productType === 'medication'
                        ? (item.totalQuantity === 1 ? 'unit' : 'units')
                        : item.productType === 'food' || item.productType === 'grocery'
                        ? (item.totalQuantity === 1 ? 'item' : 'items')
                        : item.productType === 'furniture'
                        ? (item.totalQuantity === 1 ? 'piece' : 'pieces')
                        : (item.totalQuantity === 1 ? 'piece' : 'pieces')
                    }
                  </Text>
                </View>

                <View style={styles.itemBasicDetail}>
                  <Text variant="titleSmall">Total Price:</Text>
                  <Text 
                    variant="titleMedium" 
                    style={[styles.itemTotalPrice, { color: theme.colors.primary }]}
                  >
                    {item.currency} {item.totalPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              {isExpanded && fullItem && (
                <View style={styles.expandedDetails}>
                  <Divider style={styles.itemDivider} />
                  
                  <View style={styles.itemDetails}>
                    <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                      Added on:
                    </Text>
                    <Text variant="bodyMedium">
                      {new Date(fullItem.addedAt).toLocaleString()}
                    </Text>
                  </View>

                  {fullItem.productType === 'medication' ? (
                    // Medication-specific details
                    <>
                      {fullItem.image && (
                        <View style={styles.medicationImageContainer}>
                          <Image 
                            source={{ uri: fullItem.image }} 
                            style={styles.medicationImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      
                      {fullItem.category && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Category:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.category}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.itemDetails}>
                        <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                          Price per unit:
                        </Text>
                        <Text variant="bodyMedium">
                          {fullItem.currency} {fullItem.pricePerMeter.toLocaleString()}
                        </Text>
                      </View>

                      {fullItem.notes && (
                        <View style={styles.notesContainer}>
                          <Text variant="bodyMedium" style={styles.notesTitle}>
                            Description:
                          </Text>
                          <Text variant="bodySmall" style={styles.notesText}>
                            {fullItem.notes}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : fullItem.productType === 'food' || fullItem.productType === 'grocery' ? (
                    // Food and Grocery specific details
                    <>
                      {fullItem.image && (
                        <View style={styles.medicationImageContainer}>
                          <Image 
                            source={{ uri: fullItem.image }} 
                            style={styles.medicationImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      
                      {fullItem.brand && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Brand:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.brand}
                          </Text>
                        </View>
                      )}
                      
                      {fullItem.category && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Category:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.category}
                          </Text>
                        </View>
                      )}

                      <View style={styles.itemDetails}>
                        <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                          Price per item:
                        </Text>
                        <Text variant="bodyMedium">
                          {fullItem.currency} {fullItem.pricePerMeter.toLocaleString()}
                        </Text>
                      </View>
                      
                      {fullItem.weight && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Weight:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.weight} grams
                          </Text>
                        </View>
                      )}
                      
                      {fullItem.servingSize && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Serving Size:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.servingSize}
                          </Text>
                        </View>
                      )}
                      
                      {fullItem.expiryDate && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Expiry Date:
                          </Text>
                          <Text variant="bodyMedium">
                            {new Date(fullItem.expiryDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      {fullItem.notes && (
                        <View style={styles.notesContainer}>
                          <Text variant="bodyMedium" style={styles.notesTitle}>
                            Description:
                          </Text>
                          <Text variant="bodySmall" style={styles.notesText}>
                            {fullItem.notes}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : fullItem.productType === 'furniture' ? (
                    // Furniture specific details
                    <>
                      {fullItem.image && (
                        <View style={styles.medicationImageContainer}>
                          <Image 
                            source={{ uri: fullItem.image }} 
                            style={styles.medicationImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      
                      {fullItem.brand && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Brand:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.brand}
                          </Text>
                        </View>
                      )}
                      
                      {fullItem.category && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Category:
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.category}
                          </Text>
                        </View>
                      )}

                      <View style={styles.itemDetails}>
                        <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                          Price per piece:
                        </Text>
                        <Text variant="bodyMedium">
                          {fullItem.currency} {fullItem.pricePerMeter.toLocaleString()}
                        </Text>
                      </View>
                      
                      {fullItem.dimensions && (
                        <View style={styles.itemDetails}>
                          <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                            Dimensions (WxDxH):
                          </Text>
                          <Text variant="bodyMedium">
                            {fullItem.dimensions}
                          </Text>
                        </View>
                      )}

                      {fullItem.notes && (
                        <View style={styles.notesContainer}>
                          <Text variant="bodyMedium" style={styles.notesTitle}>
                            Description:
                          </Text>
                          <Text variant="bodySmall" style={styles.notesText}>
                            {fullItem.notes}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    // Textile-specific details
                    <>
                      <View style={styles.itemDetails}>
                        <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                          Price per meter:
                        </Text>
                        <Text variant="bodyMedium">
                          {fullItem.currency} {fullItem.pricePerMeter.toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.itemDetails}>
                        <Text variant="bodyMedium" style={styles.itemDetailLabel}>
                          Total fabric:
                        </Text>
                        <Text variant="bodyMedium">
                          {fullItem.totalMeters.toFixed(2)} meters
                        </Text>
                      </View>

                      <Text variant="bodyMedium" style={styles.colorsTitle}>
                        Selected Colors:
                      </Text>

                      <View style={styles.colorsContainer}>
                        {fullItem.colorDetails.map((colorDetail, index) => (
                          <View key={index} style={styles.colorItem}>
                            <View 
                              style={[
                                styles.colorDot, 
                                { backgroundColor: colorDetail.color }
                              ]} 
                            />
                            <Text variant="bodySmall">
                              {colorDetail.label}: {colorDetail.quantity} pcs × {colorDetail.length.toFixed(2)}m
                            </Text>
                          </View>
                        ))}
                      </View>

                      {fullItem.notes && (
                        <View style={styles.notesContainer}>
                          <Text variant="bodyMedium" style={styles.notesTitle}>
                            Notes:
                          </Text>
                          <Text variant="bodySmall" style={styles.notesText}>
                            {fullItem.notes}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Order Summary
              </Text>
              
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Items:</Text>
                <Text variant="bodyMedium">{cartItems.length}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text variant="titleMedium">Total:</Text>
                <Text 
                  variant="titleMedium" 
                  style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                >
                  {currency} {totalPrice.toLocaleString()}
                </Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
              fullWidth
              icon="credit-card-outline"
              loading={checkoutLoading}
              disabled={checkoutLoading}
            >
              Proceed to Checkout
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cartItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  itemDivider: {
    height: 1,
  },
  itemBasicInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemBasicDetail: {
    alignItems: 'flex-start',
  },
  expandedDetails: {
    paddingBottom: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  itemDetailLabel: {
    color: '#666666',
  },
  colorsTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: '500',
  },
  colorsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  notesContainer: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  notesTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  notesText: {
    fontStyle: 'italic',
  },
  itemTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  itemTotalPrice: {
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  checkoutButton: {
    height: 54,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCartIcon: {
    marginBottom: 16,
  },
  emptyCartTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyCartText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    height: 54,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationImageContainer: {
    marginBottom: 16,
  },
  medicationImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  brandText: {
    marginLeft: 12,
    fontWeight: '500',
  },
}); 