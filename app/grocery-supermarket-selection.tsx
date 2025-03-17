import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, ImageSourcePropType, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { SearchBar } from '../components/CustomSearchBar';
import { IconButton } from '../components/CustomIconButton';
import { Divider } from '../components/CustomDivider';

interface Supermarket {
  id: string;
  name: string;
  image: ImageSourcePropType;
  distance: string;
  rating: number;
}

const supermarkets: Supermarket[] = [
  {
    id: '1',
    name: 'Carrefour',
    image: require('../assets/images/carrefour-supermarket.jpg'),
    distance: '0.8 miles',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Santa Lucia',
    image: require('../assets/images/santa-lucia-supermarket.jpg'),
    distance: '1.2 miles',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'BAO',
    image: require('../assets/images/bao-supermarkt.png'),
    distance: '1.5 miles',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Super U',
    image: require('../assets/images/superU-supermarket.jpg'),
    distance: '2.1 miles',
    rating: 4.0,
  },
];

export default function GrocerySupermarketSelection() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredSupermarkets = supermarkets.filter(supermarket => 
    supermarket.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToGroceryShopping = (supermarketId: string) => {
    router.push({
      pathname: '/grocery-shopping',
      params: { supermarketId }
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={goBack} 
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={styles.title}>Select Supermarket</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search supermarkets..."
        />
      </View>
      
      <Divider />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.supermarketsContainer}>
          {filteredSupermarkets.map((supermarket) => (
            <Card 
              key={supermarket.id} 
              style={styles.supermarketCard}
              onPress={() => navigateToGroceryShopping(supermarket.id)}
            >
              <Card.Cover source={supermarket.image} style={styles.supermarketImage} />
              <Card.Content>
                <Text variant="titleMedium">{supermarket.name}</Text>
                <View style={styles.supermarketDetails}>
                  <Text variant="bodySmall" color={theme.colors.onSurfaceVariant}>
                    {supermarket.distance} • {supermarket.rating} ★
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  supermarketsContainer: {
    padding: 16,
  },
  supermarketCard: {
    marginBottom: 16,
  },
  supermarketImage: {
    height: 150,
  },
  supermarketDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
}); 