import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SimpleFormInput, FormDropdown, QuantitySelector, ColorGridSelector } from '../components/FormInput';
import { Text } from '../components/CustomText';
import { Divider } from '../components/CustomDivider';
import { textiles, Textile } from '../data/textiles';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Define CartItem type
interface CartItem {
  id: string;
  productName: string;
  pricePerMeter: number;
  currency: string;
  totalPrice: number;
  totalQuantity: number;
  totalMeters: number;
  colorDetails: Array<{ color: string; label: string; quantity: number; length: number }>;
  notes: string;
  addedAt: string;
}

const { width } = Dimensions.get('window');

// Custom Cart Modal Component
const CartAddedModal = ({ 
  visible, 
  onClose, 
  productName, 
  totalQuantity, 
  totalPrice, 
  currency, 
  colorDetails 
}: { 
  visible: boolean;
  onClose: () => void;
  productName: string;
  totalQuantity: number;
  totalPrice: number;
  currency: string;
  colorDetails: Array<{ color: string; label: string; quantity: number; length: number }>;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={cartModalStyles.overlay}>
        <Animated.View 
          style={[
            cartModalStyles.modalContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingBottom: insets.bottom + 20
            }
          ]}
        >
          <View style={cartModalStyles.modalHeader}>
            <View style={cartModalStyles.modalIndicator} />
            <TouchableOpacity 
              style={cartModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <View style={cartModalStyles.successIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            
            <Text variant="headlineSmall" style={cartModalStyles.modalTitle}>
              {t('textiles.cart.modalTitle')}
            </Text>
            
            <View style={cartModalStyles.modalDetails}>
              <Text variant="titleMedium" style={cartModalStyles.productName}>
                {productName}
              </Text>
              
              <Text variant="bodyMedium" style={cartModalStyles.modalDetailText}>
                {t('textiles.cart.modalQuantity')}: {totalQuantity} {totalQuantity === 1 ? t('textiles.cart.piece') : t('textiles.cart.pieces')}
              </Text>
              
              <Text variant="bodyMedium" style={cartModalStyles.modalDetailText}>
                {t('textiles.cart.totalFabric')}: {totalPrice.toFixed(2)} {t('textiles.cart.metersTotal')}
              </Text>
              
              <Text variant="bodyMedium" style={cartModalStyles.modalDetailText}>
                {t('textiles.cart.modalSelectedColors')}:
              </Text>
              
              <Text variant="bodyMedium" style={cartModalStyles.colorMessage}>
                {colorDetails.map(item => `${item.label}: ${item.quantity} x ${item.length.toFixed(2)}m`).join('\n')}
              </Text>
              
              <Text variant="titleMedium" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
                {currency} {totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View style={cartModalStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={cartModalStyles.modalButton}
            >
              {t('textiles.cart.continueShopping')}
            </Button>
            
            <Button
              mode="contained"
              onPress={() => {
                onClose();
                router.navigate('/(tabs)/cart');
              }}
              style={cartModalStyles.modalButton}
              icon="cart"
            >
              {t('textiles.cart.viewCart')}
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Modal specific styles
const cartModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDDD',
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalDetails: {
    marginBottom: 16,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDetailText: {
    marginBottom: 4,
  },
  colorMessage: {
    marginBottom: 16,
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalButton: {
    borderWidth: 1,
  },
});

export default function TextileCartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { textileId } = params;
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [textile, setTextile] = useState<Textile | null>(null);
  const [selectedColors, setSelectedColors] = useState<Array<{ value: string; quantity: number; length: string }>>([]);
  const [errors, setErrors] = useState<{
    colors: string;
    colorLengths: Record<string, string>;
  }>({ colors: '', colorLengths: {} });
  const [notes, setNotes] = useState('');
  
  // Add state for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [cartDetails, setCartDetails] = useState({
    productName: '',
    totalQuantity: 0,
    totalPrice: 0,
    currency: '',
    colorDetails: [] as Array<{ color: string; label: string; quantity: number; length: number }>
  });
  
  // Form state
  useEffect(() => {
    if (textileId) {
      const found = textiles.find(t => t.id === textileId);
      if (found) {
        setTextile(found);
        
        // Set default color if available
        if (found.colors && found.colors.length > 0) {
          // Set default minimum length if available
          const defaultLength = found.minimumOrder || '1';
          setSelectedColors([{ 
            value: found.colors[0].value, 
            quantity: 1,
            length: defaultLength
          }]);
        }
      }
    }
    setLoading(false);
  }, [textileId]);

  // Define color options from textile data
  const colorOptions = React.useMemo(() => {
    if (!textile || !textile.colors) return [];
    
    return textile.colors.map(color => ({
      value: color.value,
      label: color.label,
      color: color.value, // Using the color value as the actual color
    }));
  }, [textile]);

  // Helper to parse length as a number
  const parseLength = (lengthStr: string): number => {
    const parsed = parseFloat(lengthStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Toggle a color selection
  const toggleColor = (colorValue: string) => {
    const isSelected = selectedColors.some(item => item.value === colorValue);
    
    if (isSelected) {
      // Remove the color
      setSelectedColors(selectedColors.filter(item => item.value !== colorValue));
      
      // Remove any errors for this color
      const newColorLengths = { ...errors.colorLengths };
      delete newColorLengths[colorValue];
      setErrors({
        ...errors,
        colorLengths: newColorLengths
      });
    } else {
      // Add the color with default values
      const defaultLength = textile?.minimumOrder || '1';
      setSelectedColors([
        ...selectedColors,
        { value: colorValue, quantity: 1, length: defaultLength }
      ]);
    }
  };

  // Update quantity for a specific color
  const updateColorQuantity = (colorValue: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setSelectedColors(selectedColors.map(item => 
      item.value === colorValue 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  // Update length for a specific color
  const updateColorLength = (colorValue: string, newLength: string) => {
    setSelectedColors(selectedColors.map(item => 
      item.value === colorValue 
        ? { ...item, length: newLength } 
        : item
    ));
    
    // Clear error for this color
    if (errors.colorLengths[colorValue]) {
      const newColorLengths = { ...errors.colorLengths };
      delete newColorLengths[colorValue];
      setErrors({
        ...errors,
        colorLengths: newColorLengths
      });
    }
  };

  // Calculate the total quantity of pieces
  const getTotalQuantity = (): number => {
    return selectedColors.reduce((total, color) => total + color.quantity, 0);
  };

  // Calculate the total meters of fabric
  const getTotalMeters = (): number => {
    return selectedColors.reduce((total, color) => {
      const length = parseLength(color.length);
      return total + (length * color.quantity);
    }, 0);
  };

  // Calculate the total price
  const calculateTotal = (): number => {
    if (!textile) return 0;
    
    const totalMeters = getTotalMeters();
    return textile.price * totalMeters;
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors = { 
      colors: '',
      colorLengths: {} as Record<string, string> 
    };
    
    // Check if colors are selected
    if (selectedColors.length === 0) {
      newErrors.colors = t('textiles.cart.minimumOrderError', { length: textile?.minimumOrder || '1' });
    }
    
    // Validate each color's length
    let hasLengthErrors = false;
    
    selectedColors.forEach(color => {
      const lengthValue = parseLength(color.length);
      
      if (lengthValue <= 0) {
        newErrors.colorLengths[color.value] = t('textiles.cart.enterValidLength');
        hasLengthErrors = true;
      } else if (textile?.minimumOrder && lengthValue < parseLength(textile.minimumOrder)) {
        newErrors.colorLengths[color.value] = t('textiles.cart.minimumOrderError', { length: textile.minimumOrder });
        hasLengthErrors = true;
      }
    });
    
    setErrors(newErrors);
    return !newErrors.colors && !hasLengthErrors;
  };

  // Handle the "Add to Cart" button
  const handleAddToCart = async () => {
    try {
      // Validate required fields
      if (!textile) {
        console.error('Please select a fabric');
        return;
      }
      
      if (selectedColors.length === 0) {
        console.error('Please select at least one color');
        return;
      }
      
      // Check each color's length and ensure it meets minimum order requirements
      let isValid = true;
      const invalidColors: string[] = [];
      
      selectedColors.forEach(colorItem => {
        const colorLength = parseFloat(colorItem.length);
        if (isNaN(colorLength) || colorLength < parseLength(textile.minimumOrder)) {
          isValid = false;
          invalidColors.push(colorItem.value);
        }
      });
      
      if (!isValid) {
        console.error(`Each color's length must be at least ${textile.minimumOrder} meters. Invalid colors: ${invalidColors.join(', ')}`);
        return;
      }
      
      // Clear any previous errors
      setErrors({ colors: '', colorLengths: {} });
      
      // Prepare color details for cart item
      const colorDetails = selectedColors.map(colorItem => {
        const colorObj = textile.colors.find(c => c.value === colorItem.value);
        return {
          color: colorItem.value,
          label: colorObj?.label || colorItem.value,
          quantity: colorItem.quantity,
          length: parseFloat(colorItem.length)
        };
      });
      
      // Calculate totals
      const totalQuantity = getTotalQuantity();
      const totalMeters = getTotalMeters();
      const totalPrice = calculateTotal();
      
      // Create cart item
      const cartItem: CartItem = {
        id: `textile_${textile.id}_${Date.now()}`,
        productName: textile.name,
        pricePerMeter: textile.price,
        currency: textile.currency || '$',
        totalPrice: totalPrice,
        totalQuantity: totalQuantity,
        totalMeters: totalMeters,
        colorDetails: colorDetails,
        notes: notes,
        addedAt: new Date().toISOString()
      };
      
      // Add to cart
      await addToCart(cartItem);
      
      // Format message for the modal
      const colorMessage = selectedColors.map(colorItem => {
        const colorObj = textile.colors.find(c => c.value === colorItem.value);
        return `${colorObj?.label || colorItem.value}: ${colorItem.quantity} x ${colorItem.length}m`;
      }).join('\n');
      
      // Set cart details for the modal
      setCartDetails({
        productName: textile.name,
        totalQuantity: totalQuantity,
        totalPrice: totalPrice,
        currency: textile.currency || '$',
        colorDetails: colorDetails
      });
      
      // Show modal
      setModalVisible(true);
      
      // Reset form
      setNotes('');
      setSelectedColors([]);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      console.error('Failed to add item to cart. Please try again.');
    }
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.headerTitle}>{t('textiles.cart.title')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>{t('textiles.cart.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>{t('textiles.cart.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Product Details */}
          <View style={styles.productInfoContainer}>
            <MaterialCommunityIcons 
              name="shopping-outline" 
              size={40} 
              color={theme.colors.primary} 
              style={styles.productIcon} 
            />
            <Text variant="titleMedium" style={styles.productTitle}>
              {textile?.name || 'Fabric'}
            </Text>
            <Text variant="bodyMedium" style={styles.productPrice}>
              {textile ? `${textile.currency} ${textile.price.toLocaleString()} ${t('textiles.cart.pricePerMeter')}` : 'Price information not available'}
            </Text>
            {textile?.minimumOrder && (
              <Text variant="bodySmall" style={styles.minOrderText}>
                {t('textiles.minimumOrder')}: {textile.minimumOrder}
              </Text>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Order Form */}
          <View style={styles.formContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('textiles.cart.orderDetails')}</Text>
            
            <View style={styles.prefilledNotice}>
              <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.prefilledText}>
                {t('textiles.cart.prefilledText')}
              </Text>
            </View>
            
            <View style={styles.colorSelectorWrapper}>
              <Text variant="titleSmall" style={styles.colorSectionTitle}>{t('textiles.cart.selectColorsTitle')}</Text>
              
              <View style={styles.colorsContainer}>
                {colorOptions.map((color) => {
                  const selectedColor = selectedColors.find(item => item.value === color.value);
                  const isSelected = !!selectedColor;
                  const errorText = errors.colorLengths[color.value];
                  
                  return (
                    <View key={color.value} style={styles.colorItemContainer}>
                      <TouchableOpacity
                        style={[
                          styles.colorSelectorItem,
                          isSelected && {
                            borderColor: theme.colors.primary,
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          }
                        ]}
                        onPress={() => toggleColor(color.value)}
                      >
                        <View 
                          style={[
                            styles.colorCircle, 
                            { backgroundColor: color.color }
                          ]} 
                        />
                        <Text style={[
                          styles.colorLabel,
                          isSelected && { fontWeight: '600' }
                        ]}>
                          {color.label}
                        </Text>
                        
                        {isSelected && (
                          <View style={[
                            styles.selectedBadge,
                            { backgroundColor: theme.colors.primary }
                          ]}>
                            <MaterialCommunityIcons 
                              name="check" 
                              size={16} 
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      
                      {isSelected && selectedColor && (
                        <View style={styles.colorOptionsContainer}>
                          <View style={styles.colorLengthContainer}>
                            <Text style={styles.colorInputLabel}>{t('textiles.cart.length')}:</Text>
                            <View style={[
                              styles.colorLengthInputContainer,
                              errorText && { borderColor: theme.colors.error }
                            ]}>
                              <TextInput
                                style={styles.colorLengthInput}
                                value={selectedColor.length}
                                onChangeText={(text) => updateColorLength(color.value, text)}
                                keyboardType="numeric"
                                placeholder={t('textiles.cart.length')}
                              />
                              <Text style={styles.lengthUnit}>{t('textiles.cart.lengthUnit')}</Text>
                            </View>
                          </View>
                          
                          {errorText && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                              {errorText}
                            </Text>
                          )}
                          
                          <View style={styles.colorQuantityContainer}>
                            <Text style={styles.colorInputLabel}>{t('textiles.cart.quantity')}:</Text>
                            <View style={styles.quantityControls}>
                              <TouchableOpacity
                                style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => updateColorQuantity(color.value, selectedColor.quantity - 1)}
                                disabled={selectedColor.quantity <= 1}
                              >
                                <MaterialCommunityIcons 
                                  name="minus" 
                                  size={16} 
                                  color={selectedColor.quantity <= 1 ? theme.colors.onSurfaceVariant : theme.colors.primary} 
                                />
                              </TouchableOpacity>
                              
                              <Text style={styles.quantityText}>
                                {selectedColor.quantity}
                              </Text>
                              
                              <TouchableOpacity
                                style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => updateColorQuantity(color.value, selectedColor.quantity + 1)}
                              >
                                <MaterialCommunityIcons 
                                  name="plus" 
                                  size={16} 
                                  color={theme.colors.primary} 
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            
            {errors.colors ? (
              <Text 
                style={{ 
                  color: theme.colors.error, 
                  fontSize: 12, 
                  marginVertical: 8
                }}
              >
                {errors.colors}
              </Text>
            ) : null}
            
            <SimpleFormInput
              label={t('textiles.cart.notes')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('textiles.cart.notesPlaceholder')}
              multiline
              numberOfLines={3}
              icon="note-text"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('textiles.cart.orderSummary')}</Text>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('textiles.cart.product')}:</Text>
              <Text variant="bodyMedium">{textile?.name || 'Fabric'}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('textiles.cart.pricePerMeter')}:</Text>
              <Text variant="bodyMedium">{textile ? `${textile.currency} ${textile.price.toLocaleString()}` : 'N/A'}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('textiles.cart.selectedColors')}:</Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {selectedColors.length > 0 ? (
                  selectedColors.map((selectedColor, index) => {
                    const colorInfo = colorOptions.find(c => c.value === selectedColor.value);
                    const parsedLength = parseLength(selectedColor.length);
                    return (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View 
                          style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 8, 
                            backgroundColor: selectedColor.value,
                            borderWidth: 1,
                            borderColor: '#DDDDDD',
                            marginRight: 8
                          }} 
                        />
                        <Text variant="bodyMedium">
                          {`${colorInfo?.label || selectedColor.value}: ${selectedColor.quantity} pcs × ${parsedLength.toFixed(2)}m`}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text variant="bodyMedium">{t('textiles.cart.noneSelected')}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('textiles.cart.totalPieces')}:</Text>
              <Text variant="bodyMedium">{getTotalQuantity()} {getTotalQuantity() === 1 ? t('textiles.cart.piece') : t('textiles.cart.pieces')}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('textiles.cart.totalFabric')}:</Text>
              <Text variant="bodyMedium">
                {getTotalMeters().toFixed(2)} {t('textiles.cart.metersTotal')}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text variant="titleMedium">{t('textiles.cart.totalPrice')}:</Text>
              <Text variant="titleMedium">
                {textile ? `${textile.currency} ${calculateTotal().toLocaleString()}` : 'N/A'}
              </Text>
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addButton}
            fullWidth
            icon="cart-plus"
          >
            {t('textiles.cart.continueButton')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Cart Added Modal */}
      <CartAddedModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back();
        }}
        productName={cartDetails.productName}
        totalQuantity={cartDetails.totalQuantity}
        totalPrice={cartDetails.totalPrice}
        currency={cartDetails.currency}
        colorDetails={cartDetails.colorDetails}
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
  backButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productInfoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  productIcon: {
    marginBottom: 8,
  },
  productTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    marginBottom: 4,
  },
  minOrderText: {
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
    height: 1,
  },
  formContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  prefilledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  prefilledText: {
    marginLeft: 8,
  },
  summaryContainer: {
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  addButton: {
    marginTop: 24,
    height: 54,
  },
  colorSelectorWrapper: {
    marginBottom: 16,
  },
  colorSectionTitle: {
    marginBottom: 8,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorItemContainer: {
    width: '50%',
    padding: 4,
    marginBottom: 8,
  },
  colorSelectorItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 8,
  },
  colorLabel: {
    flex: 1,
    fontSize: 14,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  colorOptionsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  colorLengthContainer: {
    marginBottom: 8,
  },
  colorInputLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666666',
  },
  colorLengthInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  colorLengthInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  lengthUnit: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  colorQuantityContainer: {
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
}); 