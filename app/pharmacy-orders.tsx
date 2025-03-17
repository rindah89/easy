import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Text as CustomText } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  prescriptionImage?: string;
  estimatedDelivery?: string | null;
  deliveredDate?: string;
  pharmacistNotes: string;
}

const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

interface OrderStatusChipProps {
  status: string;
}

const OrderStatusChip = ({ status }: OrderStatusChipProps) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return theme.colors.tertiaryContainer;
      case OrderStatus.PROCESSING:
        return theme.colors.secondaryContainer;
      case OrderStatus.READY:
        return theme.colors.primaryContainer;
      case OrderStatus.DELIVERED:
        return theme.colors.surfaceVariant;
      case OrderStatus.CANCELLED:
        return theme.colors.errorContainer;
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return theme.colors.onTertiaryContainer;
      case OrderStatus.PROCESSING:
        return theme.colors.onSecondaryContainer;
      case OrderStatus.READY:
        return theme.colors.onPrimaryContainer;
      case OrderStatus.DELIVERED:
        return theme.colors.onSurfaceVariant;
      case OrderStatus.CANCELLED:
        return theme.colors.onErrorContainer;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending Review';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.READY:
        return 'Ready for Delivery';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'time-outline';
      case OrderStatus.PROCESSING:
        return 'flask-outline';
      case OrderStatus.READY:
        return 'checkmark-circle-outline';
      case OrderStatus.DELIVERED:
        return 'checkmark-done-circle-outline';
      case OrderStatus.CANCELLED:
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View
      style={[
        styles.statusChip,
        { backgroundColor: getStatusColor() }
      ]}
    >
      <Ionicons name={getStatusIcon()} size={16} color={getStatusTextColor()} style={styles.statusIcon} />
      <CustomText variant="bodySmall" style={{ color: getStatusTextColor() }}>{getStatusLabel()}</CustomText>
    </View>
  );
};

const PharmacyOrdersScreen = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'RX-123456',
      date: '2023-06-15T10:30:00',
      status: OrderStatus.PROCESSING,
      items: [
        { name: 'Amoxicillin 500mg', quantity: 20, price: 15000 },
        { name: 'Ibuprofen 200mg', quantity: 30, price: 10000 },
      ],
      total: 25000,
      prescriptionImage: 'https://placehold.co/400x300/png',
      estimatedDelivery: '2023-06-17',
      pharmacistNotes: 'Your prescription is being processed. We will contact you if we need any additional information.',
    },
    {
      id: 'RX-123123',
      date: '2023-06-10T14:15:00',
      status: OrderStatus.DELIVERED,
      items: [
        { name: 'Lisinopril 10mg', quantity: 30, price: 12000 },
        { name: 'Metformin 500mg', quantity: 60, price: 15000 },
        { name: 'Atorvastatin 20mg', quantity: 30, price: 19000 },
      ],
      total: 46000,
      prescriptionImage: 'https://placehold.co/400x300/png',
      estimatedDelivery: '2023-06-12',
      deliveredDate: '2023-06-12',
      pharmacistNotes: 'Delivered successfully to Bonamoussadi, Douala. Thank you for your order!',
    },
    {
      id: 'RX-122456',
      date: '2023-06-05T09:00:00',
      status: OrderStatus.PENDING,
      items: [],
      total: 0,
      prescriptionImage: 'https://placehold.co/400x300/png',
      estimatedDelivery: null,
      pharmacistNotes: 'Your prescription is being reviewed by our pharmacist.',
    },
  ]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateWithTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const navigateToUploadPrescription = () => {
    router.push('/(tabs)/pharmacy' as any);
  };

  const navigateToOrderDetails = (orderId: string) => {
    router.push({
      pathname: '/pharmacy-order-details' as any,
      params: { orderId }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { padding: 8 }]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <CustomText variant="headlineSmall" style={styles.headerTitle}>My Prescriptions</CustomText>
        </View>
        <Button 
          mode="contained" 
          onPress={navigateToUploadPrescription}
          style={styles.uploadButton}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
            <CustomText style={{ color: theme.colors.onPrimary }}>Upload New Prescription</CustomText>
          </View>
        </Button>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="prescription" size={80} color={theme.colors.outlineVariant} />
          <CustomText variant="titleLarge" style={styles.emptyTitle}>No Prescriptions Yet</CustomText>
          <CustomText variant="bodyMedium" style={styles.emptyDescription}>
            Upload a prescription and our pharmacists will process your order.
          </CustomText>
          <Button 
            mode="contained" 
            onPress={navigateToUploadPrescription}
            style={styles.emptyButton}
            icon="file-document-outline"
          >
            Upload Prescription
          </Button>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {orders.map((order) => (
            <Card 
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigateToOrderDetails(order.id)}
            >
              <Card.Content style={styles.orderCardContent}>
                <View style={styles.orderHeader}>
                  <View>
                    <CustomText variant="titleMedium">{order.id}</CustomText>
                    <CustomText variant="bodySmall">{formatDate(order.date)}</CustomText>
                  </View>
                  <OrderStatusChip status={order.status} />
                </View>

                {order.prescriptionImage && (
                  <Image 
                    source={{ uri: order.prescriptionImage }} 
                    style={styles.prescriptionImage}
                    resizeMode="cover"
                  />
                )}

                {order.items.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <View>
                      <CustomText variant="titleSmall" style={styles.itemsTitle}>Medications</CustomText>
                      {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                          <CustomText variant="bodyMedium">{item.name}</CustomText>
                          <View style={styles.itemDetails}>
                            <CustomText variant="bodySmall">Qty: {item.quantity}</CustomText>
                            <CustomText variant="bodyMedium" style={styles.itemPrice}>XAF {item.price.toLocaleString()}</CustomText>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <Divider style={styles.divider} />
                <View style={styles.orderFooter}>
                  {order.estimatedDelivery && (
                    <CustomText variant="bodySmall">
                      Expected delivery: {order.estimatedDelivery}
                    </CustomText>
                  )}
                  {order.deliveredDate && (
                    <CustomText variant="bodySmall">
                      Delivered on: {order.deliveredDate}
                    </CustomText>
                  )}
                  <CustomText variant="bodyMedium" style={styles.totalPrice}>
                    Total: XAF {order.total.toLocaleString()}
                  </CustomText>
                </View>

                <Button 
                  mode="outlined" 
                  onPress={() => navigateToOrderDetails(order.id)}
                  style={styles.viewDetailsButton}
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  uploadButton: {
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderCardContent: {
    padding: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prescriptionImage: {
    height: 120,
    width: '100%',
    borderRadius: 8,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  itemsTitle: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
});

export default PharmacyOrdersScreen; 