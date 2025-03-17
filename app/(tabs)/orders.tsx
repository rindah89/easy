import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/CustomCard';
import { Text } from '../../components/CustomText';
import { Chip } from '../../components/CustomChip';
import { Badge } from '../../components/CustomBadge';
import { Divider } from '../../components/CustomDivider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';

// Mock data for orders
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2023-001',
    date: '2023-05-15',
    totalAmount: 75000,
    status: 'Delivered',
    items: [
      { name: 'Premium Desk Chair', quantity: 1, price: 75000 }
    ],
    type: 'Furniture'
  },
  {
    id: '2',
    orderNumber: 'ORD-2023-002',
    date: '2023-05-18',
    totalAmount: 12500,
    status: 'In Transit',
    items: [
      { name: 'Prescription Medication', quantity: 2, price: 6250 }
    ],
    type: 'Pharmacy'
  },
  {
    id: '3',
    orderNumber: 'ORD-2023-003',
    date: '2023-05-20',
    totalAmount: 18500,
    status: 'Processing',
    items: [
      { name: 'Groceries Bundle', quantity: 1, price: 18500 }
    ],
    type: 'Grocery'
  },
  {
    id: '4',
    orderNumber: 'ORD-2023-004',
    date: '2023-05-22',
    totalAmount: 25000,
    status: 'Delivered',
    items: [
      { name: 'Family Meal Deal', quantity: 1, price: 25000 }
    ],
    type: 'Restaurant'
  },
  {
    id: '5',
    orderNumber: 'ORD-2023-005',
    date: '2023-05-23',
    totalAmount: 8000,
    status: 'Completed',
    items: [
      { name: 'Airport Ride', quantity: 1, price: 8000 }
    ],
    type: 'Ride'
  },
  {
    id: '6',
    orderNumber: 'ORD-2023-006',
    date: '2023-05-25',
    totalAmount: 90000,
    status: 'Booked',
    items: [
      { name: 'Weekend Car Rental (2 days)', quantity: 1, price: 90000 }
    ],
    type: 'Car Rental'
  },
  {
    id: '7',
    orderNumber: 'ORD-2023-007',
    date: '2023-05-26',
    totalAmount: 32500,
    status: 'Ready for Pickup',
    items: [
      { name: 'Custom Textile Order', quantity: 1, price: 32500 }
    ],
    type: 'Textiles'
  }
];

// Function to get icon based on order type
const getOrderTypeIcon = (type) => {
  switch (type) {
    case 'Furniture':
      return 'sofa';
    case 'Pharmacy':
      return 'pill';
    case 'Grocery':
      return 'cart';
    case 'Restaurant':
      return 'food';
    case 'Ride':
      return 'car';
    case 'Car Rental':
      return 'car-key';
    case 'Textiles':
      return 'hanger';
    default:
      return 'package-variant';
  }
};

// Function to get status chip color
const getStatusColor = (status, theme) => {
  switch (status) {
    case 'Delivered':
    case 'Completed':
      return theme.colors.primary;
    case 'In Transit':
    case 'Processing':
      return theme.colors.tertiary;
    case 'Booked':
      return theme.colors.secondary;
    case 'Ready for Pickup':
      return '#FF9800'; // Orange
    default:
      return theme.colors.outline;
  }
};

export default function OrdersScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const { t } = useTranslation();

  // Filter options
  const filterOptions = ['All', 'Delivered', 'In Transit', 'Processing', 'Booked'];

  // Filtered orders based on selected filter
  const filteredOrders = activeTab === 'All' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab);

  const renderOrderCard = ({ item }) => (
    <Card 
      style={styles.orderCard} 
      onPress={() => {
        // Navigate to order details when implemented
        // router.push(`/order-details/${item.id}`);
        console.log(`Navigate to order details for ${item.orderNumber}`);
      }}
    >
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderTypeContainer}>
            <MaterialCommunityIcons 
              name={getOrderTypeIcon(item.type)} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text variant="titleSmall" style={styles.orderType}>{item.type}</Text>
          </View>
          <Chip 
            selected={true}
            selectedColor={getStatusColor(item.status, theme)}
          >
            {item.status}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderDetails}>
          <Text variant="bodyMedium" style={styles.orderLabel}>Order #:</Text>
          <Text variant="bodyMedium" style={styles.orderValue}>{item.orderNumber}</Text>
        </View>

        <View style={styles.orderDetails}>
          <Text variant="bodyMedium" style={styles.orderLabel}>Date:</Text>
          <Text variant="bodyMedium" style={styles.orderValue}>{item.date}</Text>
        </View>

        <View style={styles.itemContainer}>
          <Text variant="bodyMedium" style={styles.itemsLabel}>Items:</Text>
          {item.items.map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text variant="bodyMedium" style={styles.itemName}>{orderItem.name}</Text>
              <Text variant="bodyMedium" style={styles.quantity}>x{orderItem.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalContainer}>
          <Text variant="bodyLarge" style={styles.totalLabel}>Total Amount:</Text>
          <Text variant="bodyLarge" style={styles.totalAmount}>XAF {Math.round(item.totalAmount).toLocaleString()}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      <CustomHeader 
        title="Orders" 
        showBackButton={false}
        showAvatar={true}
      />

      {/* Tab filter */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              selected={activeTab === item}
              onPress={() => setActiveTab(item)}
              style={styles.filterChip}
            >
              {item}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
      
      {/* Orders list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={80} color={theme.colors.outline} />
          <Text variant="titleMedium" style={styles.emptyText}>No orders found</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Your orders will appear here once you make a purchase
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderType: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  orderLabel: {
    width: 80,
    color: '#757575',
  },
  orderValue: {
    flex: 1,
  },
  itemContainer: {
    marginTop: 10,
  },
  itemsLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemName: {
    flex: 1,
  },
  quantity: {
    width: 40,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    color: '#757575',
  },
  tabContainer: {
    marginBottom: 8,
  },
}); 