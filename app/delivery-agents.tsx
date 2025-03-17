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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  
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

  // Get the selected agent details
  const getSelectedAgent = () => {
    return agents.find(agent => agent.id === selectedAgent);
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
              <Text variant="bodyMedium" style={styles.ratingText}>
                {item.rating} ({item.numberOfDeliveries} {t('package.deliveryAgents.details.deliveries')})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {t('package.deliveryAgents.agent.distanceAway', { distance: item.distance.split(' ')[0] })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {t('package.deliveryAgents.agent.deliveryTime', { time: item.estimatedTime })}
              </Text>
            </View>
          </View>
          {item.isAvailable ? (
            <MaterialCommunityIcons 
              name={selectedAgent === item.id ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
              size={24} 
              color={selectedAgent === item.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
            />
          ) : (
            <Text variant="labelMedium" style={styles.unavailableText}>
              {t('package.deliveryAgents.agent.unavailable')}
            </Text>
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
        <Text variant="titleLarge" style={styles.headerTitle}>
          {t('package.deliveryAgents.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <Card style={styles.bookingSummary}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.summaryTitle}>
            {t('package.deliveryAgents.confirmation.details')}
          </Text>
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
            <Text variant="bodyMedium">{t('package.deliveryAgents.confirmation.package')}:</Text>
          </View>
          <Text variant="bodyMedium" style={[styles.summaryValue, styles.summaryHighlight, { color: theme.colors.primary }]}>
            {t(`package.packageType.${packageType}`)}
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
            <Text variant="bodyMedium">{t('package.confirmation.from')}</Text>
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
            <Text variant="bodyMedium">{t('package.confirmation.to')}</Text>
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
            <Text variant="bodyMedium">{t('package.deliveryAgents.agent.price')}:</Text>
          </View>
          <Text variant="titleSmall" style={[styles.summaryValue, { color: theme.colors.primary }]}>
            {price} XAF
          </Text>
        </View>
      </Card>
      
      <View style={styles.contentContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('package.deliveryAgents.subtitle')}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : agents.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons 
              name="account-search" 
              size={48} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="bodyLarge" style={styles.emptyStateText}>
              {t('package.deliveryAgents.noAgents')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={agents}
            renderItem={renderAgentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.agentsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleConfirmAgent}
          disabled={!selectedAgent}
          style={[styles.confirmButton, !selectedAgent && { opacity: 0.5 }]}
        >
          {t('package.deliveryAgents.agent.select')}
        </Button>
      </View>
      
      {showSuccessDialog && (
        <View style={styles.successOverlay}>
          <Card style={styles.successDialog}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle-outline" 
                size={64} 
                color={theme.colors.primary} 
              />
            </View>
            <Text variant="titleLarge" style={styles.successTitle}>
              {t('package.deliveryAgents.confirmation.title')}
            </Text>
            <Text variant="bodyMedium" style={styles.successText}>
              {t('package.deliveryAgents.confirmation.message', { agentName: getSelectedAgent()?.name })}
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookingSummary: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  summaryDivider: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryValue: {
    flex: 2,
    textAlign: 'right',
  },
  summaryHighlight: {
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  agentsList: {
    paddingBottom: 80,
  },
  agentCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
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
    marginLeft: 16,
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
    fontSize: 13,
  },
  unavailableText: {
    color: 'red',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    marginTop: 0,
    borderRadius: 12,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successDialog: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    opacity: 0.8,
  },
}); 