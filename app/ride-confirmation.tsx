import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import custom components
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { Badge } from '../components/CustomBadge';

// Import mock data
import { rideTypes, mockDrivers } from '../data/rideData';

export default function RideConfirmation() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ 
    pickup: string; 
    destination: string;
    rideType: string;
    paymentMethod: string;
  }>();
  
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [arrivalTime, setArrivalTime] = useState<string>('');
  
  // Selected ride type and matched driver
  const selectedRide = rideTypes.find(ride => ride.id === params.rideType) || rideTypes[0];
  const matchedDriver = params.rideType === 'bike' 
    ? mockDrivers.find(driver => driver.vehicle.toLowerCase().includes('bike'))
    : mockDrivers.find(driver => !driver.vehicle.toLowerCase().includes('bike'));
  
  useEffect(() => {
    // Calculate the estimated time based on ride type
    if (selectedRide) {
      setEstimatedTime(selectedRide.eta + (matchedDriver?.eta || 0));
      
      // Calculate arrival time
      const now = new Date();
      now.setMinutes(now.getMinutes() + estimatedTime);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      setArrivalTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
    }
  }, [selectedRide, estimatedTime, matchedDriver]);
  
  // Handle contact driver
  const handleCallDriver = () => {
    // In a real app, this would be the driver's phone number
    Linking.openURL(`tel:+11234567890`);
  };
  
  // Handle message driver
  const handleMessageDriver = () => {
    // In a real app, this would navigate to a chat screen
    router.push('/ride-chat');
  };
  
  // Handle cancel ride
  const handleCancelRide = () => {
    router.push('/ride-home');
  };

  if (!matchedDriver || !selectedRide) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="titleMedium">Loading ride details...</Text>
      </SafeAreaView>
    );
  }

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
        <Text variant="titleLarge" style={styles.headerTitle}>Ride Confirmed</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholderContainer}>
          <Ionicons name="navigate" size={60} color={theme.colors.primary} />
          <Ionicons name="arrow-forward" size={30} color={theme.colors.primary} style={styles.arrowIcon} />
          <Ionicons name="location" size={60} color={theme.colors.error} />
          <Text variant="bodyMedium" style={styles.mapPlaceholderText}>Douala Route View</Text>
        </View>
        <View style={styles.mapOverlay}>
          <View style={styles.etaBadge}>
            <Text variant="titleMedium" style={{ color: 'white' }}>
              {estimatedTime} min
            </Text>
            <Text variant="bodySmall" style={{ color: 'white' }}>
              Arrival at {arrivalTime}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Driver Card */}
        <Card style={styles.driverCard}>
          <Card.Content>
            <View style={styles.driverInfo}>
              <Image 
                source={{ uri: matchedDriver.photoUrl }} 
                style={styles.driverAvatar} 
              />
              <View style={styles.driverDetails}>
                <Text variant="titleMedium">{matchedDriver.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text variant="bodySmall" style={styles.ratingText}>
                    {matchedDriver.rating} • {matchedDriver.trips} trips
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.vehicleText}>
                  {matchedDriver.vehicle}
                </Text>
                <View style={styles.licensePlateContainer}>
                  <Text variant="bodyMedium" style={styles.licensePlateText}>
                    {matchedDriver.licensePlate}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.driverActions}>
              <TouchableOpacity 
                style={styles.driverAction}
                onPress={handleCallDriver}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="call" size={20} color="white" />
                </View>
                <Text variant="bodySmall">Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.driverAction}
                onPress={handleMessageDriver}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="chatbubble" size={20} color="white" />
                </View>
                <Text variant="bodySmall">Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.driverAction}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="share" size={20} color="white" />
                </View>
                <Text variant="bodySmall">Share</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Ride Details */}
        <Card style={styles.rideDetailsCard}>
          <Card.Content>
            <View style={styles.rideDetailRow}>
              <View style={styles.rideDetailIcon}>
                <Ionicons name="car" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.rideDetailContent}>
                <Text variant="bodyMedium">{selectedRide.name} Ride</Text>
                <Text variant="bodySmall" style={styles.rideDetailDescription}>
                  {selectedRide.description}
                </Text>
              </View>
              <Text variant="titleSmall">{selectedRide.currency} {selectedRide.price.toLocaleString()}</Text>
            </View>
            
            <Divider style={styles.detailsDivider} />
            
            <View style={styles.rideDetailRow}>
              <View style={styles.rideDetailIcon}>
                <Ionicons name={
                  params.paymentMethod === 'creditcard' ? 'card' :
                  params.paymentMethod === 'cash' ? 'cash' : 'wallet'
                } size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.rideDetailContent}>
                <Text variant="bodyMedium">{
                  params.paymentMethod === 'creditcard' ? 'Credit Card' :
                  params.paymentMethod === 'cash' ? 'Cash' : 'Wallet'
                }</Text>
              </View>
              <TouchableOpacity>
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Trip Route */}
        <Card style={styles.routeCard}>
          <Card.Content>
            <View style={styles.tripPointsContainer}>
              <View style={styles.tripPoint}>
                <Ionicons name="radio-button-on" size={24} color={theme.colors.primary} />
                <View style={styles.tripPointContent}>
                  <Text variant="bodyMedium" numberOfLines={1}>Pickup</Text>
                  <Text variant="bodySmall" style={styles.addressText} numberOfLines={2}>
                    {params.pickup}
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
                    {params.destination}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notes to Driver */}
        <Card style={styles.notesCard}>
          <Card.Content>
            <TouchableOpacity style={styles.addNotesButton}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginLeft: 8 }}>
                Add note for driver
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Cancel Button */}
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelRide}
        >
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            Cancel Ride
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
  mapContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#f5f7fa',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  mapPlaceholderText: {
    position: 'absolute',
    bottom: 30,
    color: '#888',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  etaBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  driverCard: {
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
  },
  vehicleText: {
    marginTop: 4,
    opacity: 0.7,
  },
  licensePlateContainer: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  licensePlateText: {
    fontWeight: 'bold',
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  driverAction: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e8b57',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rideDetailsCard: {
    marginBottom: 16,
  },
  rideDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rideDetailIcon: {
    width: 40,
    alignItems: 'center',
  },
  rideDetailContent: {
    flex: 1,
    marginLeft: 8,
  },
  rideDetailDescription: {
    opacity: 0.7,
  },
  detailsDivider: {
    marginVertical: 8,
  },
  routeCard: {
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
  notesCard: {
    marginBottom: 16,
  },
  addNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 32,
  },
}); 