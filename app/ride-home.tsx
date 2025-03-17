import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import custom components
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { SearchBar } from '../components/CustomSearchBar';

// Import mock data
import { popularLocations, recentRides, mockDrivers } from '../data/rideData';

export default function RideHome() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState('Current location');

  const handleDestinationSelect = (location: string) => {
    setDestination(location);
    // Navigate to ride selection page if we have both pickup and destination
    if (pickup) {
      router.push({
        pathname: '/ride-selection',
        params: { 
          pickup: pickup === 'Current location' ? 'Your location' : pickup,
          destination
        }
      });
    }
  };

  const handlePickupSelect = (location: string) => {
    setPickup(location);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </Link>
        <Text variant="titleLarge" style={styles.headerTitle}>Book a Ride</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholderContainer}>
          <Ionicons name="map-outline" size={80} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.mapPlaceholderText}>Douala City Map</Text>
        </View>
      </View>

      {/* Ride Form */}
      <View style={styles.rideFormContainer}>
        <View style={styles.pickupRow}>
          <Ionicons name="radio-button-on" size={24} color={theme.colors.primary} />
          <TouchableOpacity 
            style={styles.pickupInput}
            onPress={() => router.push('/ride-pickup')}
          >
            <Text>{pickup}</Text>
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.destinationRow}>
          <Ionicons name="location" size={24} color={theme.colors.error} />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Where to?"
            style={styles.destinationInput}
          />
        </View>
      </View>

      {/* Popular Destinations */}
      <ScrollView style={styles.suggestionsContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Popular Destinations</Text>
        {popularLocations.map((location) => (
          <TouchableOpacity 
            key={location.id}
            style={styles.suggestionItem}
            onPress={() => handleDestinationSelect(location.address)}
          >
            <View style={styles.suggestionContent}>
              <View style={styles.iconContainer}>
                {location.isSaved ? (
                  <Ionicons name="star" size={24} color={theme.colors.primary} />
                ) : (
                  <Ionicons name="location-outline" size={24} color={theme.colors.outline} />
                )}
              </View>
              <View style={styles.suggestionTextContainer}>
                <Text variant="bodyLarge">{location.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{location.address}</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        {/* Recent Rides */}
        <Text variant="titleMedium" style={[styles.sectionTitle, {marginTop: 24}]}>Recent Rides</Text>
        {recentRides.map((ride) => {
          const driver = mockDrivers.find(d => d.id === ride.driverId);
          return (
            <TouchableOpacity 
              key={ride.id}
              style={styles.suggestionItem}
              onPress={() => {
                setPickup(ride.pickup);
                handleDestinationSelect(ride.destination);
              }}
            >
              <View style={styles.suggestionContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.suggestionTextContainer}>
                  <Text variant="bodyLarge">{ride.destination}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    From: {ride.pickup}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                XAF {ride.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    height: 180,
    width: '100%',
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: '#888',
  },
  rideFormContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupInput: {
    flex: 1,
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  divider: {
    marginLeft: 24,
    marginVertical: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  destinationInput: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 0,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  suggestionTextContainer: {
    marginLeft: 12,
  },
}); 