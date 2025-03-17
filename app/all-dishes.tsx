import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image, ImageSourcePropType, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { SearchBar } from '../components/CustomSearchBar';
import { IconButton } from '../components/CustomIconButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Interface for meal data
interface FeaturedMeal {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: string;
  restaurant: string;
  restaurantId: string;
  discount?: string;
  rating?: number;
}

// Mock data (this would ideally come from an API)
const allMeals: FeaturedMeal[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    image: { uri: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=300' },
    price: '5500 XAF',
    restaurant: 'Pizzeria Italiana',
    restaurantId: '1',
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Sushi Platter',
    image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300' },
    price: '9900 XAF',
    restaurant: 'Sushi Master',
    restaurantId: '3',
    discount: '15%',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Beef Burger',
    image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300' },
    price: '4200 XAF',
    restaurant: 'Burger House',
    restaurantId: '4',
    rating: 4.5,
  },
  {
    id: '4',
    name: 'Pad Thai',
    image: { uri: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=300' },
    price: '3800 XAF',
    restaurant: 'Thai Spice',
    restaurantId: '5',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Chicken Curry',
    image: { uri: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=300' },
    price: '4500 XAF',
    restaurant: 'Spice of India',
    restaurantId: '6',
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Caesar Salad',
    image: { uri: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=300' },
    price: '3200 XAF',
    restaurant: 'Green Garden',
    restaurantId: '7',
    rating: 4.3,
  },
  {
    id: '7',
    name: 'Chocolate Cake',
    image: { uri: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300' },
    price: '2800 XAF',
    restaurant: 'Sweet Delights',
    restaurantId: '8',
    discount: '10%',
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Seafood Paella',
    image: { uri: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=300' },
    price: '8500 XAF',
    restaurant: 'Mediterranean Flavors',
    restaurantId: '9',
    rating: 4.7,
  }
];

export default function AllDishesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter meals based on search query
  const filteredMeals = allMeals.filter(meal => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate column width based on screen width
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 2;
  const tileWidth = (screenWidth - 48) / numColumns; // 48 = padding (16 * 3)
  
  // Handle meal selection
  const handleMealSelect = (meal: FeaturedMeal) => {
    router.push({
      pathname: '/restaurant-menu',
      params: { 
        restaurantId: meal.restaurantId,
        highlightedMealId: meal.id
      }
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
        <Text variant="titleLarge" style={styles.headerTitle}>Popular Dishes</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search dishes..."
        />
      </View>
      
      {/* Dishes Grid */}
      <FlatList
        data={filteredMeals}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <Card 
            style={[styles.mealCard, { width: tileWidth }]} 
            onPress={() => handleMealSelect(item)}
          >
            <View style={styles.mealImageContainer}>
              <Image source={item.image} style={styles.mealImage} />
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text variant="labelSmall" style={styles.discountText}>{item.discount} OFF</Text>
                </View>
              )}
            </View>
            <Card.Content style={styles.mealContent}>
              <Text variant="titleSmall" numberOfLines={1} style={styles.mealName}>{item.name}</Text>
              <Text variant="bodySmall" style={styles.mealRestaurant}>{item.restaurant}</Text>
              <View style={styles.mealFooter}>
                <Text variant="titleMedium" style={styles.mealPrice}>{item.price}</Text>
                <View style={styles.mealRating}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                  <Text variant="bodySmall">{item.rating}</Text>
                </View>
              </View>
            </Card.Content>
            <TouchableOpacity 
              style={styles.addMealButton} 
              onPress={() => handleMealSelect(item)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mealsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.emptyText}>No dishes found</Text>
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
    paddingBottom: 16,
  },
  mealsList: {
    padding: 16,
  },
  mealCard: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealImageContainer: {
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mealContent: {
    padding: 8,
  },
  mealName: {
    fontWeight: '600',
  },
  mealRestaurant: {
    color: '#666',
    marginBottom: 4,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  mealPrice: {
    fontWeight: '600',
    fontSize: 14,
  },
  mealRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMealButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#FF5252',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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