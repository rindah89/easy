import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import custom components
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Chip } from '../components/CustomChip';
import { Divider } from '../components/CustomDivider';
import { Badge } from '../components/CustomBadge';

// Import mock data
import { rideTypes, mockDrivers } from '../data/rideData';

export default function RideSelection() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ pickup: string; destination: string }>();
  
  const [selectedRideType, setSelectedRideType] = useState<string>('standard');
  const [paymentMethod, setPaymentMethod] = useState<string>('creditcard');
  
  // Get the selected ride type details
  const selectedRide = rideTypes.find(ride => ride.id === selectedRideType);
  
  // Get a driver based on the selected ride type
  const matchedDriver = selectedRideType === 'bike' 
    ? mockDrivers.find(driver => driver.vehicle.toLowerCase().includes('bike'))
    : mockDrivers.find(driver => !driver.vehicle.toLowerCase().includes('bike'));
  
  // Handle ride confirmation
  const handleConfirmRide = () => {
    router.push({
      pathname: '/ride-confirmation',
      params: {
        pickup: params.pickup || 'Current location',
        destination: params.destination || 'Destination',
        rideType: selectedRideType,
        paymentMethod
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>Select Ride</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Route Info */}
      <Card style={styles.routeCard}>
        <Card.Content>
          <View style={styles.tripPointsContainer}>
            <View style={styles.tripPoint}>
              <Ionicons name="radio-button-on" size={24} color={theme.colors.primary} />
              <View style={styles.tripPointContent}>
                <Text variant="bodyMedium" numberOfLines={1}>Pickup</Text>
                <Text variant="bodySmall" style={styles.addressText} numberOfLines={2}>
                  {params.pickup || 'Current location'}
                </Text>
              </View>
            </View>
            
            <View style={styles.tripPointConnector}>
              <View style={styles.dottedLine} />
            </View>
            
            <View style={styles.tripPoint}>
              <Ionicons name="location" size={24} color={theme.colors.error} />
              <View style={styles.tripPointContent}>
                <Text variant="bodyMedium" numberOfLines={1}>Destination</Text>
                <Text variant="bodySmall" style={styles.addressText} numberOfLines={2}>
                  {params.destination || 'Destination'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Ride Options */}
      <ScrollView style={styles.scrollContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Available Rides</Text>
        
        {rideTypes.map(ride => (
          <TouchableOpacity 
            key={ride.id}
            onPress={() => setSelectedRideType(ride.id)}
          >
            <Card 
              style={[
                styles.rideCard,
                selectedRideType === ride.id && styles.selectedRideCard
              ]}
            >
              <Card.Content style={styles.rideCardContent}>
                <View style={styles.rideInfo}>
                  <View style={styles.rideIconContainer}>
                    <Image 
                      source={{ uri: ride.image }} 
                      style={styles.rideImage}
                    />
                  </View>
                  <View style={styles.rideDetails}>
                    <Text variant="titleMedium">{ride.name}</Text>
                    <Text variant="bodySmall" style={styles.rideDescription}>
                      {ride.description}
                    </Text>
                    <Text variant="bodySmall" style={styles.rideEta}>
                      {ride.eta} min • {ride.capacity} {ride.capacity > 1 ? 'seats' : 'seat'}
                    </Text>
                  </View>
                  <View style={styles.ridePriceContainer}>
                    <Text variant="titleMedium">{ride.currency} {ride.price.toLocaleString()}</Text>
                  </View>
                </View>
                
                {selectedRideType === ride.id && matchedDriver && (
                  <View style={styles.driverPreview}>
                    <Divider style={styles.driverDivider} />
                    <View style={styles.driverInfo}>
                      <Image 
                        source={{ uri: matchedDriver.photoUrl }} 
                        style={styles.driverAvatar} 
                      />
                      <View style={styles.driverDetails}>
                        <Text variant="bodyMedium">{matchedDriver.name}</Text>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text variant="bodySmall" style={styles.ratingText}>
                            {matchedDriver.rating}
                          </Text>
                        </View>
                      </View>
                      <Text variant="bodySmall" style={styles.driverEta}>
                        {matchedDriver.eta} min away
                      </Text>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
        
        {/* Payment Method */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
          Payment Method
        </Text>
        
        <Card style={styles.paymentCard}>
          <Card.Content>
            <View style={styles.paymentOptions}>
              <Chip
                selected={paymentMethod === 'creditcard'}
                onPress={() => setPaymentMethod('creditcard')}
                style={styles.paymentChip}
              >
                Credit Card
              </Chip>
              <Chip
                selected={paymentMethod === 'cash'}
                onPress={() => setPaymentMethod('cash')}
                style={styles.paymentChip}
              >
                Cash
              </Chip>
              <Chip
                selected={paymentMethod === 'wallet'}
                onPress={() => setPaymentMethod('wallet')}
                style={styles.paymentChip}
              >
                Wallet
              </Chip>
            </View>
          </Card.Content>
        </Card>
        
        {/* Promo Code */}
        <Card style={styles.promoCard}>
          <Card.Content>
            <TouchableOpacity style={styles.promoButton}>
              <Ionicons name="pricetag-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginLeft: 8 }}>
                Add promo code
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        {/* Confirm Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmRide}
        >
          <Text variant="bodyLarge" style={styles.confirmButtonText}>
            Confirm {selectedRide?.name} Ride
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  routeCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tripPointsContainer: {
    paddingVertical: 8,
  },
  tripPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  tripPointContent: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    opacity: 0.7,
    marginTop: 2,
  },
  tripPointConnector: {
    marginLeft: 12,
    paddingVertical: 4,
  },
  dottedLine: {
    height: 20,
    width: 1,
    marginLeft: 11.5,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  rideCard: {
    marginBottom: 12,
  },
  selectedRideCard: {
    borderWidth: 2,
    borderColor: theme => theme.colors.primary,
  },
  rideCardContent: {
    paddingVertical: 12,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  rideImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  rideDetails: {
    flex: 1,
  },
  rideDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  rideEta: {
    marginTop: 4,
  },
  ridePriceContainer: {
    paddingLeft: 8,
  },
  driverPreview: {
    marginTop: 12,
  },
  driverDivider: {
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    marginLeft: 4,
  },
  driverEta: {
    color: theme => theme.colors.primary,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentChip: {
    marginBottom: 8,
  },
  promoCard: {
    marginBottom: 24,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: theme => theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 