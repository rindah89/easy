import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Button } from '../components/Button';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { IconButton } from '../components/CustomIconButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface DeliveryAgent {
  id: string;
  name: string;
  rating: number;
  numberOfDeliveries: number;
  distance: string;
  estimatedTime: string;
  imageUrl: string;
  isAvailable: boolean;
}

export default function DeliveryAgentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract booking details from params
  const packageType = params.packageType as string;
  const price = params.price ? Number(params.price) : 0;
  const pickupAddress = params.pickupAddress as string;
  const deliveryAddress = params.deliveryAddress as string;
  
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Fetch nearby delivery agents
  useEffect(() => {
    // Simulate API call to fetch delivery agents
    const fetchAgents = async () => {
      try {
        // In a real app, you would call your backend API here
        // The API would use the pickup address to find nearby agents
        
        // Simulating network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data with Cameroonian names and African profiles
        const mockAgents: DeliveryAgent[] = [
          {
            id: '1',
            name: 'Etienne Nkeng',
            rating: 4.8,
            numberOfDeliveries: 125,
            distance: '1.2 km',
            estimatedTime: '10-15 min',
            imageUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
            isAvailable: true
          },
          {
            id: '2',
            name: 'Sandrine Ngo Ndoumou',
            rating: 4.7,
            numberOfDeliveries: 98,
            distance: '1.8 km',
            estimatedTime: '15-20 min',
            imageUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
            isAvailable: true
          },
          {
            id: '3',
            name: 'François Kamga',
            rating: 4.9,
            numberOfDeliveries: 213,
            distance: '2.3 km',
            estimatedTime: '20-25 min',
            imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
            isAvailable: true
          },
          {
            id: '4',
            name: 'Marie-Claire Sama',
            rating: 4.6,
            numberOfDeliveries: 76,
            distance: '3.1 km',
            estimatedTime: '25-30 min',
            imageUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
            isAvailable: true
          },
          {
            id: '5',
            name: 'Jean-Claude Biyongo',
            rating: 4.5,
            numberOfDeliveries: 52,
            distance: '3.8 km',
            estimatedTime: '30-35 min',
            imageUrl: 'https://randomuser.me/api/portraits/men/83.jpg',
            isAvailable: false
          }
        ];
        
        setAgents(mockAgents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [pickupAddress]);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const handleConfirmAgent = () => {
    if (!selectedAgent) return;
    
    setShowSuccessDialog(true);
    
    // Here you would typically save the booking with the selected agent to your backend
    
    // Show success message and redirect
    setTimeout(() => {
      setShowSuccessDialog(false);
      
      // Navigate back to home or to a tracking screen
      router.push('/');
    }, 3000);
  };

  const renderAgentItem = ({ item }: { item: DeliveryAgent }) => (
    <TouchableOpacity
      onPress={() => item.isAvailable && handleSelectAgent(item.id)}
      disabled={!item.isAvailable}
    >
      <Card 
        style={[
          styles.agentCard,
          selectedAgent === item.id && { borderColor: theme.colors.primary, borderWidth: 2 },
          !item.isAvailable && { opacity: 0.6 }
        ]}
      >
        <View style={styles.agentInfo}>
          <Image source={{ uri: item.imageUrl }} style={styles.agentImage} />
          <View style={styles.agentDetails}>
            <Text variant="titleMedium">{item.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text variant="bodyMedium" style={styles.ratingText}>{item.rating} ({item.numberOfDeliveries} deliveries)</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>{item.distance} away</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>ETA: {item.estimatedTime}</Text>
            </View>
          </View>
          {item.isAvailable ? (
            <MaterialCommunityIcons 
              name={selectedAgent === item.id ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
              size={24} 
              color={selectedAgent === item.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
            />
          ) : (
            <Text variant="labelMedium" style={styles.unavailableText}>Unavailable</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          color={theme.colors.onSurface}
          onPress={() => router.back()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>Select Delivery Agent</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <Card style={styles.bookingSummary}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.summaryTitle}>Booking Summary</Text>
        </View>
        
        <Divider style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelContainer}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={18} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.summaryIcon} 
            />
            <Text variant="bodyMedium">Package Type:</Text>
          </View>
          <Text variant="bodyMedium" style={[styles.summaryValue, styles.summaryHighlight, { color: theme.colors.primary }]}>
            {packageType?.charAt(0).toUpperCase() + packageType?.slice(1)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelContainer}>
            <MaterialCommunityIcons 
              name="map-marker" 
              size={18} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.summaryIcon} 
            />
            <Text variant="bodyMedium">From:</Text>
          </View>
          <Text variant="bodyMedium" style={styles.summaryValue} numberOfLines={1}>{pickupAddress}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelContainer}>
            <MaterialCommunityIcons 
              name="map-marker-radius" 
              size={18} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.summaryIcon} 
            />
            <Text variant="bodyMedium">To:</Text>
          </View>
          <Text variant="bodyMedium" style={styles.summaryValue} numberOfLines={1}>{deliveryAddress}</Text>
        </View>
        
        <Divider style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelContainer}>
            <MaterialCommunityIcons 
              name="cash" 
              size={18} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.summaryIcon} 
            />
            <Text variant="bodyMedium">Price:</Text>
          </View>
          <Text variant="titleMedium" style={[styles.priceValue, { color: theme.colors.primary }]}>{price} XAF</Text>
        </View>
      </Card>
      
      <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Agents Nearby</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>Finding nearby delivery agents...</Text>
        </View>
      ) : (
        <FlatList
          data={agents}
          renderItem={renderAgentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.agentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyLarge" style={styles.emptyText}>No delivery agents available in your area</Text>
            </View>
          }
        />
      )}
      
      <View style={styles.bottomContainer}>
        <Button 
          mode="contained" 
          onPress={handleConfirmAgent}
          style={styles.confirmButton}
          disabled={!selectedAgent}
        >
          <Text variant="labelLarge" style={{ color: 'white' }}>Confirm Agent</Text>
        </Button>
      </View>
      
      {/* Success Dialog */}
      {showSuccessDialog && (
        <View style={styles.successDialogOverlay}>
          <Card style={styles.successDialog}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={theme.colors.primary}
              style={{ marginBottom: 16 }}
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              Booking Successful!
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
              Your package delivery has been scheduled.
              The agent will pick up your package soon.
            </Text>
          </Card>
        </View>
      )}
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  bookingSummary: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  summaryTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  summaryDivider: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryValue: {
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  summaryHighlight: {
    fontWeight: '600',
  },
  priceValue: {
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  agentsList: {
    padding: 16,
  },
  agentCard: {
    marginBottom: 12,
    padding: 12,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  agentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#757575',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    marginTop: 8,
  },
  successDialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successDialog: {
    width: '80%',
    padding: 24,
    alignItems: 'center',
  },
  unavailableText: {
    color: '#B00020',
  },
}); 