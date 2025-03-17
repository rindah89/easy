import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Animated
} from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text as CustomText } from '../components/CustomText';
import { Button } from '../components/Button';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { Chip } from '../components/CustomChip';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 32; // Full width minus padding

interface LabTest {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  turnaround: string;
  preparation: string;
  sampleType: string;
  popularity: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

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
  
  return (
    <View style={[styles.searchBarContainer, style]}>
      <Ionicons name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// Custom menu component using a simple modal approach
const SortMenu = ({ 
  visible, 
  onDismiss, 
  onSelect,
  currentSort
}: { 
  visible: boolean;
  onDismiss: () => void;
  onSelect: (sort: 'price_low' | 'price_high' | 'turnaround' | 'popularity') => void;
  currentSort: 'price_low' | 'price_high' | 'turnaround' | 'popularity';
}) => {
  if (!visible) return null;
  
  const theme = useTheme();
  
  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity style={styles.menuBackground} onPress={onDismiss} />
      <View style={styles.menuContainer}>
        <CustomText variant="titleMedium" style={styles.menuTitle}>Sort By</CustomText>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('popularity'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'popularity' ? styles.selectedMenuItem : null}>
            Most Popular
          </CustomText>
          {currentSort === 'popularity' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_low'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'price_low' ? styles.selectedMenuItem : null}>
            Price: Low to High
          </CustomText>
          {currentSort === 'price_low' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_high'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'price_high' ? styles.selectedMenuItem : null}>
            Price: High to Low
          </CustomText>
          {currentSort === 'price_high' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('turnaround'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'turnaround' ? styles.selectedMenuItem : null}>
            Fastest Results
          </CustomText>
          {currentSort === 'turnaround' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add this function outside the main component
const EmptyListComponent = ({ 
  onClearFilters, 
  theme 
}: { 
  onClearFilters: () => void; 
  theme: MD3Theme;
}) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons name="test-tube" size={64} color={theme.colors.outline} />
    <CustomText variant="titleMedium" style={styles.emptyTitle}>
      No lab tests found
    </CustomText>
    <CustomText variant="bodyMedium" style={styles.emptyDescription}>
      Try adjusting your search or filters
    </CustomText>
    <Button
      mode="contained"
      onPress={onClearFilters}
      style={styles.clearButton}
    >
      Clear Filters
    </Button>
  </View>
);

const PharmacyAllLabTestsScreen = () => {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'turnaround' | 'popularity'>('popularity');
  const [refreshing, setRefreshing] = useState(false);
  const [bookingTest, setBookingTest] = useState<number | null>(null);
  
  // Check for category parameter in the URL
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  // Mock data - in a real app, this would come from an API
  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      id: 1,
      name: 'Complete Blood Count (CBC)',
      price: 35000,
      description: 'Evaluates overall health and detects a wide range of disorders.',
      image: 'https://placehold.co/200x200/png',
      category: 'Hematology',
      turnaround: '24 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood',
      popularity: 128
    },
    {
      id: 2,
      name: 'Diabetes Screening',
      price: 45000,
      description: 'Measures blood glucose levels to screen for diabetes.',
      image: 'https://placehold.co/200x200/png',
      category: 'Endocrinology',
      turnaround: '24 hours',
      preparation: 'Fasting for 8-12 hours before the test.',
      sampleType: 'Blood',
      popularity: 156
    },
    {
      id: 3,
      name: 'Lipid Profile',
      price: 40000,
      description: 'Measures cholesterol levels to assess heart disease risk.',
      image: 'https://placehold.co/200x200/png',
      category: 'Cardiology',
      turnaround: '24 hours',
      preparation: 'Fasting for 9-12 hours before the test.',
      sampleType: 'Blood',
      popularity: 142
    },
    {
      id: 4,
      name: 'Thyroid Function',
      price: 70000,
      description: 'Evaluates how well your thyroid gland is functioning.',
      image: 'https://placehold.co/200x200/png',
      category: 'Endocrinology',
      turnaround: '48 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood',
      popularity: 112
    },
    {
      id: 5,
      name: 'Urinalysis',
      price: 25000,
      description: 'Examines the physical and chemical composition of urine.',
      image: 'https://placehold.co/200x200/png',
      category: 'Urology',
      turnaround: '24 hours',
      preparation: 'Clean catch urine sample.',
      sampleType: 'Urine',
      popularity: 95
    },
    {
      id: 6,
      name: 'Liver Function Test',
      price: 50000,
      description: 'Assesses liver function and detects liver damage.',
      image: 'https://placehold.co/200x200/png',
      category: 'Gastroenterology',
      turnaround: '24 hours',
      preparation: 'No alcohol for 24 hours before the test.',
      sampleType: 'Blood',
      popularity: 87
    },
    {
      id: 7,
      name: 'COVID-19 PCR Test',
      price: 75000,
      description: 'Detects genetic material of the COVID-19 virus.',
      image: 'https://placehold.co/200x200/png',
      category: 'Infectious Disease',
      turnaround: '12 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Nasopharyngeal Swab',
      popularity: 176
    },
    {
      id: 8,
      name: 'Kidney Function Test',
      price: 45000,
      description: 'Evaluates how well your kidneys are functioning.',
      image: 'https://placehold.co/200x200/png',
      category: 'Nephrology',
      turnaround: '24 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood',
      popularity: 82
    },
    {
      id: 9,
      name: 'Vitamin D Test',
      price: 55000,
      description: 'Measures the level of vitamin D in your blood.',
      image: 'https://placehold.co/200x200/png',
      category: 'Nutrition',
      turnaround: '48 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood',
      popularity: 74
    },
    {
      id: 10,
      name: 'Allergy Panel',
      price: 120000,
      description: 'Tests for allergic reactions to common allergens.',
      image: 'https://placehold.co/200x200/png',
      category: 'Immunology',
      turnaround: '72 hours',
      preparation: 'Avoid antihistamines for 7 days before the test.',
      sampleType: 'Blood',
      popularity: 68
    },
    {
      id: 11,
      name: 'Pregnancy Test (Quantitative)',
      price: 30000,
      description: 'Measures the exact amount of hCG hormone in blood.',
      image: 'https://placehold.co/200x200/png',
      category: 'Obstetrics',
      turnaround: '24 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood',
      popularity: 105
    },
    {
      id: 12,
      name: 'Sexually Transmitted Infections Panel',
      price: 85000,
      description: 'Screens for common STIs including HIV, syphilis, and more.',
      image: 'https://placehold.co/200x200/png',
      category: 'Infectious Disease',
      turnaround: '48 hours',
      preparation: 'No special preparation required.',
      sampleType: 'Blood and Urine',
      popularity: 92
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'All', icon: 'test-tube' },
    { id: 2, name: 'Hematology', icon: 'test-tube' },
    { id: 3, name: 'Endocrinology', icon: 'chart-line' },
    { id: 4, name: 'Cardiology', icon: 'heart-pulse' },
    { id: 5, name: 'Urology', icon: 'water' },
    { id: 6, name: 'Gastroenterology', icon: 'stomach' },
    { id: 7, name: 'Infectious Disease', icon: 'virus' },
    { id: 8, name: 'Nephrology', icon: 'kidney' },
    { id: 9, name: 'Nutrition', icon: 'food-apple' },
    { id: 10, name: 'Immunology', icon: 'shield' },
    { id: 11, name: 'Obstetrics', icon: 'human-pregnant' },
  ]);

  // Filter lab tests based on search query and selected category
  const filteredLabTests = labTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort lab tests based on selected sort option
  const sortedLabTests = [...filteredLabTests].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'turnaround':
        // Sorting by turnaround time (convert to hours for comparison)
        const getHours = (time: string) => {
          const match = time.match(/(\d+)/);
          return match ? parseInt(match[0]) : 999;
        };
        return getHours(a.turnaround) - getHours(b.turnaround);
      case 'popularity':
        return b.popularity - a.popularity;
      default:
        return 0;
    }
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, this would refetch data from an API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const navigateToLabTest = (test: LabTest) => {
    router.push({
      pathname: '/pharmacy-lab-test',
      params: { testId: test.id }
    });
  };

  const handleBookTest = async (test: LabTest) => {
    setBookingTest(test.id);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to booking form
      router.push({
        pathname: '/pharmacy-book-sample-collection',
        params: { testId: test.id }
      });
    } catch (error) {
      console.error('Failed to initiate booking:', error);
      Alert.alert(
        "Error",
        `Failed to initiate booking for ${test.name}. Please try again.`
      );
    } finally {
      setBookingTest(null);
    }
  };

  // Rendering the lab test item
  const renderLabTestItem = ({ item }: { item: LabTest }) => {
    return (
      <Card 
        style={styles.labTestCard} 
        onPress={() => navigateToLabTest(item)}
      >
        <View style={styles.labTestContent}>
          <View style={styles.labTestHeader}>
            <View>
              <View style={styles.categoryChip}>
                <CustomText variant="bodySmall">{item.category}</CustomText>
              </View>
              <CustomText variant="titleMedium" style={styles.labTestName}>
                {item.name}
              </CustomText>
            </View>
            
            <Image 
              source={{ uri: item.image }} 
              style={styles.labTestImage} 
              resizeMode="cover"
            />
          </View>
          
          <CustomText variant="bodySmall" style={styles.labTestDescription}>
            {item.description}
          </CustomText>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
              <CustomText variant="bodySmall" style={styles.detailText}>
                Results in: {item.turnaround}
              </CustomText>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="flask" size={16} color={theme.colors.primary} />
              <CustomText variant="bodySmall" style={styles.detailText}>
                Sample: {item.sampleType}
              </CustomText>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
              <CustomText variant="bodySmall" style={styles.detailText}>
                Prep: {item.preparation.length > 25 ? item.preparation.substring(0, 25) + '...' : item.preparation}
              </CustomText>
            </View>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <CustomText variant="titleMedium" style={styles.price}>
                XAF {item.price.toLocaleString()}
              </CustomText>
              <View style={styles.discountBadge}>
                <CustomText variant="bodySmall" style={{ color: 'white' }}>10% OFF</CustomText>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => handleBookTest(item)}
              disabled={bookingTest === item.id}
            >
              {bookingTest === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <CustomText variant="labelMedium" style={styles.bookButtonText}>Book Now</CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('popularity');
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <CustomText variant="headlineMedium" style={styles.heading}>
            All Lab Tests
          </CustomText>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar
          placeholder="Search lab tests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setVisibleMenu(true)}
        >
          <MaterialCommunityIcons name="tune-vertical" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <SortMenu 
        visible={visibleMenu}
        onDismiss={() => setVisibleMenu(false)}
        onSelect={setSortBy}
        currentSort={sortBy}
      />

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.name}
            onPress={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <CustomText variant="bodyMedium">
          {sortedLabTests.length} {sortedLabTests.length === 1 ? 'result' : 'results'}
        </CustomText>
        <View style={styles.sortLabel}>
          <CustomText variant="bodySmall">Sorted by: </CustomText>
          <CustomText variant="bodyMedium" style={{ fontWeight: '500' }}>
            {sortBy === 'price_low' ? 'Price: Low to High' : 
             sortBy === 'price_high' ? 'Price: High to Low' : 
             sortBy === 'turnaround' ? 'Fastest Results' : 'Most Popular'}
          </CustomText>
        </View>
      </View>

      {/* Lab Tests Grid */}
      <FlatList
        data={sortedLabTests}
        renderItem={renderLabTestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.labTestsGrid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyListComponent onClearFilters={clearFilters} theme={theme} />}
      />

      {/* Call-to-action button */}
      <View style={styles.ctaContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/pharmacy-book-sample-collection')}
          style={styles.ctaButton}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
          )}
        >
          Book Home Sample Collection
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 24,
  },
  backButton: {
    padding: 4,
  },
  heading: {
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    height: 36,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labTestsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra space for CTA button
  },
  row: {
    marginBottom: 16,
  },
  labTestCard: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  labTestContent: {
    padding: 16,
  },
  labTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  labTestImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  labTestName: {
    fontWeight: '600',
    marginBottom: 4,
    maxWidth: width - 150, // Allow space for the image
  },
  labTestDescription: {
    marginBottom: 12,
    opacity: 0.7,
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontWeight: 'bold',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  bookButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4A6FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedMenuItem: {
    color: '#4A6FFF',
    fontWeight: '500',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
});

export default PharmacyAllLabTestsScreen; 