import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Animated
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { Chip } from '../components/CustomChip';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 24; // Two columns with padding

interface FurnitureItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

// Sample data for categories
const categories = [
  'All',
  'Living Room',
  'Bedroom',
  'Dining',
  'Kitchen',
  'Bathroom',
  'Office',
  'Outdoor',
  'Lighting',
  'Paints',
  'Fixtures',
];

// Sample data for furniture items
const allItems: FurnitureItem[] = [
  {
    id: 1,
    name: 'Milano Leather Sofa',
    price: 1250000,
    description: 'Premium Italian leather sofa with memory foam cushions for ultimate comfort.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    category: 'Living Room',
  },
  {
    id: 2,
    name: 'Carrera Marble Sink',
    price: 450000,
    description: 'Hand-crafted Italian marble sink with brushed gold fixtures.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    category: 'Bathroom',
  },
  {
    id: 3,
    name: 'Modern King Bed Frame',
    price: 650000,
    description: 'Contemporary platform bed frame with built-in LED lighting.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
    category: 'Bedroom',
  },
  {
    id: 4,
    name: 'Smart Toilet with Bidet',
    price: 800000,
    description: 'Feature-rich smart toilet with heated seat, bidet, and touchless flush.',
    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
    category: 'Bathroom',
  },
  {
    id: 5,
    name: 'Scandinavian Dining Table',
    price: 650000,
    description: 'Minimalist oak dining table that seats up to 8 people.',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc',
    category: 'Dining',
  },
  {
    id: 6,
    name: 'Crystal Chandelier',
    price: 1250000,
    description: 'Hand-crafted crystal chandelier with dimmable LED lighting.',
    image: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4',
    category: 'Lighting',
  },
  {
    id: 7,
    name: 'Executive Office Desk',
    price: 900000,
    description: 'Solid walnut executive desk with built-in wireless charging.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd',
    category: 'Office',
  },
  {
    id: 8,
    name: 'Gourmet Kitchen Island',
    price: 1650000,
    description: 'Professional-grade kitchen island with marble countertop and built-in sink.',
    image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803',
    category: 'Kitchen',
  },
  {
    id: 9,
    name: 'Outdoor Lounge Set',
    price: 950000,
    description: 'Weather-resistant wicker lounge set with plush cushions.',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115',
    category: 'Outdoor',
  },
  {
    id: 10,
    name: 'Modern Floor Lamp',
    price: 175000,
    description: 'Adjustable floor lamp with warm, dimmable LED lighting.',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
    category: 'Lighting',
  },
  {
    id: 11,
    name: 'Luxury Bathtub',
    price: 2500000,
    description: 'Freestanding soaking tub with brushed gold hardware.',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
    category: 'Bathroom',
  },
  {
    id: 12,
    name: 'Italian Sectional Sofa',
    price: 1750000,
    description: 'Modular sectional sofa with chaise lounge and premium upholstery.',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
    category: 'Living Room',
  },
  {
    id: 13,
    name: 'Premium Matte Wall Paint',
    price: 45000,
    description: 'Ultra-premium interior matte paint with zero VOC and exceptional coverage.',
    image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09',
    category: 'Paints',
  },
  {
    id: 14,
    name: 'Freestanding Copper Bathtub',
    price: 2650000,
    description: 'Handcrafted copper bathtub with vintage finish and modern drainage system.',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd',
    category: 'Bathroom',
  },
  {
    id: 15,
    name: 'Rainfall Shower System',
    price: 950000,
    description: 'Complete shower system with thermostatic control, rainfall head, and body jets.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    category: 'Bathroom',
  },
  {
    id: 16,
    name: 'Designer Vessel Sink',
    price: 400000,
    description: 'Artisanal glass vessel sink with hand-painted details and brass drain.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
    category: 'Fixtures',
  },
  {
    id: 17,
    name: 'Brushed Gold Faucet Set',
    price: 185000,
    description: 'Contemporary bathroom faucet set with brushed gold finish and ceramic disc valve.',
    image: 'https://images.unsplash.com/photo-1585005791319-d193224928df',
    category: 'Fixtures',
  },
  {
    id: 18,
    name: 'Designer Wall Paint Collection',
    price: 65000,
    description: 'Set of 4 designer wall paints in trending colors, formulated for single-coat coverage.',
    image: 'https://images.unsplash.com/photo-1589433835387-44aff9be2fd3',
    category: 'Paints',
  },
];

// Custom SearchBar component
const CustomSearchBar = ({ 
  value, 
  onChangeText, 
  placeholder,
  style
}: { 
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const clearButtonOpacity = useRef(new Animated.Value(0)).current;

  // Handle animation for clear button
  useEffect(() => {
    Animated.timing(clearButtonOpacity, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, clearButtonOpacity]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const clearText = () => {
    onChangeText('');
    // Focus the input after clearing
    inputRef.current?.focus();
  };

  return (
    <View 
      style={[
        styles.searchBarContainer, 
        style,
        isFocused && { borderColor: theme.colors.primary, borderWidth: 1 }
      ]}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? theme.colors.primary : theme.colors.outline} 
        style={styles.searchIcon} 
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search luxury home products..."}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never" // We'll handle this manually for Android compatibility
      />
      <Animated.View style={{ opacity: clearButtonOpacity }}>
        {value ? (
          <TouchableOpacity onPress={clearText}>
            <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
};

// Custom menu component for sorting
const SortMenu = ({ 
  visible, 
  onDismiss, 
  onSelect,
  currentSort
}: { 
  visible: boolean;
  onDismiss: () => void;
  onSelect: (sort: 'price_low' | 'price_high' | 'name_asc' | 'name_desc') => void;
  currentSort: 'price_low' | 'price_high' | 'name_asc' | 'name_desc';
}) => {
  if (!visible) return null;
  
  const theme = useTheme();
  
  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity style={styles.menuBackground} onPress={onDismiss} />
      <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodyLarge" style={styles.menuTitle}>Sort By</Text>
        <Divider style={styles.menuDivider} />
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_low'); onDismiss(); }}
        >
          <Text 
            variant="bodyMedium" 
            style={[
              styles.menuItemText,
              currentSort === 'price_low' && { color: theme.colors.primary }
            ]}
          >
            Price: Low to High
          </Text>
          {currentSort === 'price_low' && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_high'); onDismiss(); }}
        >
          <Text 
            variant="bodyMedium" 
            style={[
              styles.menuItemText,
              currentSort === 'price_high' && { color: theme.colors.primary }
            ]}
          >
            Price: High to Low
          </Text>
          {currentSort === 'price_high' && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('name_asc'); onDismiss(); }}
        >
          <Text 
            variant="bodyMedium" 
            style={[
              styles.menuItemText,
              currentSort === 'name_asc' && { color: theme.colors.primary }
            ]}
          >
            Name: A to Z
          </Text>
          {currentSort === 'name_asc' && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('name_desc'); onDismiss(); }}
        >
          <Text 
            variant="bodyMedium" 
            style={[
              styles.menuItemText,
              currentSort === 'name_desc' && { color: theme.colors.primary }
            ]}
          >
            Name: Z to A
          </Text>
          {currentSort === 'name_desc' && (
            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function FurnitureAllItemsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const initialCategory = params.category as string || 'All';
  const { cartItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<'price_low' | 'price_high' | 'name_asc' | 'name_desc'>('price_low');
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Update URL without navigation
    router.setParams({ category });
  };
  
  // Filter and sort items based on search, category and sort order
  const filteredItems = useMemo(() => {
    setIsLoading(true);
    
    // Filter by search query
    let filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return sorted;
  }, [searchQuery, selectedCategory, sortOrder]);

  const navigateToItem = (item: FurnitureItem) => {
    router.push({
      pathname: '/furniture',
      params: { id: item.id.toString() }
    });
  };

  const navigateToCart = () => {
    router.push('/(tabs)/cart');
  };

  const renderItem = ({ item }: { item: FurnitureItem }) => (
    <Card 
      style={styles.itemCard}
      onPress={() => navigateToItem(item)}
    >
      <Card.Cover source={{ uri: item.image }} style={styles.itemImage} />
      <Card.Content style={styles.itemContent}>
        <Text variant="bodyMedium" numberOfLines={1} style={styles.itemName}>{item.name}</Text>
        <Text variant="bodyLarge" style={styles.itemPrice}>{Math.round(item.price).toLocaleString()} XAF</Text>
        <Text variant="bodySmall" style={styles.itemCategory}>{item.category}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {selectedCategory === 'All' ? 'All Home Products' : selectedCategory}
        </Text>
        <TouchableOpacity onPress={navigateToCart} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color={theme.colors.primary} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text variant="bodySmall" style={styles.cartBadgeText}>
                {cartItems.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <CustomSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search luxury home products..."
        style={styles.searchBar}
      />

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => handleCategoryChange(category)}
              style={styles.categoryChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortMenu(true)}
        >
          <Ionicons name="options-outline" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 4 }}>Sort</Text>
        </TouchableOpacity>
      </View>

      <Divider style={styles.divider} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="home-variant" size={64} color={theme.colors.outlineVariant} />
          <Text variant="bodyLarge" style={styles.emptyText}>No items found</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
      
      <SortMenu 
        visible={showSortMenu}
        onDismiss={() => setShowSortMenu(false)}
        onSelect={setSortOrder}
        currentSort={sortOrder}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    padding: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  searchBar: {
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  divider: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  listContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
  },
  itemImage: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemContent: {
    padding: 12,
  },
  itemName: {
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemCategory: {
    opacity: 0.7,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  menuBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  menuDivider: {
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 