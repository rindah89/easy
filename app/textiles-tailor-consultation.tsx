import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Alert, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SimpleFormInput } from '../components/FormInput';
import { Text } from '../components/CustomText';
import { Divider } from '../components/CustomDivider';
import { textiles } from '../data/textiles';

const { width } = Dimensions.get('window');

// Mock user data - in a real app, this would come from user authentication or profile
const userProfile = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1 (555) 123-4567',
  address: '123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States',
};

// Available consultation time slots
const timeSlots = [
  { id: '1', day: 'Monday', date: '24 Jul', times: ['09:00', '11:00', '14:00', '16:00'] },
  { id: '2', day: 'Tuesday', date: '25 Jul', times: ['10:00', '13:00', '15:00', '17:00'] },
  { id: '3', day: 'Wednesday', date: '26 Jul', times: ['09:30', '11:30', '14:30', '16:30'] },
  { id: '4', day: 'Thursday', date: '27 Jul', times: ['10:30', '12:30', '15:30', '17:30'] },
  { id: '5', day: 'Friday', date: '28 Jul', times: ['09:00', '12:00', '15:00', '17:00'] },
];

export default function TailorConsultationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { textileId } = params;
  
  // Find the textile details based on the ID
  const [textile, setTextile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (textileId) {
      const found = textiles.find(t => t.id === textileId);
      if (found) {
        setTextile(found);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [textileId]);
  
  // Form state - pre-filled with user profile data
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phoneNumber);
  const [projectDetails, setProjectDetails] = useState('');
  const [measurementsAvailable, setMeasurementsAvailable] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { 
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
    };
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is invalid';
      isValid = false;
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }
    
    if (!selectedDate) {
      newErrors.date = 'Please select a date';
      isValid = false;
    }
    
    if (!selectedTime) {
      newErrors.time = 'Please select a time';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSchedule = () => {
    if (validateForm()) {
      // In a real app, this would schedule the consultation
      Alert.alert(
        "Consultation Scheduled",
        `Your tailor consultation has been scheduled for ${selectedDate} at ${selectedTime}.`,
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    }
  };

  const renderDateSelector = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.datesContainer}
      >
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.dateCard,
              selectedDate === `${slot.day}, ${slot.date}` && 
                { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setSelectedDate(`${slot.day}, ${slot.date}`)}
          >
            <Text 
              variant="bodyMedium" 
              style={[
                styles.dayText,
                selectedDate === `${slot.day}, ${slot.date}` && 
                  { color: theme.colors.onPrimary }
              ]}
            >
              {slot.day}
            </Text>
            <Text 
              variant="titleMedium" 
              style={[
                styles.dateText,
                selectedDate === `${slot.day}, ${slot.date}` && 
                  { color: theme.colors.onPrimary }
              ]}
            >
              {slot.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTimeSelector = () => {
    if (!selectedDate) return null;
    
    const selectedDateObj = timeSlots.find(
      slot => `${slot.day}, ${slot.date}` === selectedDate
    );
    
    if (!selectedDateObj) return null;
    
    return (
      <View style={styles.timeSlotsContainer}>
        <Text variant="bodyLarge" style={styles.timeSlotsTitle}>
          Available Time Slots
        </Text>
        <View style={styles.timeSlots}>
          {selectedDateObj.times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && 
                  { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.timeText,
                  selectedTime === time && 
                    { color: theme.colors.onPrimary }
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.time ? <Text variant="bodySmall" style={styles.errorText}>{errors.time}</Text> : null}
      </View>
    );
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
          <Text variant="titleLarge" style={styles.headerTitle}>Schedule Consultation</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>Loading textile information...</Text>
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
        <Text variant="titleLarge" style={styles.headerTitle}>Schedule Consultation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Introduction */}
        <View style={styles.introContainer}>
          <MaterialCommunityIcons 
            name="calendar-clock" 
            size={40} 
            color={theme.colors.primary} 
            style={styles.introIcon} 
          />
          <Text variant="titleMedium" style={styles.introTitle}>
            Tailor Consultation
          </Text>
          <Text variant="bodyMedium" style={styles.introText}>
            Schedule a consultation with our expert tailors to discuss your project using 
            {textile ? ` ${textile.name}` : ' our fabrics'}.
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Date Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Select a Date</Text>
        {renderDateSelector()}
        {errors.date ? <Text variant="bodySmall" style={styles.errorText}>{errors.date}</Text> : null}
        
        {/* Time Selection */}
        {selectedDate && (
          <>
            <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
              Select a Time
            </Text>
            {renderTimeSelector()}
          </>
        )}
        
        <Divider style={styles.divider} />
        
        {/* Contact Information */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Your Information</Text>
        
        <View style={styles.prefilledNotice}>
          <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
          <Text variant="bodySmall" style={styles.prefilledText}>
            We've pre-filled your information to make this easier. You can edit if needed.
          </Text>
        </View>
        
        <SimpleFormInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          icon="account"
          errorText={errors.name}
        />
        
        <SimpleFormInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          icon="email"
          errorText={errors.email}
        />
        
        <SimpleFormInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          icon="phone"
          errorText={errors.phone}
        />
        
        <SimpleFormInput
          label="Project Details (Optional)"
          value={projectDetails}
          onChangeText={setProjectDetails}
          placeholder="Describe what you're looking to create with this fabric"
          multiline
          numberOfLines={4}
          icon="tshirt-crew"
        />
        
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setMeasurementsAvailable(!measurementsAvailable)}
          >
            <MaterialCommunityIcons 
              name={measurementsAvailable ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          <Text variant="bodyMedium" style={styles.checkboxLabel}>
            I already have my measurements ready
          </Text>
        </View>
        
        <Button
          mode="contained"
          onPress={handleSchedule}
          style={styles.scheduleButton}
          fullWidth
          icon="calendar-check"
        >
          Schedule Consultation
        </Button>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  introIcon: {
    marginBottom: 12,
  },
  introTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  divider: {
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  datesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateCard: {
    width: 100,
    height: 90,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  dayText: {
    marginBottom: 4,
  },
  dateText: {
    fontWeight: '600',
  },
  timeSlotsContainer: {
    marginTop: 8,
  },
  timeSlotsTitle: {
    marginBottom: 12,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    marginBottom: 12,
  },
  timeText: {
    textAlign: 'center',
  },
  prefilledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  prefilledText: {
    marginLeft: 8,
    flex: 1,
    color: '#4285F4',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1,
  },
  scheduleButton: {
    marginTop: 24,
    borderRadius: 12,
    height: 54,
  },
  errorText: {
    color: '#B00020',
    marginTop: 4,
    marginBottom: 8,
  },
}); 