import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../components/CustomText';
import { Divider } from '../components/CustomDivider';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define checkout validation schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

enum CheckoutStep {
  ORDER_REVIEW = 0,
  SHIPPING_INFO = 1,
  PAYMENT = 2,
  CONFIRMATION = 3,
}

type PaymentMethod = 'credit_card' | 'mobile_money' | 'cash_on_delivery';

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.ORDER_REVIEW);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [orderId, setOrderId] = useState<string>('');
  
  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  const shippingFee = 3000; // Example shipping fee
  const tax = subtotal * 0.05; // 5% tax example
  const totalAmount = subtotal + shippingFee + tax;
  
  // Get currency from cart items
  const currency = cartItems.length > 0 ? cartItems[0].currency : 'XAF';
  
  // Form for shipping information
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: userProfile?.full_name || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phone_number || '',
      address: '',
      city: '',
      postalCode: '',
    },
    mode: 'onChange'
  });
  
  // Handle proceeding to next step
  const handleNextStep = () => {
    if (currentStep < CheckoutStep.CONFIRMATION) {
      setCurrentStep(prev => (prev + 1) as CheckoutStep);
    }
  };
  
  // Handle going back to previous step
  const handlePreviousStep = () => {
    if (currentStep > CheckoutStep.ORDER_REVIEW) {
      setCurrentStep(prev => (prev - 1) as CheckoutStep);
    } else {
      router.back(); // Go back to cart
    }
  };
  
  // Handle shipping info submission
  const onShippingSubmit = (data: CheckoutFormData) => {
    console.log('Shipping data:', data);
    handleNextStep();
  };
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };
  
  // Handle final order submission
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      // Generate random order ID
      const newOrderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setOrderId(newOrderId);
      setCurrentStep(CheckoutStep.CONFIRMATION);
      setIsProcessing(false);
      
      // Clear cart after successful order
      clearCart();
    }, 2000);
  };
  
  // Handle order confirmation and return to home
  const handleFinishCheckout = () => {
    router.navigate('/(tabs)');
  };
  
  // If cart is empty, redirect to cart
  if (cartItems.length === 0 && currentStep !== CheckoutStep.CONFIRMATION) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="cart-off" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={styles.emptyStateTitle}>Your cart is empty</Text>
          <Text variant="bodyMedium" style={styles.emptyStateText}>
            Add some items to your cart before proceeding to checkout.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.navigate('/(tabs)')}
            icon="shopping"
            style={styles.shopButton}
            fullWidth
          >
            Start Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {currentStep === CheckoutStep.ORDER_REVIEW && 'Order Review'}
          {currentStep === CheckoutStep.SHIPPING_INFO && 'Shipping Information'}
          {currentStep === CheckoutStep.PAYMENT && 'Payment Method'}
          {currentStep === CheckoutStep.CONFIRMATION && 'Order Confirmation'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStepContainer}>
            <View 
              style={[
                styles.progressStep, 
                { 
                  backgroundColor: step <= currentStep 
                    ? theme.colors.primary 
                    : theme.colors.surfaceVariant
                }
              ]}
            >
              {step < currentStep ? (
                <MaterialCommunityIcons name="check" size={16} color="white" />
              ) : (
                <Text 
                  variant="bodySmall" 
                  style={{ color: step === currentStep ? 'white' : theme.colors.onSurfaceVariant }}
                >
                  {step + 1}
                </Text>
              )}
            </View>
            {step < 3 && (
              <View 
                style={[
                  styles.progressLine, 
                  { 
                    backgroundColor: step < currentStep 
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant
                  }
                ]} 
              />
            )}
          </View>
        ))}
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Review Step */}
          {currentStep === CheckoutStep.ORDER_REVIEW && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>
                
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.orderItem}>
                    <View style={styles.orderItemHeader}>
                      <MaterialCommunityIcons 
                        name="package-variant-closed" 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <Text variant="bodyMedium" style={styles.orderItemTitle}>{item.productName}</Text>
                    </View>
                    
                    <View style={styles.orderItemDetails}>
                      <Text variant="bodySmall">
                        Quantity: {item.totalQuantity} {item.totalQuantity === 1 ? 'piece' : 'pieces'}
                      </Text>
                      <Text variant="bodySmall">
                        {item.totalMeters.toFixed(2)} meters
                      </Text>
                      <Text variant="bodyMedium" style={styles.orderItemPrice}>
                        {currency} {item.totalPrice.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Price Details</Text>
                
                <View style={styles.priceRow}>
                  <Text variant="bodyMedium">Subtotal</Text>
                  <Text variant="bodyMedium">{currency} {subtotal.toLocaleString()}</Text>
                </View>
                
                <View style={styles.priceRow}>
                  <Text variant="bodyMedium">Shipping Fee</Text>
                  <Text variant="bodyMedium">{currency} {shippingFee.toLocaleString()}</Text>
                </View>
                
                <View style={styles.priceRow}>
                  <Text variant="bodyMedium">Tax (5%)</Text>
                  <Text variant="bodyMedium">{currency} {tax.toLocaleString()}</Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.priceRow}>
                  <Text variant="titleMedium">Total</Text>
                  <Text 
                    variant="titleMedium" 
                    style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                  >
                    {currency} {totalAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={styles.actionButton}
                fullWidth
              >
                Continue to Shipping
              </Button>
            </View>
          )}
          
          {/* Shipping Information Step */}
          {currentStep === CheckoutStep.SHIPPING_INFO && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Shipping Address
                </Text>
                
                <FormInput
                  control={control}
                  name="fullName"
                  label="Full Name"
                  placeholder="Your full name"
                  error={errors.fullName}
                  icon="account"
                />
                
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="your.email@example.com"
                  error={errors.email}
                  keyboardType="email-address"
                  icon="email"
                />
                
                <FormInput
                  control={control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+237XXXXXXXXX"
                  error={errors.phoneNumber}
                  keyboardType="phone-pad"
                  icon="phone"
                />
                
                <FormInput
                  control={control}
                  name="address"
                  label="Address"
                  placeholder="Street address"
                  error={errors.address}
                  icon="map-marker"
                />
                
                <View style={styles.rowFields}>
                  <View style={styles.halfField}>
                    <FormInput
                      control={control}
                      name="city"
                      label="City"
                      placeholder="Your city"
                      error={errors.city}
                      icon="city"
                    />
                  </View>
                  
                  <View style={styles.halfField}>
                    <FormInput
                      control={control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="Postal code"
                      error={errors.postalCode}
                      icon="mailbox"
                    />
                  </View>
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={handleSubmit(onShippingSubmit)}
                style={styles.actionButton}
                fullWidth
                disabled={!isValid}
              >
                Continue to Payment
              </Button>
            </View>
          )}
          
          {/* Payment Method Step */}
          {currentStep === CheckoutStep.PAYMENT && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Select Payment Method
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === 'mobile_money' && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primaryContainer
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect('mobile_money')}
                >
                  <MaterialCommunityIcons 
                    name="cellphone" 
                    size={24} 
                    color={selectedPaymentMethod === 'mobile_money' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <View style={styles.paymentOptionTextContainer}>
                    <Text variant="bodyMedium" style={styles.paymentOptionTitle}>
                      Mobile Money
                    </Text>
                    <Text variant="bodySmall" style={styles.paymentOptionDescription}>
                      Pay with MTN Mobile Money or Orange Money
                    </Text>
                  </View>
                  {selectedPaymentMethod === 'mobile_money' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === 'credit_card' && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primaryContainer
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect('credit_card')}
                >
                  <MaterialCommunityIcons 
                    name="credit-card" 
                    size={24} 
                    color={selectedPaymentMethod === 'credit_card' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <View style={styles.paymentOptionTextContainer}>
                    <Text variant="bodyMedium" style={styles.paymentOptionTitle}>
                      Credit / Debit Card
                    </Text>
                    <Text variant="bodySmall" style={styles.paymentOptionDescription}>
                      Pay using Visa, Mastercard, or other card
                    </Text>
                  </View>
                  {selectedPaymentMethod === 'credit_card' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === 'cash_on_delivery' && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primaryContainer
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect('cash_on_delivery')}
                >
                  <MaterialCommunityIcons 
                    name="cash" 
                    size={24} 
                    color={selectedPaymentMethod === 'cash_on_delivery' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <View style={styles.paymentOptionTextContainer}>
                    <Text variant="bodyMedium" style={styles.paymentOptionTitle}>
                      Cash on Delivery
                    </Text>
                    <Text variant="bodySmall" style={styles.paymentOptionDescription}>
                      Pay with cash when your order is delivered
                    </Text>
                  </View>
                  {selectedPaymentMethod === 'cash_on_delivery' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.sectionContainer}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Order Total</Text>
                <View style={styles.orderTotalContainer}>
                  <Text variant="headlineSmall" style={styles.orderTotalAmount}>
                    {currency} {totalAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={handlePlaceOrder}
                style={styles.actionButton}
                fullWidth
                loading={isProcessing}
                disabled={isProcessing}
              >
                Place Order
              </Button>
            </View>
          )}
          
          {/* Order Confirmation Step */}
          {currentStep === CheckoutStep.CONFIRMATION && (
            <View style={styles.stepContainer}>
              <View style={styles.confirmationContainer}>
                <View style={[styles.successIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="check" size={64} color={theme.colors.primary} />
                </View>
                
                <Text variant="headlineSmall" style={styles.confirmationTitle}>
                  Order Successful!
                </Text>
                
                <Text variant="bodyMedium" style={styles.confirmationMessage}>
                  Your order has been placed successfully. We will contact you shortly with further details.
                </Text>
                
                <View style={styles.orderInfoContainer}>
                  <Text variant="bodyLarge" style={styles.orderInfoLabel}>
                    Order ID:
                  </Text>
                  <Text variant="bodyLarge" style={styles.orderInfoValue}>
                    {orderId}
                  </Text>
                </View>
                
                <View style={styles.orderInfoContainer}>
                  <Text variant="bodyLarge" style={styles.orderInfoLabel}>
                    Total Amount:
                  </Text>
                  <Text variant="bodyLarge" style={styles.orderInfoValue}>
                    {currency} {totalAmount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.orderInfoContainer}>
                  <Text variant="bodyLarge" style={styles.orderInfoLabel}>
                    Payment Method:
                  </Text>
                  <Text variant="bodyLarge" style={styles.orderInfoValue}>
                    {selectedPaymentMethod === 'mobile_money' && 'Mobile Money'}
                    {selectedPaymentMethod === 'credit_card' && 'Credit/Debit Card'}
                    {selectedPaymentMethod === 'cash_on_delivery' && 'Cash on Delivery'}
                  </Text>
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={handleFinishCheckout}
                style={styles.actionButton}
                fullWidth
              >
                Continue Shopping
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContainer: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
  },
  orderItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemTitle: {
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  orderItemDetails: {
    paddingLeft: 28,
  },
  orderItemPrice: {
    fontWeight: '600',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  actionButton: {
    height: 54,
    marginTop: 8,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontWeight: '500',
  },
  paymentOptionDescription: {
    color: '#666666',
  },
  orderTotalContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderTotalAmount: {
    fontWeight: 'bold',
  },
  confirmationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmationMessage: {
    textAlign: 'center',
    marginBottom: 24,
  },
  orderInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  orderInfoLabel: {
    fontWeight: '500',
    width: '40%',
  },
  orderInfoValue: {
    width: '60%',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
  },
  shopButton: {
    height: 54,
  },
}); 