import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Modal, 
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { 
  useTheme
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../components/CustomText';
import { Button } from '../../components/Button';
import { Chip } from '../../components/CustomChip';
import { Divider } from '../../components/CustomDivider';
import { SearchBar } from '../../components/CustomSearchBar';
import { textiles } from '../../data/textiles';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const fabricTypes = [
  { label: 'All', value: 'all' },
  { label: 'Wool', value: 'wool' },
  { label: 'Cotton', value: 'cotton' },
  { label: 'Linen', value: 'linen' },
  { label: 'Silk', value: 'silk' },
  { label: 'Tweed', value: 'tweed' },
];

// Promotions data for carousel
const promotions = [
  {
    id: '1',
    title: 'Premium Fabrics',
    description: 'Enjoy 20% off on all premium fabrics this week',
    image: { uri: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?q=80&w=600' },
    action: 'Shop Now',
  },
  {
    id: '2',
    title: 'Custom Tailoring',
    description: 'Free consultation with our master tailor',
    image: { uri: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600' },
    action: 'Book Now',
  },
  {
    id: '3',
    title: 'New Collection',
    description: 'Explore our new seasonal collection of luxury fabrics',
    image: { uri: 'https://images.unsplash.com/photo-1472746729193-36ad213ac4a5?q=80&w=600' },
    action: 'View Collection',
  },
];

// Component for section headers
function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text variant="bodyMedium" style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Component for featured carousel
function FeaturedCarousel({ items }: { items: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [items.length]);

  const getLocalizedPromoContent = (item) => {
    if (item.id === '1') {
      return {
        title: t('textiles.promotions.premiumFabrics.title'),
        description: t('textiles.promotions.premiumFabrics.description'),
        action: t('textiles.promotions.premiumFabrics.action')
      };
    } else if (item.id === '2') {
      return {
        title: t('textiles.promotions.customTailoring.title'),
        description: t('textiles.promotions.customTailoring.description'),
        action: t('textiles.promotions.customTailoring.action')
      };
    } else if (item.id === '3') {
      return {
        title: t('textiles.promotions.newCollection.title'),
        description: t('textiles.promotions.newCollection.description'),
        action: t('textiles.promotions.newCollection.action')
      };
    }
    return item;
  };

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
        renderItem={({ item }) => {
          const localizedContent = getLocalizedPromoContent(item);
          return (
            <View style={[styles.carouselItem, { width }]}>
              <Image source={item.image} style={styles.carouselImage} />
              <View style={styles.carouselContent}>
                <Text variant="headlineSmall" style={styles.carouselTitle}>{localizedContent.title}</Text>
                <Text variant="bodyMedium" style={styles.carouselDescription}>{localizedContent.description}</Text>
                <Button 
                  mode="contained" 
                  style={styles.carouselButton}
                  onPress={() => {
                    console.log(`Action pressed: ${localizedContent.action}`);
                  }}
                >
                  {localizedContent.action}
                </Button>
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.paginationContainer}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: index === activeIndex ? 1 : 0.5 }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function TextilesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTextile, setSelectedTextile] = useState(null);

  // Get the localized fabric types
  const localizedFabricTypes = [
    { label: t('textiles.fabricTypes.all'), value: 'all' },
    { label: t('textiles.fabricTypes.wool'), value: 'wool' },
    { label: t('textiles.fabricTypes.cotton'), value: 'cotton' },
    { label: t('textiles.fabricTypes.linen'), value: 'linen' },
    { label: t('textiles.fabricTypes.silk'), value: 'silk' },
    { label: t('textiles.fabricTypes.tweed'), value: 'tweed' },
  ];

  // Get filtered textiles
  const filteredTextiles = textiles.filter(textile => {
    const matchesSearch = textile.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || textile.type.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Get featured textiles
  const featuredTextiles = textiles.filter(textile => textile.featured);

  const handleTextilePress = (textile) => {
    setSelectedTextile(textile);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const requestSample = (textileId) => {
    closeModal();
    router.push({
      pathname: "/textiles-sample-request",
      params: { textileId }
    });
  };

  const addToCart = (textileId) => {
    closeModal();
    router.push({
      pathname: "/textiles-cart",
      params: { textileId }
    });
  };

  const scheduleTailor = (textileId) => {
    closeModal();
    router.push({
      pathname: "/textiles-tailor-consultation",
      params: { textileId }
    });
  };

  const renderFilterChip = ({ item }) => (
    <Chip
      selected={selectedFilter === item.value}
      onPress={() => setSelectedFilter(item.value)}
      style={styles.filterChip}
    >
      {item.label}
    </Chip>
  );

  const renderFeaturedTextile = ({ item }) => (
    <TouchableOpacity 
      style={[styles.featuredTextileCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTextilePress(item)}
    >
      <Image 
        source={item.imageUrl} 
        style={styles.featuredTextileImage}
        resizeMode="cover"
      />
      <View style={styles.featuredTextileDetails}>
        <Text variant="titleSmall" numberOfLines={1} style={styles.textileName}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.textileType}>{item.type}</Text>
        <View style={styles.priceRatingContainer}>
          <Text variant="titleMedium" style={styles.textilePrice}>
            {item.currency} {item.price.toLocaleString()}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={14} color="#FFB400" />
            <Text variant="bodySmall">{item.rating}/5</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.quickAddButton} 
        onPress={() => addToCart(item.id)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTextileItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.textileCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTextilePress(item)}
    >
      <Image 
        source={item.imageUrl} 
        style={styles.textileImage}
        resizeMode="cover"
      />
      <View style={styles.textileDetails}>
        <Text variant="titleMedium" style={styles.textileName}>{item.name}</Text>
        <View style={styles.priceRatingContainer}>
          <Text variant="bodyLarge" style={styles.textilePrice}>
            {item.currency} {item.price.toLocaleString()}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFB400" />
            <Text variant="bodyMedium" style={styles.textileRating}>{item.rating}/5</Text>
          </View>
        </View>
        <View style={styles.textileMeta}>
          <Text variant="bodySmall">{item.type}</Text>
          <Text variant="bodySmall">•</Text>
          <Text variant="bodySmall">{item.fabricWidth}</Text>
          <Text variant="bodySmall">•</Text>
          <Text variant="bodySmall">{item.minimumOrder} min</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.quickAddButton} 
        onPress={() => addToCart(item.id)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>{t('textiles.headerTitle')}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('textiles.searchPlaceholder')}
          style={styles.searchBar}
        />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Promotions Carousel */}
        <FeaturedCarousel items={promotions} />
        
        {/* Fabric Type Filters */}
        <SectionHeader title={t('textiles.browseByFabricType')} />
        <View style={styles.filtersContainer}>
          <FlatList
            data={localizedFabricTypes}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        {/* Featured Textiles */}
        {featuredTextiles.length > 0 && (
          <>
            <SectionHeader 
              title={t('textiles.featuredFabrics')} 
              actionText={t('textiles.seeAll')} 
              onAction={() => console.log('See all featured fabrics')} 
            />
            <FlatList
              data={featuredTextiles}
              renderItem={renderFeaturedTextile}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </>
        )}
        
        {/* All Textiles */}
        <SectionHeader 
          title={t('textiles.allFabrics')} 
          actionText={filteredTextiles.length > 10 ? t('textiles.seeAll') : undefined} 
          onAction={filteredTextiles.length > 10 ? () => console.log('See all fabrics') : undefined} 
        />
        
        {filteredTextiles.length > 0 ? (
          <View style={styles.textileGrid}>
            <FlatList
              data={filteredTextiles.slice(0, 10)}
              renderItem={renderTextileItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.textileRow}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="text-search" size={64} color={theme.colors.outline} />
            <Text variant="titleMedium" style={styles.emptyStateText}>{t('textiles.noFabricsFound')}</Text>
            <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
              {t('textiles.tryAdjusting')}
            </Text>
          </View>
        )}
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Textile Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTextile && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                  
                  <Image 
                    source={selectedTextile.imageUrl} 
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.modalBody}>
                    <Text variant="headlineSmall" style={styles.modalTitle}>{selectedTextile.name}</Text>
                    
                    <View style={styles.modalPriceRow}>
                      <Text variant="titleLarge" style={styles.modalPrice}>
                        {selectedTextile.currency} {selectedTextile.price.toLocaleString()}
                      </Text>
                      <View style={styles.modalRating}>
                        <MaterialCommunityIcons name="star" size={18} color="#FFB400" />
                        <Text variant="bodyLarge" style={styles.ratingText}>{selectedTextile.rating}/5</Text>
                      </View>
                    </View>
                    
                    <Divider style={styles.modalDivider} />
                    
                    <View style={styles.fabricDetailsContainer}>
                      <Text variant="titleMedium" style={styles.sectionTitle}>{t('textiles.fabricDetails')}</Text>
                      <View style={styles.specRow}>
                        <Text variant="bodyMedium">{t('textiles.fabricWeight')}:</Text>
                        <Text variant="bodyMedium">{selectedTextile.fabricWeight}</Text>
                      </View>
                      <View style={styles.specRow}>
                        <Text variant="bodyMedium">{t('textiles.fabricWidth')}:</Text>
                        <Text variant="bodyMedium">{selectedTextile.fabricWidth}</Text>
                      </View>
                      <View style={styles.specRow}>
                        <Text variant="bodyMedium">{t('textiles.minimumOrder')}:</Text>
                        <Text variant="bodyMedium">{selectedTextile.minimumOrder}</Text>
                      </View>
                    </View>
                    
                    <Text variant="bodyMedium" style={styles.modalDescription}>
                      {selectedTextile.description}
                    </Text>
                    
                    <Text variant="titleMedium" style={styles.colorTitle}>{t('textiles.availableColors')}</Text>
                    <View style={styles.colorsContainer}>
                      {selectedTextile.colors && selectedTextile.colors.map((color, index) => (
                        <View key={index} style={styles.colorItem}>
                          <View 
                            style={[
                              styles.colorSwatch, 
                              {backgroundColor: color.value || '#ddd'}
                            ]}
                          />
                          <Text variant="bodySmall">{color.label}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.modalActions}>
                      <Button 
                        mode="outlined" 
                        onPress={() => requestSample(selectedTextile.id)}
                        style={styles.actionButton}
                        icon="gesture-tap"
                      >
                        {t('textiles.requestSample')}
                      </Button>
                      
                      <Button 
                        mode="contained" 
                        onPress={() => addToCart(selectedTextile.id)}
                        style={styles.actionButton}
                        icon="cart-plus"
                      >
                        {t('textiles.addToCart')}
                      </Button>
                    </View>
                    
                    <Button 
                      mode="text" 
                      onPress={() => scheduleTailor(selectedTextile.id)}
                      style={styles.consultButton}
                      icon="calendar-clock"
                    >
                      {t('textiles.scheduleTailorConsultation')}
                    </Button>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  textileGrid: {
    paddingHorizontal: 12,
  },
  textileCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textileImage: {
    width: '100%',
    height: 180,
  },
  textileDetails: {
    padding: 16,
  },
  textileName: {
    marginBottom: 6,
    fontWeight: '600',
  },
  textileType: {
    color: '#666',
    marginBottom: 4,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  textilePrice: {
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textileRating: {
    marginLeft: 4,
  },
  textileMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 280,
  },
  modalBody: {
    padding: 16,
    paddingBottom: 36,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPrice: {
    fontWeight: '700',
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
  },
  modalDivider: {
    marginBottom: 16,
  },
  fabricDetailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalDescription: {
    marginBottom: 20,
    lineHeight: 22,
  },
  colorTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorItem: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  consultButton: {
    marginTop: 8,
  },
  // Carousel styles
  carouselContainer: {
    height: 180,
    marginBottom: 16,
  },
  carouselItem: {
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: 180,
    borderRadius: 0,
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  carouselTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  carouselDescription: {
    color: 'white',
    marginBottom: 8,
  },
  carouselButton: {
    alignSelf: 'flex-start',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  // Featured textiles
  featuredList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  featuredTextileCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginBottom: 10,
  },
  featuredTextileImage: {
    width: '100%',
    height: 140,
  },
  featuredTextileDetails: {
    padding: 12,
  },
  // Quick Add Button
  quickAddButton: {
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
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionAction: {
    color: '#666',
  },
  textileRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
}); 