import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Text as CustomText } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { useTranslation } from 'react-i18next';

// Define TypeScript interfaces
interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
}

interface Pharmacist {
  name: string;
  phone: string;
}

interface TimelineEvent {
  status: string;
  date: string;
  description: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  prescriptionImage?: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  pharmacistNotes?: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  pharmacist: Pharmacist;
  timeline: TimelineEvent[];
  tracking?: string;
}

// Reuse the OrderStatus and OrderStatusChip from pharmacy-orders.tsx
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
  const { t } = useTranslation();
  
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
        return t('pharmacy.orders.status.pendingReview');
      case OrderStatus.PROCESSING:
        return t('pharmacy.orders.status.processing');
      case OrderStatus.READY:
        return t('pharmacy.orders.status.readyForDelivery');
      case OrderStatus.DELIVERED:
        return t('pharmacy.orders.status.delivered');
      case OrderStatus.CANCELLED:
        return t('pharmacy.orders.status.cancelled');
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

const PharmacyOrderDetailsScreen = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  // Simulated data fetch - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (orderId === 'RX-123456') {
        setOrder({
          id: 'RX-123456',
          date: '2023-06-15T10:30:00',
          status: OrderStatus.PROCESSING,
          items: [
            { name: 'Amoxicillin 500mg', quantity: 20, price: 15000, instructions: 'Take one capsule three times daily with food.' },
            { name: 'Ibuprofen 200mg', quantity: 30, price: 10000, instructions: 'Take one tablet every 4-6 hours as needed for pain.' },
          ],
          subtotal: 25000,
          deliveryFee: 3000,
          total: 28000,
          prescriptionImage: 'https://placehold.co/400x300/png',
          estimatedDelivery: '2023-06-17',
          pharmacistNotes: 'Your prescription is being processed. We will contact you if we need any additional information.',
          deliveryAddress: {
            street: '123 Avenue Bonanjo',
            city: 'Douala',
            state: 'Littoral',
            zip: 'BP 123',
            instructions: 'Leave at front door'
          },
          paymentMethod: 'Orange Money',
          pharmacist: {
            name: 'Dr. Sarah Nkeng',
            phone: '+237 655123456'
          },
          timeline: [
            { status: 'Prescription Received', date: '2023-06-15T10:30:00', description: 'Your prescription has been received by our pharmacy team.' },
            { status: 'Under Review', date: '2023-06-15T11:15:00', description: 'A pharmacist is reviewing your prescription.' },
            { status: 'Processing', date: '2023-06-15T14:45:00', description: 'Your medications are being prepared.' },
          ]
        });
      } else if (orderId === 'RX-123123') {
        setOrder({
          id: 'RX-123123',
          date: '2023-06-10T14:15:00',
          status: OrderStatus.DELIVERED,
          items: [
            { name: 'Lisinopril 10mg', quantity: 30, price: 12000, instructions: 'Take one tablet daily in the morning.' },
            { name: 'Metformin 500mg', quantity: 60, price: 15000, instructions: 'Take one tablet twice daily with meals.' },
            { name: 'Atorvastatin 20mg', quantity: 30, price: 19000, instructions: 'Take one tablet at bedtime.' },
          ],
          subtotal: 46000,
          deliveryFee: 0,
          total: 46000,
          prescriptionImage: 'https://placehold.co/400x300/png',
          estimatedDelivery: '2023-06-12',
          deliveredDate: '2023-06-12',
          pharmacistNotes: 'Delivered successfully to your address in Akwa, Douala. Thank you for your order!',
          deliveryAddress: {
            street: '456 Boulevard de la Liberté',
            city: 'Douala',
            state: 'Littoral',
            zip: 'BP 456',
            instructions: 'Ring doorbell'
          },
          paymentMethod: 'MTN Mobile Money',
          pharmacist: {
            name: 'Dr. Michael Ndongo',
            phone: '+237 677987654'
          },
          timeline: [
            { status: 'Prescription Received', date: '2023-06-10T14:15:00', description: 'Your prescription has been received by our pharmacy team.' },
            { status: 'Under Review', date: '2023-06-10T15:00:00', description: 'A pharmacist is reviewing your prescription.' },
            { status: 'Processing', date: '2023-06-10T16:30:00', description: 'Your medications are being prepared.' },
            { status: 'Ready for Delivery', date: '2023-06-11T09:15:00', description: 'Your order is packed and ready for delivery.' },
            { status: 'Out for Delivery', date: '2023-06-12T08:30:00', description: 'Your order is out for delivery in Douala.' },
            { status: 'Delivered', date: '2023-06-12T14:45:00', description: 'Your order has been delivered successfully to your location in Douala.' },
          ]
        });
      } else if (orderId === 'RX-122456') {
        setOrder({
          id: 'RX-122456',
          date: '2023-06-05T09:00:00',
          status: OrderStatus.PENDING,
          items: [],
          subtotal: 0,
          deliveryFee: 3000,
          total: 3000,
          prescriptionImage: 'https://placehold.co/400x300/png',
          estimatedDelivery: undefined,
          pharmacistNotes: 'Your prescription is being reviewed by our pharmacist in Bonamoussadi, Douala.',
          deliveryAddress: {
            street: '789 Rue Makepe',
            city: 'Douala',
            state: 'Littoral',
            zip: 'BP 789',
            instructions: 'Call upon arrival'
          },
          paymentMethod: 'To be determined after review',
          pharmacist: {
            name: 'Dr. Lisa Mbondji',
            phone: '+237 698234567'
          },
          timeline: [
            { status: 'Prescription Received', date: '2023-06-05T09:00:00', description: 'Your prescription has been received by our pharmacy team in Douala.' },
            { status: 'Under Review', date: '2023-06-05T10:30:00', description: 'A pharmacist is reviewing your prescription.' },
          ]
        });
      } else {
        // Handle case where order is not found
        Alert.alert('Error', 'Order not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const formatDateWithTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const handleCallPharmacist = () => {
    if (order && order.pharmacist && order.pharmacist.phone) {
      Linking.openURL(`tel:${order.pharmacist.phone}`);
    }
  };

  const trackDelivery = () => {
    if (order?.tracking) {
      // In a real app, this would open the tracking page or map view
      Alert.alert(
        "Track Delivery",
        "You can track your order here once it's dispatched"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <Button 
          mode="text" 
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          {''}
        </Button>
        <CustomText variant="headlineSmall" style={styles.headerTitle}>{t('pharmacy.orderDetails.title')}</CustomText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <CustomText>{t('common.loading')}</CustomText>
        </View>
      ) : order ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Header */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.orderHeaderRow}>
                <View>
                  <CustomText variant="titleLarge">{order.id}</CustomText>
                  <CustomText variant="bodySmall">{formatDateWithTime(order.date)}</CustomText>
                </View>
                <OrderStatusChip status={order.status} />
              </View>
            </Card.Content>
          </Card>

          {/* Order Timeline */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.status')}</CustomText>
              <View style={styles.timeline}>
                {order.timeline.map((event, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    {index < order.timeline.length - 1 && <View style={styles.timelineLine} />}
                    <View style={styles.timelineContent}>
                      <CustomText variant="bodyMedium" style={styles.timelineTitle}>{event.status}</CustomText>
                      <CustomText variant="bodySmall">{formatDateWithTime(event.date)}</CustomText>
                      <CustomText variant="bodySmall" style={styles.timelineDescription}>{event.description}</CustomText>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Prescription Image */}
          {order.prescriptionImage && (
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.prescription')}</CustomText>
                <Image 
                  source={{ uri: order.prescriptionImage }} 
                  style={styles.prescriptionImage}
                  resizeMode="cover"
                />
              </Card.Content>
            </Card>
          )}

          {/* Medications */}
          {order.items.length > 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.items')}</CustomText>
                {order.items.map((item, index) => (
                  <View key={index}>
                    <View style={styles.medicationHeader}>
                      <CustomText variant="titleSmall">{item.name}</CustomText>
                      <CustomText variant="bodyMedium" style={styles.medicationPrice}>XAF {item.price.toLocaleString()}</CustomText>
                    </View>
                    <View style={styles.medicationDetails}>
                      <View style={styles.medicationInfo}>
                        <CustomText variant="bodySmall">{t('pharmacy.orderDetails.quantity')}: {item.quantity}</CustomText>
                      </View>
                      {item.instructions && (
                        <View style={styles.instructionsContainer}>
                          <CustomText variant="bodySmall" style={styles.instructionsLabel}>{t('pharmacy.orderDetails.instructions')}:</CustomText>
                          <CustomText variant="bodySmall" style={styles.instructions}>{item.instructions}</CustomText>
                        </View>
                      )}
                    </View>
                    {index < order.items.length - 1 && <Divider style={styles.divider} />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.prescriptionOnly')}</CustomText>
                <CustomText variant="bodyMedium" style={styles.emptyMessage}>
                  {t('pharmacy.orderDetails.prescriptionOnlyMessage')}
                </CustomText>
              </Card.Content>
            </Card>
          )}

          {/* Delivery Information */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.deliveryInfo')}</CustomText>
              
              <View style={styles.deliveryRow}>
                <Ionicons name="location-outline" size={18} color={theme.colors.outline} style={styles.icon} />
                <View style={styles.deliveryContent}>
                  <CustomText variant="bodyMedium">{t('pharmacy.orderDetails.deliveryAddress')}</CustomText>
                  <CustomText variant="bodySmall">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
                  </CustomText>
                  {order.deliveryAddress.instructions && (
                    <CustomText variant="bodySmall" style={styles.deliveryInstructions}>
                      {t('pharmacy.orderDetails.note')} {order.deliveryAddress.instructions}
                    </CustomText>
                  )}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.deliveryRow}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.outline} style={styles.icon} />
                <View style={styles.deliveryContent}>
                  <CustomText variant="bodyMedium">{t('pharmacy.orderDetails.estimatedDelivery')}</CustomText>
                  {order.estimatedDelivery ? (
                    <CustomText variant="bodySmall">Expected: {formatDate(order.estimatedDelivery)}</CustomText>
                  ) : (
                    <CustomText variant="bodySmall">{t('pharmacy.orderDetails.toBeScheduled')}</CustomText>
                  )}
                  {order.deliveredDate && (
                    <CustomText variant="bodySmall" style={{ color: theme.colors.primary }}>
                      {t('pharmacy.orderDetails.delivered')} {formatDate(order.deliveredDate)}
                    </CustomText>
                  )}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.deliveryRow}>
                <Ionicons name="card-outline" size={18} color={theme.colors.outline} style={styles.icon} />
                <View style={styles.deliveryContent}>
                  <CustomText variant="bodyMedium">{t('pharmacy.orderDetails.paymentMethod')}</CustomText>
                  <CustomText variant="bodySmall">{order.paymentMethod}</CustomText>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Pharmacist Notes */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.pharmacistNotes')}</CustomText>
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text-outline" size={20} color={theme.colors.primary} />
                <CustomText variant="bodyMedium" style={styles.notes}>{order.pharmacistNotes}</CustomText>
              </View>

              <View style={styles.pharmacistInfoContainer}>
                <CustomText variant="bodySmall">{t('pharmacy.orderDetails.pharmacist')}: {order.pharmacist.name}</CustomText>
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={handleCallPharmacist}
                  style={styles.callButton}
                >
                  {t('pharmacy.orderDetails.callPharmacist')}
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Order Summary */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.orderDetails.orderSummary')}</CustomText>
              
              <View style={styles.summaryRow}>
                <CustomText variant="bodyMedium">{t('pharmacy.orderDetails.subtotal')}</CustomText>
                <CustomText variant="bodyMedium">XAF {order.subtotal.toLocaleString()}</CustomText>
              </View>
              
              <View style={styles.summaryRow}>
                <CustomText variant="bodyMedium">{t('pharmacy.orderDetails.deliveryFee')}</CustomText>
                <CustomText variant="bodyMedium">XAF {order.deliveryFee.toLocaleString()}</CustomText>
              </View>
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <CustomText variant="titleMedium">{t('pharmacy.orderDetails.total')}</CustomText>
                <CustomText variant="titleMedium" style={{ color: theme.colors.primary }}>XAF {order.total.toLocaleString()}</CustomText>
              </View>
            </Card.Content>
          </Card>

          {/* Support Button */}
          <Button
            mode="contained"
            icon="headset"
            onPress={() => router.push('/pharmacy-support' as any)}
            style={styles.supportButton}
          >
            {t('pharmacy.orderDetails.contactSupport')}
          </Button>

          {/* Track Delivery Button */}
          {order.tracking && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Button
              mode="contained"
              onPress={trackDelivery}
              style={styles.trackButton}
              icon="map-marker-path"
            >
              {t('pharmacy.orderDetails.trackDelivery')}
            </Button>
          )}
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <CustomText variant="titleMedium">{t('pharmacy.orderDetails.notFound.title')}</CustomText>
          <Button 
            mode="contained" 
            onPress={() => router.back()}
            style={styles.backToOrdersButton}
          >
            {t('pharmacy.orderDetails.notFound.backButton')}
          </Button>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  backToOrdersButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 5,
    marginRight: 15,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 15,
    bottom: -15,
    width: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontWeight: 'bold',
  },
  timelineDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  prescriptionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationPrice: {
    fontWeight: 'bold',
  },
  medicationDetails: {
    marginBottom: 12,
  },
  medicationInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  instructionsContainer: {
    marginTop: 4,
  },
  instructionsLabel: {
    opacity: 0.7,
  },
  instructions: {
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 12,
  },
  emptyMessage: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  deliveryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    marginTop: 2,
    marginRight: 12,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryInstructions: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  notesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  notes: {
    marginLeft: 12,
    flex: 1,
  },
  pharmacistInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callButton: {
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  supportButton: {
    marginTop: 8,
    marginBottom: 24,
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
  trackButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
});

export default PharmacyOrderDetailsScreen; 