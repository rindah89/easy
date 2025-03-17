import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Import custom components
import { Text } from '../components/CustomText';
import { SearchBar } from '../components/CustomSearchBar';
import { Divider } from '../components/CustomDivider';

// Import mock data
import { popularLocations } from '../data/rideData';

export default function RidePickup() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Additional saved locations
  const savedLocations = [
    { id: 'sl1', name: 'Home', address: '123 Main St, Cityville', icon: 'home' },
    { id: 'sl2', name: 'Work', address: '456 Business Ave, Townsburg', icon: 'briefcase' },
    { id: 'sl3', name: 'Gym', address: 'FitZone, 789 Health Blvd', icon: 'fitness' },
  ];
  
  // Recent pickup locations
  const recentLocations = [
    { id: 'rl1', name: 'Coffee Shop', address: 'Morning Brew, 101 Wake St', time: '2 days ago' },
    { id: 'rl2', name: 'Shopping Mall', address: 'Grand Mall, Downtown', time: '5 days ago' },
    { id: 'rl3', name: 'Airport', address: 'International Airport', time: '1 week ago' },
  ];
  
  const filteredLocations = [...savedLocations, ...recentLocations].filter(
    location => 
      searchQuery === '' || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    router.navigate({
      pathname: '/ride-home',
      params: { pickup: location }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>Set Pickup Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for a location"
          style={styles.searchBar}
        />
      </View>
      
      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.currentLocationButton}
        onPress={() => handleLocationSelect('Current location')}
      >
        <View style={styles.locationIconContainer}>
          <Ionicons name="navigate" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.locationTextContainer}>
          <Text variant="bodyLarge">Current location</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Using GPS</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
      </TouchableOpacity>
      
      <Divider />

      {/* Location List */}
      <ScrollView style={styles.locationsContainer}>
        {searchQuery.length === 0 && (
          <>
            {/* Saved Locations Section */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Saved Places</Text>
            
            {savedLocations.map(location => (
              <TouchableOpacity 
                key={location.id}
                style={styles.locationItem}
                onPress={() => handleLocationSelect(location.address)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons 
                    name={location.icon as any} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text variant="bodyLarge">{location.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {location.address}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="star" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            <Divider style={styles.sectionDivider} />
            
            {/* Recent Locations Section */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Recent Locations</Text>
            
            {recentLocations.map(location => (
              <TouchableOpacity 
                key={location.id}
                style={styles.locationItem}
                onPress={() => handleLocationSelect(location.address)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons name="time-outline" size={24} color={theme.colors.outline} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text variant="bodyLarge">{location.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {location.address}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {location.time}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
        
        {/* Search Results */}
        {searchQuery.length > 0 && filteredLocations.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>Search Results</Text>
            
            {filteredLocations.map(location => (
              <TouchableOpacity 
                key={location.id}
                style={styles.locationItem}
                onPress={() => handleLocationSelect(location.address)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons 
                    name={
                      'id' in location && location.id.startsWith('sl') 
                        ? (location as any).icon 
                        : 'location-outline'
                    } 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text variant="bodyLarge">{location.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {location.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
              </TouchableOpacity>
            ))}
          </>
        )}
        
        {/* No Results */}
        {searchQuery.length > 0 && filteredLocations.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.outline} />
            <Text variant="titleMedium" style={styles.noResultsText}>
              No locations found
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
              Try a different search term or browse from the suggestions below
            </Text>
          </View>
        )}
        
        {/* Map Button */}
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={24} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginLeft: 8 }}>
            Pick from map
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    marginBottom: 8,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  locationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionDivider: {
    marginVertical: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noResultsText: {
    marginTop: 16,
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme => theme.colors.primary,
    borderRadius: 12,
  },
}); 