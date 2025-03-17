import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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

// Mock user data - in a real app, this would come from user authentication or profile
const userProfile = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1 (555) 123-4567',
  address: '123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States',
};

export default function RequestSampleScreen() {
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
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber);
  const [address, setAddress] = useState(userProfile.address);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
    };
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is invalid';
      isValid = false;
    }
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleRequestSample = () => {
    if (validateForm()) {
      // In a real app, this would send the sample request
      Alert.alert(
        "Sample Request Submitted",
        `Your sample of ${textile?.name || 'fabric'} will be sent to your address. You will receive a confirmation email shortly.`,
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
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
          <Text variant="titleLarge" style={styles.headerTitle}>Request Sample</Text>
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
        <Text variant="titleLarge" style={styles.headerTitle}>Request Sample</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Textile Information */}
          <View style={styles.textileInfoContainer}>
            {textile && textile.imageUrl ? (
              <Image
                source={textile.imageUrl}
                style={styles.fabricImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.fabricImage, styles.imagePlaceholder]}>
                <MaterialCommunityIcons name="image-off" size={40} color="#ccc" />
              </View>
            )}
            <Text variant="titleMedium" style={styles.fabricName}>
              {textile?.name || 'Fabric Sample'}
            </Text>
            <Text variant="bodyMedium" style={styles.fabricDescription}>
              Request a free sample of this fabric to feel the quality and see the true color before making your purchase.
            </Text>
          </View>
          
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
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            icon="account"
            errorText={errors.fullName}
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
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            icon="phone"
            errorText={errors.phoneNumber}
          />
          
          <SimpleFormInput
            label="Shipping Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your complete address"
            multiline
            numberOfLines={3}
            icon="map-marker"
            errorText={errors.address}
          />
          
          <SimpleFormInput
            label="Additional Notes (Optional)"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Any specific requirements or questions"
            multiline
            numberOfLines={3}
            icon="note-text"
          />
          
          <View style={styles.noteContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} style={styles.noteIcon} />
            <Text variant="bodySmall" style={styles.noteText}>
              Samples are sent free of charge. Please note that sample quantities are limited to 1 per fabric type.
            </Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleRequestSample}
            style={styles.requestButton}
            fullWidth
            icon="package-variant"
          >
            Request Sample
          </Button>
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
    paddingBottom: 40,
  },
  textileInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fabricImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabricName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  fabricDescription: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 16,
  },
  divider: {
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 16,
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
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    color: '#666',
  },
  requestButton: {
    borderRadius: 12,
    height: 54,
  },
}); 