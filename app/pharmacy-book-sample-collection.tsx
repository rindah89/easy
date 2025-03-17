import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../components/Button';
import { Text as CustomText } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { SimpleFormInput as TextInput } from '../components/FormInput';

const availableTimeSlots = [
  { id: '1', time: '09:00 AM - 10:00 AM' },
  { id: '2', time: '10:00 AM - 11:00 AM' },
  { id: '3', time: '11:00 AM - 12:00 PM' },
  { id: '4', time: '12:00 PM - 01:00 PM' },
  { id: '5', time: '02:00 PM - 03:00 PM' },
  { id: '6', time: '03:00 PM - 04:00 PM' },
  { id: '7', time: '04:00 PM - 05:00 PM' },
  { id: '8', time: '05:00 PM - 06:00 PM' },
];

const availableTests = [
  { id: 1, name: 'Complete Blood Count', price: 35000, selected: false },
  { id: 2, name: 'Diabetes Screening', price: 45000, selected: false },
  { id: 3, name: 'Cholesterol Panel', price: 39000, selected: false },
  { id: 4, name: 'Thyroid Function', price: 69000, selected: false },
  { id: 5, name: 'Liver Function Test', price: 55000, selected: false },
  { id: 6, name: 'Kidney Function Test', price: 52000, selected: false },
  { id: 7, name: 'Vitamin D Test', price: 49000, selected: false },
  { id: 8, name: 'Iron Profile', price: 42000, selected: false },
];

const PharmacyBookSampleCollectionScreen = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tests, setTests] = useState(availableTests);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [testsError, setTestsError] = useState('');
  const [slotError, setSlotError] = useState('');
  
  // For date picker
  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    
    // Ensure the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (currentDate < today) {
      Alert.alert('Invalid Date', 'Please select a date from today onwards.');
      return;
    }
    
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Toggle test selection
  const toggleTestSelection = (testId: number) => {
    setTests(
      tests.map(test => 
        test.id === testId 
          ? { ...test, selected: !test.selected } 
          : test
      )
    );
    
    // Clear error if at least one test is selected
    if (tests.some(test => test.id === testId && !test.selected)) {
      setTestsError('');
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return tests
      .filter(test => test.selected)
      .reduce((total, test) => total + test.price, 0);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate phone for Cameroon format
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (!/^(237|6)\d{8}$/.test(phone.trim().replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid Cameroon phone number (e.g., 6XXXXXXXX or 237XXXXXXXX)');
      isValid = false;
    } else {
      setPhoneError('');
    }
    
    // Validate email (optional)
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate address
    if (!address.trim()) {
      setAddressError('Address is required for sample collection');
      isValid = false;
    } else {
      setAddressError('');
    }
    
    // Validate at least one test is selected
    if (!tests.some(test => test.selected)) {
      setTestsError('Please select at least one test');
      isValid = false;
    } else {
      setTestsError('');
    }
    
    // Validate time slot
    if (!selectedSlot) {
      setSlotError('Please select a time slot');
      isValid = false;
    } else {
      setSlotError('');
    }
    
    return isValid;
  };

  // Handle booking
  const handleBooking = () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Booking Confirmed',
        'Your lab sample collection has been scheduled successfully. You will receive a confirmation via SMS.',
        [{ text: 'OK', onPress: () => router.push('/pharmacy') }]
      );
    }, 1500);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <Button 
          mode="text" 
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          {''}
        </Button>
        <CustomText variant="headlineSmall" style={styles.headerTitle}>Book Lab Test</CustomText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.instructionHeader}>
              <MaterialIcons name="info-outline" size={24} color={theme.colors.primary} />
              <CustomText variant="titleMedium" style={styles.instructionTitle}>How It Works</CustomText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <CustomText style={styles.instructionNumberText}>1</CustomText>
              </View>
              <CustomText variant="bodyMedium">Select your preferred tests</CustomText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <CustomText style={styles.instructionNumberText}>2</CustomText>
              </View>
              <CustomText variant="bodyMedium">Choose a date and time slot</CustomText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <CustomText style={styles.instructionNumberText}>3</CustomText>
              </View>
              <CustomText variant="bodyMedium">Our phlebotomist will visit your home</CustomText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <CustomText style={styles.instructionNumberText}>4</CustomText>
              </View>
              <CustomText variant="bodyMedium">Get results within 24-48 hours via email</CustomText>
            </View>
          </Card.Content>
        </Card>

        {/* Select Tests */}
        <Card style={styles.card}>
          <Card.Content>
            <CustomText variant="titleMedium" style={styles.sectionTitle}>Select Tests</CustomText>
            {testsError ? (
              <CustomText variant="bodySmall" style={{ color: theme.colors.error }}>
                {testsError}
              </CustomText>
            ) : null}
            
            {tests.map((test) => (
              <View key={test.id} style={styles.testItem}>
                <View style={styles.testCheckboxContainer}>
                  <TouchableOpacity
                    onPress={() => toggleTestSelection(test.id)}
                    style={[
                      styles.checkbox,
                      { borderColor: theme.colors.primary }
                    ]}
                  >
                    {test.selected && (
                      <View style={[styles.checkboxInner, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </TouchableOpacity>
                  <CustomText variant="bodyMedium" style={styles.testName}>{test.name}</CustomText>
                </View>
                <CustomText variant="bodyMedium" style={styles.testPrice}>XAF {test.price.toLocaleString()}</CustomText>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalContainer}>
              <CustomText variant="titleMedium">Total</CustomText>
              <CustomText variant="titleMedium" style={styles.totalPrice}>
                XAF {calculateTotal().toLocaleString()}
              </CustomText>
            </View>
            
            {calculateTotal() > 0 && (
              <View style={styles.discountContainer}>
                <MaterialCommunityIcons name="tag" size={16} color={theme.colors.primary} />
                <CustomText variant="bodySmall" style={styles.discountText}>
                  10% discount applied on your first booking in Douala
                </CustomText>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Schedule */}
        <Card style={styles.card}>
          <Card.Content>
            <CustomText variant="titleMedium" style={styles.sectionTitle}>Schedule Appointment</CustomText>
            
            {/* Date Picker */}
            <View style={styles.dateContainer}>
              <CustomText variant="bodyMedium" style={styles.inputLabel}>Select Date</CustomText>
              <Button
                mode="outlined"
                onPress={showDatepicker}
                icon="calendar"
                style={styles.dateButton}
              >
                {formatDate(date)}
              </Button>
              
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
            
            {/* Time Slots */}
            <CustomText variant="bodyMedium" style={[styles.inputLabel, styles.slotLabel]}>Select Time Slot</CustomText>
            {slotError ? (
              <CustomText variant="bodySmall" style={{ color: theme.colors.error }}>
                {slotError}
              </CustomText>
            ) : null}
            
            <View style={styles.slotsContainer}>
              <View>
                {availableTimeSlots.map((slot) => (
                  <Card 
                    key={slot.id} 
                    style={[
                      styles.slotCard, 
                      selectedSlot === slot.id && styles.selectedSlotCard
                    ]}
                    onPress={() => setSelectedSlot(slot.id)}
                  >
                    <Card.Content style={styles.slotCardContent}>
                      <View style={[
                        styles.radioButton, 
                        { borderColor: theme.colors.primary }
                      ]}>
                        {selectedSlot === slot.id && (
                          <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
                        )}
                      </View>
                      <CustomText variant="bodyMedium" style={styles.slotTime}>{slot.time}</CustomText>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <CustomText variant="titleMedium" style={styles.sectionTitle}>Contact Information</CustomText>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                errorText={nameError}
                containerStyle={styles.input}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Phone Number (e.g. 6XXXXXXXX)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                errorText={phoneError}
                containerStyle={styles.input}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Email (Optional)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                errorText={emailError}
                containerStyle={styles.input}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Address for Sample Collection in Douala"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                errorText={addressError}
                containerStyle={styles.input}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Special Instructions (Optional)"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
                containerStyle={styles.input}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Booking Button */}
        <Button
          mode="contained"
          onPress={handleBooking}
          loading={loading}
          disabled={loading}
          style={styles.bookButton}
        >
          Confirm Booking
        </Button>
        
        <CustomText variant="bodySmall" style={styles.disclaimer}>
          By booking, you agree to our terms and conditions. You can cancel or reschedule up to 4 hours before your appointment.
        </CustomText>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testName: {
    marginLeft: 8,
  },
  testPrice: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    marginLeft: 4,
    color: '#4CAF50',
  },
  dateContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  dateButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  slotLabel: {
    marginTop: 8,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotCard: {
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSlotCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  slotCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  slotTime: {
    marginLeft: 4,
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  bookButton: {
    marginVertical: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disclaimer: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PharmacyBookSampleCollectionScreen; 