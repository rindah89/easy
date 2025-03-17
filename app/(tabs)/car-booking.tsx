import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Platform, Animated } from 'react-native';
import { useTheme, Dialog, Portal } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Text } from '../../components/CustomText';
import { Card } from '../../components/CustomCard';
import { Divider } from '../../components/CustomDivider';
import { IconButton } from '../../components/CustomIconButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';

interface BookingFormData {
  pickupDate: Date;
  returnDate: Date;
  fullName: string;
  phoneNumber: string;
  email: string;
  driverLicense: string;
  paymentMethod: 'credit_card' | 'mobile_money' | 'cash';
}

export default function CarBookingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const animationRef = useRef<LottieView>(null);
  
  // Animation value for custom toast
  const toastAnim = useRef(new Animated.Value(0)).current;
  
  // Extract car details from params
  const carId = params.carId as string;
  const carName = params.carName as string;
  const carImage = params.carImage as string;
  const carPrice = parseInt(params.carPrice as string);
  const carCategory = params.carCategory as string;
  
  // State for date pickers
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  
  // Initialize booking form with default values
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    pickupDate: new Date(),
    returnDate: new Date(new Date().setDate(new Date().getDate() + 3)), // Default 3 days rental
    fullName: '',
    phoneNumber: '',
    email: '',
    driverLicense: '',
    paymentMethod: 'mobile_money',
  });
  
  // Calculate rental duration in days
  const rentalDays = Math.max(1, Math.ceil(
    (bookingForm.returnDate.getTime() - bookingForm.pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  // Calculate total price
  const totalPrice = carPrice * rentalDays;
  
  // Fixed caution amount
  const cautionAmount = 100000;
  
  // Replace Snackbar state with custom toast state
  const [showToast, setShowToast] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Handle custom toast animation
  useEffect(() => {
    if (showToast) {
      // Animate toast in
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
      });
    }
  }, [showToast, toastAnim]);
  
  // Handle date changes
  const onPickupDateChange = (event: any, selectedDate?: Date) => {
    setShowPickupDatePicker(false);
    if (selectedDate) {
      // Preserve the time from the current pickup date if only changing the date
      const currentTime = bookingForm.pickupDate;
      selectedDate.setHours(currentTime.getHours());
      selectedDate.setMinutes(currentTime.getMinutes());
      
      setBookingForm({
        ...bookingForm,
        pickupDate: selectedDate,
        // Ensure return date is after pickup date
        returnDate: selectedDate > bookingForm.returnDate 
          ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) 
          : bookingForm.returnDate
      });
    }
  };
  
  // Add time picker handling
  const onPickupTimeChange = (event: any, selectedTime?: Date) => {
    setShowPickupTimePicker(false);
    if (selectedTime) {
      // Create a new date with the selected time but preserve the current date
      const newDate = new Date(bookingForm.pickupDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      
      setBookingForm({
        ...bookingForm,
        pickupDate: newDate
      });
    }
  };
  
  const onReturnDateChange = (event: any, selectedDate?: Date) => {
    setShowReturnDatePicker(false);
    if (selectedDate) {
      setBookingForm({
        ...bookingForm,
        returnDate: selectedDate
      });
    }
  };
  
  // Handle form input changes
  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setBookingForm({
      ...bookingForm,
      [field]: value
    });
  };
  
  // Handle booking submission
  const handleBooking = () => {
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', {
      carId,
      ...bookingForm,
      totalPrice,
      rentalDays,
      cautionAmount
    });
    
    // Show booking animation and success message
    setBookingComplete(true);
    
    // Play animation with proper control
    setTimeout(() => {
      if (animationRef.current) {
        // Reset animation to start
        animationRef.current.reset();
        // Play the animation
        animationRef.current.play();
      }
    }, 100); // Small delay to ensure component is mounted
    
    // Show custom toast instead of snackbar
    setShowToast(true);
    
    // Remove the auto-navigation timeout - we'll navigate on button press instead
  };
  
  // Handle confirmation button press
  const handleConfirmBooking = () => {
    setBookingComplete(false);
    router.back();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>Book Your Car</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.carSummaryCard}>
          <View style={styles.carSummaryContent}>
            <Image 
              source={{ uri: carImage }} 
              style={styles.carThumbnail}
              resizeMode="cover"
            />
            <View style={styles.carSummaryDetails}>
              <Text variant="titleMedium" style={styles.carName}>{carName}</Text>
              <Text variant="bodyMedium" style={styles.carCategory}>{carCategory}</Text>
              <Text variant="titleSmall" style={styles.carPrice}>
                {carPrice.toLocaleString()} XAF/day
              </Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.bookingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Rental Period</Text>
            
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerContainer}>
                <Text variant="bodyMedium" style={styles.dateLabel}>Pickup Date</Text>
                <TouchableOpacity 
                  style={[styles.datePickerButton, { borderColor: theme.colors.primary + '40' }]}
                  onPress={() => setShowPickupDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {bookingForm.pickupDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showPickupDatePicker && (
                  <DateTimePicker
                    value={bookingForm.pickupDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onPickupDateChange}
                    minimumDate={new Date()}
                    accentColor="#FF0000"
                    themeVariant={theme.dark ? 'dark' : 'light'}
                  />
                )}
              </View>
              
              <View style={styles.datePickerContainer}>
                <Text variant="bodyMedium" style={styles.dateLabel}>Pickup Time</Text>
                <TouchableOpacity 
                  style={[styles.datePickerButton, { borderColor: theme.colors.primary + '40' }]}
                  onPress={() => setShowPickupTimePicker(true)}
                >
                  <MaterialCommunityIcons name="clock" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {bookingForm.pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                {showPickupTimePicker && (
                  <DateTimePicker
                    value={bookingForm.pickupDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onPickupTimeChange}
                    accentColor="#FF0000"
                    themeVariant={theme.dark ? 'dark' : 'light'}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerContainer}>
                <Text variant="bodyMedium" style={styles.dateLabel}>Return Date</Text>
                <TouchableOpacity 
                  style={[styles.datePickerButton, { borderColor: theme.colors.primary + '40' }]}
                  onPress={() => setShowReturnDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {bookingForm.returnDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showReturnDatePicker && (
                  <DateTimePicker
                    value={bookingForm.returnDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onReturnDateChange}
                    minimumDate={new Date(bookingForm.pickupDate.getTime() + 24 * 60 * 60 * 1000)}
                    accentColor="#FF0000"
                    themeVariant={theme.dark ? 'dark' : 'light'}
                  />
                )}
              </View>
              
              <View style={styles.datePickerContainer}>
                {/* Empty space to balance the layout */}
              </View>
            </View>
            
            <View style={styles.durationContainer}>
              <Text variant="bodyMedium">Duration:</Text>
              <Text variant="bodyMedium" style={styles.durationText}>
                {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.bookingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Driver Information</Text>
            
            <View style={styles.inputContainer}>
              <Text variant="bodyMedium" style={styles.inputLabel}>Full Name</Text>
              <View style={styles.textInputContainer}>
                <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.inputText}>John Doe</Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text variant="bodyMedium" style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.textInputContainer}>
                <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.inputText}>+237 6XX XXX XXX</Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text variant="bodyMedium" style={styles.inputLabel}>Email Address</Text>
              <View style={styles.textInputContainer}>
                <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.inputText}>example@email.com</Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text variant="bodyMedium" style={styles.inputLabel}>Driver's License</Text>
              <View style={styles.textInputContainer}>
                <MaterialCommunityIcons name="card-account-details" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.inputText}>DL-XXXXXXXX</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.bookingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption, 
                bookingForm.paymentMethod === 'mobile_money' && styles.selectedPaymentOption
              ]}
              onPress={() => handleInputChange('paymentMethod', 'mobile_money')}
            >
              <MaterialCommunityIcons 
                name="phone" 
                size={24} 
                color={bookingForm.paymentMethod === 'mobile_money' ? theme.colors.primary : theme.colors.onSurface} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.paymentOptionText,
                  bookingForm.paymentMethod === 'mobile_money' && { color: theme.colors.primary }
                ]}
              >
                Mobile Money
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption, 
                bookingForm.paymentMethod === 'credit_card' && styles.selectedPaymentOption
              ]}
              onPress={() => handleInputChange('paymentMethod', 'credit_card')}
            >
              <MaterialCommunityIcons 
                name="credit-card" 
                size={24} 
                color={bookingForm.paymentMethod === 'credit_card' ? theme.colors.primary : theme.colors.onSurface} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.paymentOptionText,
                  bookingForm.paymentMethod === 'credit_card' && { color: theme.colors.primary }
                ]}
              >
                Credit Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption, 
                bookingForm.paymentMethod === 'cash' && styles.selectedPaymentOption
              ]}
              onPress={() => handleInputChange('paymentMethod', 'cash')}
            >
              <MaterialCommunityIcons 
                name="cash" 
                size={24} 
                color={bookingForm.paymentMethod === 'cash' ? theme.colors.primary : theme.colors.onSurface} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.paymentOptionText,
                  bookingForm.paymentMethod === 'cash' && { color: theme.colors.primary }
                ]}
              >
                Cash on Pickup
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        <Card style={styles.bookingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Booking Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Car Rental ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</Text>
              <Text variant="bodyMedium">{carPrice.toLocaleString()} XAF × {rentalDays}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Insurance</Text>
              <Text variant="bodyMedium">Included</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Security Deposit (Caution)</Text>
              <Text variant="bodyMedium">100,000 XAF</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text variant="titleMedium" style={styles.totalLabel}>Total</Text>
              <Text variant="titleMedium" style={styles.totalAmount}>{totalPrice.toLocaleString()} XAF</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text variant="bodyMedium" style={styles.cautionLabel}>Caution Required</Text>
              <Text variant="bodyMedium" style={styles.cautionAmount}>100,000 XAF</Text>
            </View>
          </Card.Content>
        </Card>
        
        {!bookingComplete && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleBooking}
              fullWidth
              style={styles.confirmButton}
            >
              Confirm Booking
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.back()}
              fullWidth
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        )}
      </ScrollView>
      
      {/* Success Dialog */}
      <Portal>
        <Dialog
          visible={bookingComplete}
          dismissable={false}
          style={styles.successDialog}
        >
          <Dialog.Content style={styles.successDialogContent}>
            <LottieView
              ref={animationRef}
              source={require('../../assets/animations/booking-success.json')}
              style={styles.successAnimation}
              autoPlay={true}
              loop={false}
              speed={0.8}
              resizeMode="cover"
              onAnimationFinish={() => {
                console.log('Animation finished');
              }}
            />
            <Text variant="headlineMedium" style={[styles.successText, { color: theme.colors.primary }]}>
              Booking Successful!
            </Text>
            <Text variant="bodyLarge" style={styles.successSubtext}>
              Your car rental request has been submitted.
            </Text>
            <Text variant="bodyMedium" style={styles.successNotice}>
              You will receive email and SMS confirmations 
              once your booking is approved.
            </Text>
            
            <Button
              mode="contained"
              onPress={handleConfirmBooking}
              style={styles.confirmDialogButton}
              fullWidth
            >
              Confirm
            </Button>
          </Dialog.Content>
        </Dialog>
      </Portal>
      
      {/* Custom toast notification */}
      {showToast && (
        <Animated.View 
          style={[
            styles.customToast, 
            { 
              backgroundColor: theme.colors.primaryContainer,
              transform: [{ translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })}],
              opacity: toastAnim
            }
          ]}
        >
          <Card style={styles.toastCard}>
            <Card.Content style={styles.toastContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={24} 
                color={theme.colors.primary}
                style={styles.toastIcon}
              />
              <Text variant="bodyMedium" style={styles.toastText}>
                Booking successful! Your car rental has been confirmed.
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  carSummaryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  carSummaryContent: {
    flexDirection: 'row',
    padding: 16,
  },
  carThumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
  },
  carSummaryDetails: {
    marginLeft: 16,
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  carCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  bookingCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dateText: {
    marginLeft: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  durationText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  inputText: {
    marginLeft: 8,
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderColor: '#4A6FFF',
    backgroundColor: 'rgba(74, 111, 255, 0.05)',
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  cautionLabel: {
    fontWeight: 'bold',
  },
  cautionAmount: {
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  actionButtons: {
    marginBottom: 24,
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  successDialog: {
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
    alignSelf: 'center',
  },
  successDialogContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  successAnimation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  successText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 16,
    marginBottom: 12,
  },
  successNotice: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    marginTop: 8,
    color: '#555',
    marginBottom: 24,
  },
  confirmDialogButton: {
    marginTop: 16,
    paddingVertical: 8,
    width: '100%',
  },
  customToast: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastCard: {
    borderRadius: 8,
    marginBottom: 0,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    fontWeight: 'bold',
  },
}); 