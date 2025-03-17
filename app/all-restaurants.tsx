import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { SearchBar } from '../components/CustomSearchBar';
import { IconButton } from '../components/CustomIconButton';
import { Chip } from '../components/CustomChip';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Interface for restaurant data
interface Restaurant {
  id: string;
  name: string;
  image: ImageSourcePropType;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  featured?: boolean;
  distance?: string;
}

// Mock data (this would ideally come from an API)
const allRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pizzeria Italiana',
    image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400' },
    cuisine: 'Italian',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryFee: '800 XAF',
    minOrder: '3000 XAF',
    distance: '1.2 km',
  },
  {
    id: '2',
    name: 'Golden Dragon',
    image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' },
    cuisine: 'Chinese',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: '600 XAF',
    minOrder: '3500 XAF',
    featured: true,
    distance: '2.5 km',
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: { uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400' },
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: '35-50 min',
    deliveryFee: '1200 XAF',
    minOrder: '6000 XAF',
    distance: '3.7 km',
  },
  {
    id: '4',
    name: 'Burger House',
    image: { uri: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=400' },
    cuisine: 'American',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: '500 XAF',
    minOrder: '2500 XAF',
    featured: true,
    distance: '0.8 km',
  },
  {
    id: '5',
    name: 'Thai Spice',
    image: { uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=400' },
    cuisine: 'Thai',
    rating: 4.6,
    deliveryTime: '30-45 min',
    deliveryFee: '700 XAF',
    minOrder: '3000 XAF',
    distance: '1.9 km',
  },
  {
    id: '6',
    name: 'Spice of India',
    image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' },
    cuisine: 'Indian',
    rating: 4.4,
    deliveryTime: '35-50 min',
    deliveryFee: '900 XAF',
    minOrder: '4000 XAF',
    distance: '3.2 km',
  },
  {
    id: '7',
    name: 'Authentic Mexican',
    image: { uri: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=400' },
    cuisine: 'Mexican',
    rating: 4.3,
    deliveryTime: '25-40 min',
    deliveryFee: '800 XAF',
    minOrder: '3500 XAF',
    distance: '2.8 km',
  },
  {
    id: '8',
    name: 'Mediterranean Haven',
    image: { uri: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=400' },
    cuisine: 'Mediterranean',
    rating: 4.8,
    deliveryTime: '30-45 min',
    deliveryFee: '1000 XAF',
    minOrder: '5000 XAF',
    featured: true,
    distance: '4.1 km',
  }
];

// Unique cuisines for filtering
const cuisines = ['All', ...new Set(allRestaurants.map(restaurant => restaurant.cuisine))];

export default function AllRestaurantsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  
  // Filter restaurants based on search query and selected cuisine
  const filteredRestaurants = allRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });
  
  // Handle restaurant selection
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    router.push({
      pathname: '/restaurant-menu',
      params: { restaurantId: restaurant.id }
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          onPress={() => router.back()} 
        />
        <Text variant="titleLarge" style={styles.headerTitle}>All Restaurants</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants or cuisines..."
        />
      </View>
      
      {/* Cuisine Filters */}
      <FlatList
        data={cuisines}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCuisine === item}
            onPress={() => setSelectedCuisine(item)}
            style={styles.cuisineChip}
          >
            {item}
          </Chip>
        )}
        keyExtractor={item => item}
        contentContainerStyle={styles.cuisinesList}
      />
      
      {/* Restaurants List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={({ item }) => (
          <Card
            style={styles.restaurantCard}
            onPress={() => handleSelectRestaurant(item)}
          >
            <View style={styles.restaurantImageContainer}>
              <Card.Cover source={item.image} style={styles.restaurantImage} />
              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Text variant="labelSmall" style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </View>
            <Card.Content style={styles.restaurantContent}>
              <View style={styles.restaurantHeader}>
                <Text variant="titleMedium" style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text variant="bodyMedium">{item.rating}</Text>
                </View>
              </View>
              <Text variant="bodySmall" style={styles.restaurantCuisine}>{item.cuisine}</Text>
              <View style={styles.restaurantDetails}>
                <View style={styles.restaurantDetail}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                  <Text variant="bodySmall" style={styles.detailText}>{item.deliveryTime}</Text>
                </View>
                <View style={styles.restaurantDetail}>
                  <MaterialCommunityIcons name="bike-fast" size={14} color="#666" />
                  <Text variant="bodySmall" style={styles.detailText}>{item.deliveryFee}</Text>
                </View>
                <View style={styles.restaurantDetail}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color="#666" />
                  <Text variant="bodySmall" style={styles.detailText}>{item.distance}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.restaurantsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="store-off" size={64} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.emptyText}>No restaurants found</Text>
          </View>
        }
      />
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
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cuisinesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cuisineChip: {
    marginRight: 8,
  },
  restaurantsList: {
    padding: 16,
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    height: 150,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: 'white',
    fontWeight: 'bold',
  },
  restaurantContent: {
    padding: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  restaurantCuisine: {
    color: '#666',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  restaurantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
}); 