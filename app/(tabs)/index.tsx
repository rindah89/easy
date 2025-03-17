import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, TextInput as RNTextInput } from 'react-native';
import { Text, useTheme, Avatar, Card, IconButton, TextInput, Divider } from 'react-native-paper';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import ProfileAvatar from '../../components/ProfileAvatar';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  icon: any; // Using any for icon names to avoid TypeScript errors with MaterialCommunityIcons
  color: string;
}

interface RecentLocation {
  id: number;
  name: string;
  address: string;
  icon: any; // Using any for icon names to avoid TypeScript errors with MaterialCommunityIcons
}

const services: Service[] = [
  {
    id: 'ride',
    name: 'Ride',
    icon: 'car',
    color: '#4A6FFF',
  },
  {
    id: 'package',
    name: 'Package',
    icon: 'package-variant-closed',
    color: '#FF6B6B',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: 'medical-bag',
    color: '#4CAF50',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    icon: 'cart',
    color: '#FF9800',
  },
  {
    id: 'car-rental',
    name: 'Car Rental',
    icon: 'car-key',
    color: '#3F51B5',
  },
  {
    id: 'furniture',
    name: 'Home & Decor',
    icon: 'home-variant',
    color: '#795548',
  },
  {
    id: 'textiles',
    name: 'Textiles',
    icon: 'texture-box',
    color: '#607D8B',
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'food',
    color: '#009688',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedService, setSelectedService] = useState<string>('ride');
  const [destination, setDestination] = useState<string>('');
  const [recentLocations] = useState<RecentLocation[]>([
    { id: 1, name: 'Home', address: '123 Rue de la Paix, Bonanjo, Douala', icon: 'home' },
    { id: 2, name: 'Work', address: 'Akwa Business Center, Douala', icon: 'briefcase' },
    { id: 3, name: 'Gym', address: 'California Fitness, Bonapriso, Douala', icon: 'dumbbell' },
  ]);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
    })();
  }, []);

  // Douala coordinates
  const doualaCoordinates = {
    latitude: 4.0511,
    longitude: 9.7679,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    
    // Navigate to specific service pages
    if (serviceId === 'ride') {
      // If destination is already entered, go to selection screen
      if (destination.trim()) {
        router.push({
          pathname: '/ride-selection',
          params: {
            pickup: 'Current location',
            destination: destination
          }
        });
      } else {
        // Otherwise, go to ride home to select destination
        router.push('/ride-home');
      }
    } else if (serviceId === 'car-rental') {
      router.push('/(tabs)/car-rental');
    } else if (serviceId === 'package') {
      // Navigate to package screen
      router.push('/(tabs)/package');
    } else if (serviceId === 'textiles') {
      // Navigate to textiles screen
      router.push('/(tabs)/textiles');
    } else if (serviceId === 'pharmacy') {
      // Navigate to pharmacy screen
      router.push('/pharmacy');
    } else if (serviceId === 'furniture') {
      // Navigate to furniture screen
      router.push('/furniture');
    } else if (serviceId === 'grocery') {
      // Navigate to grocery supermarket selection screen
      router.push('/grocery-supermarket-selection');
    } else if (serviceId === 'food') {
      // Navigate to restaurant selection screen
      router.push('/restaurant-selection');
    }
  };

  const renderServiceItem = (service: Service) => {
    const isSelected = selectedService === service.id;
    return (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.serviceItem,
          isSelected && { borderColor: service.color, borderWidth: 2 }
        ]}
        onPress={() => handleServiceSelect(service.id)}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: service.color }]}>
          <MaterialCommunityIcons name={service.icon} size={24} color="white" />
        </View>
        <Text style={styles.serviceName}>{service.name}</Text>
      </TouchableOpacity>
    );
  };

  // Get first letter of name or email for avatar fallback
  const getInitial = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Add a function to handle destination input submission
  const handleDestinationSubmit = () => {
    if (destination.trim() && selectedService === 'ride') {
      router.push({
        pathname: '/ride-selection',
        params: {
          pickup: 'Current location',
          destination: destination
        }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Rider'}</Text>
          <Text style={styles.subGreeting}>Where are you going today?</Text>
        </View>
        
        <ProfileAvatar size={40} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.coords?.latitude || doualaCoordinates.latitude,
              longitude: location?.coords?.longitude || doualaCoordinates.longitude,
              latitudeDelta: doualaCoordinates.latitudeDelta,
              longitudeDelta: doualaCoordinates.longitudeDelta,
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="You are here"
              />
            )}
          </MapView>
        </View>

        {/* Service Selection */}
        <View style={styles.servicesContainer}>
          {services.map(renderServiceItem)}
        </View>

        {/* Destination Input */}
        <Card style={styles.destinationCard}>
          <Card.Content>
            <View style={styles.destinationInputContainer}>
              <MaterialCommunityIcons name="circle" size={12} color={theme.colors.primary} style={styles.locationIcon} />
              <TextInput
                mode="flat"
                placeholder="Current location"
                value="Current location"
                disabled
                style={styles.locationInput}
                underlineStyle={{ display: 'none' }}
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.destinationInputContainer}>
              <MaterialCommunityIcons name="square" size={12} color={theme.colors.error} style={styles.locationIcon} />
              <TextInput
                mode="flat"
                placeholder="Where to?"
                value={destination}
                onChangeText={setDestination}
                style={styles.locationInput}
                underlineStyle={{ display: 'none' }}
                right={<TextInput.Icon icon="map-marker" onPress={handleDestinationSubmit} />}
                onSubmitEditing={handleDestinationSubmit}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recent Locations */}
        <View style={styles.recentLocationsContainer}>
          <Text style={styles.sectionTitle}>Recent Places</Text>
          {recentLocations.map((location) => (
            <TouchableOpacity 
              key={location.id} 
              style={styles.recentLocationItem}
              onPress={() => setDestination(location.address)}
            >
              <View style={styles.recentLocationIconContainer}>
                <MaterialCommunityIcons name={location.icon} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.recentLocationDetails}>
                <Text style={styles.recentLocationName}>{location.name}</Text>
                <Text style={styles.recentLocationAddress}>{location.address}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={() => {
            if (selectedService === 'ride') {
              if (destination.trim()) {
                router.push({
                  pathname: '/ride-selection',
                  params: {
                    pickup: 'Current location',
                    destination: destination
                  }
                });
              } else {
                router.push('/ride-home');
              }
            } else if (selectedService === 'car-rental') {
              router.push('/(tabs)/car-rental');
            } else if (selectedService === 'package') {
              router.push('/(tabs)/package');
            } else if (selectedService === 'textiles') {
              router.push('/(tabs)/textiles');
            } else if (selectedService === 'pharmacy') {
              router.push('/pharmacy');
            } else if (selectedService === 'furniture') {
              router.push('/furniture');
            } else if (selectedService === 'grocery') {
              router.push('/grocery-supermarket-selection');
            } else if (selectedService === 'food') {
              router.push('/restaurant-selection');
            }
          }}
          fullWidth
          style={styles.requestButton}
          textStyle={styles.requestButtonText}
        >
          {selectedService === 'ride' ? (destination.trim() ? 'Continue to Select Ride' : 'Request Ride') : 
           selectedService === 'car-rental' ? 'Browse Cars' : 
           selectedService === 'package' ? 'Send Package' :
           selectedService === 'textiles' ? 'Browse Textiles' :
           selectedService === 'pharmacy' ? 'Browse Pharmacy' :
           selectedService === 'furniture' ? 'Browse Home & Decor' :
           selectedService === 'grocery' ? 'Browse Grocery' :
           selectedService === 'food' ? 'Browse Restaurants' :
           `Request ${selectedService}`}
        </Button>
      </View>
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
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  serviceItem: {
    alignItems: 'center',
    width: (width - 64) / 4,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    textAlign: 'center',
  },
  destinationCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  destinationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 40,
  },
  divider: {
    marginVertical: 8,
    marginLeft: 24,
  },
  recentLocationsContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentLocationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentLocationDetails: {
    flex: 1,
  },
  recentLocationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentLocationAddress: {
    fontSize: 12,
    opacity: 0.7,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  requestButton: {
    borderRadius: 12,
    height: 56,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
