import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Animated, Image } from 'react-native';
import { useTheme, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Text } from '../../components/CustomText';
import { Card } from '../../components/CustomCard';
import { Divider } from '../../components/CustomDivider';
import { IconButton } from '../../components/CustomIconButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SimpleFormInput } from '../../components/FormInput';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface PackageBookingFormData {
  pickupDate: Date;
  pickupTime: Date;
  pickupAddress: string;
  deliveryAddress: string;
  packageDetails: string;
  packageWeight: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: 'credit_card' | 'mobile_money' | 'cash';
}

export default function PackageScreen() {
  const theme = useTheme();
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);
  const { t, i18n } = useTranslation();
  
  // Animation value for custom toast
  const toastAnim = useRef(new Animated.Value(0)).current;
  
  // State for date pickers
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  
  // State for package booking form
  const [bookingForm, setBookingForm] = useState<PackageBookingFormData>({
    pickupDate: new Date(),
    pickupTime: new Date(),
    pickupAddress: '',
    deliveryAddress: '',
    packageDetails: '',
    packageWeight: '',
    recipientName: '',
    recipientPhone: '',
    paymentMethod: 'credit_card',
  });
  
  // State for package type selection
  const [packageType, setPackageType] = useState<'document' | 'small' | 'medium' | 'large'>('small');
  
  // State for booking confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // State for success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // State for tracking form completion progress (0-100)
  const [formProgress, setFormProgress] = useState(25);

  // Handle date picker changes
  const onPickupDateChange = (event: any, selectedDate?: Date) => {
    setShowPickupDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate || bookingForm.pickupDate;
      setBookingForm({
        ...bookingForm,
        pickupDate: currentDate,
      });
      updateFormProgress();
    }
  };

  // Handle time picker changes
  const onPickupTimeChange = (event: any, selectedTime?: Date) => {
    setShowPickupTimePicker(false);
    if (selectedTime) {
      const currentTime = selectedTime || bookingForm.pickupTime;
      setBookingForm({
        ...bookingForm,
        pickupTime: currentTime,
      });
      updateFormProgress();
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof PackageBookingFormData, value: any) => {
    setBookingForm({
      ...bookingForm,
      [field]: value,
    });
    updateFormProgress();
  };

  // Update form progress based on filled fields
  const updateFormProgress = () => {
    const formFields = [
      bookingForm.pickupAddress,
      bookingForm.deliveryAddress,
      bookingForm.packageDetails,
      bookingForm.packageWeight,
      bookingForm.recipientName,
      bookingForm.recipientPhone
    ];
    
    const filledFields = formFields.filter(field => field && field.trim() !== '').length;
    const progressPercentage = 25 + (filledFields / formFields.length) * 75;
    
    setFormProgress(progressPercentage);
  };

  // Calculate package price based on type and weight
  const calculatePackagePrice = (): number => {
    const basePrice = {
      document: 500,
      small: 1000,
      medium: 1500,
      large: 2500,
    }[packageType];
    
    // Additional cost based on weight
    let weightCost = 0;
    const weight = parseFloat(bookingForm.packageWeight) || 0;
    
    if (weight > 5) {
      weightCost = (weight - 5) * 200; // 200 XAF per kg above 5kg
    }
    
    return basePrice + weightCost;
  };

  // Handle booking submission
  const handleBooking = () => {
    // Validation could be added here
    setShowConfirmDialog(true);
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    setShowConfirmDialog(false);
    
    // Save the booking data to pass to the delivery agents screen
    // You can use router.push() with params, or store in global state management
    
    // Navigate to the delivery agents selection screen
    router.push({
      pathname: '/delivery-agents',
      params: {
        packageType,
        price: calculatePackagePrice(),
        // You can add more booking details as needed
        pickupAddress: bookingForm.pickupAddress,
        deliveryAddress: bookingForm.deliveryAddress,
        pickupTime: bookingForm.pickupTime.toISOString(),
        pickupDate: bookingForm.pickupDate.toISOString(),
      }
    });
  };

  // Package type options with icons and pricing
  const packageOptions = [
    { 
      type: 'document', 
      icon: 'file-document-outline', 
      label: t('package.packageType.document'), 
      description: t('package.packageType.documentDescription'),
      basePrice: 500 
    },
    { 
      type: 'small', 
      icon: 'package-variant-closed', 
      label: t('package.packageType.small'), 
      description: t('package.packageType.smallDescription'),
      basePrice: 1000 
    },
    { 
      type: 'medium', 
      icon: 'package-variant', 
      label: t('package.packageType.medium'), 
      description: t('package.packageType.mediumDescription'),
      basePrice: 1500 
    },
    { 
      type: 'large', 
      icon: 'package', 
      label: t('package.packageType.large'), 
      description: t('package.packageType.largeDescription'),
      basePrice: 2500 
    },
  ];

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
        <Text variant="titleLarge" style={styles.headerTitle}>{t('package.title')}</Text>
        <IconButton
          icon="information-outline"
          size={24}
          color={theme.colors.onSurface}
          onPress={() => console.log('Info pressed')}
        />
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={formProgress / 100} color={theme.colors.primary} style={styles.progressBar} />
        <Text variant="bodySmall" style={styles.progressText}>
          {formProgress < 100 ? t('package.progress.complete') : t('package.progress.ready')}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Promotional Banner */}
        <View style={styles.promoBannerContainer}>
          <LinearGradient
            colors={['#4A6FFF', '#8A3FFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoBannerContent}>
              <View style={styles.promoBannerTextContent}>
                <Text variant="titleMedium" style={styles.promoBannerTitle}>{t('package.promo.title')}</Text>
                <Text variant="bodyMedium" style={styles.promoBannerDescription}>
                  {t('package.promo.description')}
                </Text>
              </View>
              <View style={styles.promoBannerIconContainer}>
                <MaterialCommunityIcons name="truck-fast" size={48} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Package Type Selection */}
        <Card style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.packageType.title')}</Text>
          
          <View style={styles.packageTypesGrid}>
            {packageOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.packageTypeCard,
                  packageType === option.type && {
                    borderColor: theme.colors.primary,
                    backgroundColor: `${theme.colors.primaryContainer}80`,
                  },
                ]}
                onPress={() => setPackageType(option.type as any)}
              >
                <View style={[
                  styles.packageTypeIconContainer,
                  packageType === option.type && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={28}
                    color={packageType === option.type ? 'white' : theme.colors.onSurfaceVariant}
                  />
                </View>
                <View style={styles.packageTypeTextContainer}>
                  <Text 
                    variant="labelMedium" 
                    style={{ 
                      fontWeight: '600',
                      color: packageType === option.type ? theme.colors.primary : theme.colors.onSurface,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={{ 
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {option.basePrice} XAF
                  </Text>
                </View>
                {packageType === option.type && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.packageTypeSelectedIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.packageDescriptionContainer}>
            <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.packageDescription}>
              {packageOptions.find(opt => opt.type === packageType)?.description}
            </Text>
          </View>
        </Card>
        
        {/* Pickup Details */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="map-marker" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.pickup.title')}</Text>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.dateContainer}>
              <Text variant="bodyMedium" style={styles.label}>{t('package.pickup.date')}</Text>
              <TouchableOpacity
                style={[styles.datePicker, { borderColor: theme.colors.outline }]}
                onPress={() => setShowPickupDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                  {bookingForm.pickupDate.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateContainer}>
              <Text variant="bodyMedium" style={styles.label}>{t('package.pickup.time')}</Text>
              <TouchableOpacity
                style={[styles.datePicker, { borderColor: theme.colors.outline }]}
                onPress={() => setShowPickupTimePicker(true)}
              >
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                  {bookingForm.pickupTime.toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <SimpleFormInput
            label={t('package.pickup.address')}
            value={bookingForm.pickupAddress}
            onChangeText={(text) => handleInputChange('pickupAddress', text)}
            placeholder={t('package.pickup.addressPlaceholder')}
            containerStyle={{ marginTop: 16 }}
            icon="map-marker"
          />
        </Card>
        
        {/* Package Information */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="package-variant" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.packageInfo.title')}</Text>
          </View>
          
          <SimpleFormInput
            label={t('package.packageInfo.details')}
            value={bookingForm.packageDetails}
            onChangeText={(text) => handleInputChange('packageDetails', text)}
            placeholder={t('package.packageInfo.detailsPlaceholder')}
            multiline
            numberOfLines={3}
            containerStyle={{ marginTop: 8 }}
            icon="package-variant"
          />
          
          <SimpleFormInput
            label={t('package.packageInfo.weight')}
            value={bookingForm.packageWeight}
            onChangeText={(text) => handleInputChange('packageWeight', text)}
            placeholder={t('package.packageInfo.weightPlaceholder')}
            containerStyle={{ marginTop: 16 }}
            keyboardType="numeric"
            icon="weight-kilogram"
          />
        </Card>
        
        {/* Delivery Information */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.delivery.title')}</Text>
          </View>
          
          <SimpleFormInput
            label={t('package.delivery.address')}
            value={bookingForm.deliveryAddress}
            onChangeText={(text) => handleInputChange('deliveryAddress', text)}
            placeholder={t('package.delivery.addressPlaceholder')}
            containerStyle={{ marginTop: 8 }}
            icon="map-marker-radius"
          />
          
          <SimpleFormInput
            label={t('package.delivery.recipientName')}
            value={bookingForm.recipientName}
            onChangeText={(text) => handleInputChange('recipientName', text)}
            placeholder={t('package.delivery.recipientNamePlaceholder')}
            containerStyle={{ marginTop: 16 }}
            icon="account"
          />
          
          <SimpleFormInput
            label={t('package.delivery.recipientPhone')}
            value={bookingForm.recipientPhone}
            onChangeText={(text) => handleInputChange('recipientPhone', text)}
            placeholder={t('package.delivery.recipientPhonePlaceholder')}
            containerStyle={{ marginTop: 16 }}
            keyboardType="phone-pad"
            icon="phone"
          />
        </Card>
        
        {/* Payment Method */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="wallet" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.payment.title')}</Text>
          </View>
          
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                bookingForm.paymentMethod === 'credit_card' && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primaryContainer}80`,
                },
              ]}
              onPress={() => handleInputChange('paymentMethod', 'credit_card')}
            >
              <View style={[
                styles.paymentIconContainer,
                bookingForm.paymentMethod === 'credit_card' && {
                  backgroundColor: theme.colors.primary,
                },
              ]}>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={22}
                  color={bookingForm.paymentMethod === 'credit_card' ? 'white' : theme.colors.onSurfaceVariant}
                />
              </View>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  marginTop: 8,
                  fontWeight: bookingForm.paymentMethod === 'credit_card' ? '600' : '400',
                  color: bookingForm.paymentMethod === 'credit_card' ? theme.colors.primary : theme.colors.onSurface,
                }}
              >
                {t('package.payment.creditCard')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                bookingForm.paymentMethod === 'mobile_money' && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primaryContainer}80`,
                },
              ]}
              onPress={() => handleInputChange('paymentMethod', 'mobile_money')}
            >
              <View style={[
                styles.paymentIconContainer,
                bookingForm.paymentMethod === 'mobile_money' && {
                  backgroundColor: theme.colors.primary,
                },
              ]}>
                <MaterialCommunityIcons
                  name="cellphone"
                  size={22}
                  color={bookingForm.paymentMethod === 'mobile_money' ? 'white' : theme.colors.onSurfaceVariant}
                />
              </View>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  marginTop: 8,
                  fontWeight: bookingForm.paymentMethod === 'mobile_money' ? '600' : '400',
                  color: bookingForm.paymentMethod === 'mobile_money' ? theme.colors.primary : theme.colors.onSurface,
                }}
              >
                {t('package.payment.mobileMoney')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                bookingForm.paymentMethod === 'cash' && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primaryContainer}80`,
                },
              ]}
              onPress={() => handleInputChange('paymentMethod', 'cash')}
            >
              <View style={[
                styles.paymentIconContainer,
                bookingForm.paymentMethod === 'cash' && {
                  backgroundColor: theme.colors.primary,
                },
              ]}>
                <MaterialCommunityIcons
                  name="cash"
                  size={22}
                  color={bookingForm.paymentMethod === 'cash' ? 'white' : theme.colors.onSurfaceVariant}
                />
              </View>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  marginTop: 8,
                  fontWeight: bookingForm.paymentMethod === 'cash' ? '600' : '400',
                  color: bookingForm.paymentMethod === 'cash' ? theme.colors.primary : theme.colors.onSurface,
                }}
              >
                {t('package.payment.cash')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Price Summary */}
        <Card style={styles.card}>
          <LinearGradient
            colors={['#F8F9FA', theme.colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="receipt" size={22} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('package.summary.title')}</Text>
            </View>
            
            <View style={styles.priceSummaryRow}>
              <Text variant="bodyMedium">
                {t('package.summary.basePrice', { type: t(`package.packageType.${packageType}`) })}
              </Text>
              <Text variant="bodyMedium">{packageOptions.find(opt => opt.type === packageType)?.basePrice} XAF</Text>
            </View>
            
            {parseFloat(bookingForm.packageWeight) > 5 && (
              <View style={styles.priceSummaryRow}>
                <Text variant="bodyMedium">
                  {t('package.packageInfo.weightSurcharge', { weight: (parseFloat(bookingForm.packageWeight) - 5).toFixed(1) })}
                </Text>
                <Text variant="bodyMedium">{((parseFloat(bookingForm.packageWeight) - 5) * 200).toFixed(0)} XAF</Text>
              </View>
            )}
            
            <Divider style={{ marginVertical: 12 }} />
            
            <View style={styles.priceSummaryTotal}>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>{t('package.summary.total')}</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {calculatePackagePrice().toFixed(0)} XAF
              </Text>
            </View>
          </LinearGradient>
        </Card>
        
        {/* Booking Button */}
        <Button 
          mode="contained" 
          onPress={handleBooking}
          style={styles.bookButton}
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          contentStyle={{ paddingVertical: 8 }}
        >
          {t('package.action.book')}
        </Button>
      </ScrollView>
      
      {/* Date Pickers */}
      {showPickupDatePicker && (
        <DateTimePicker
          value={bookingForm.pickupDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickupDateChange}
          minimumDate={new Date()}
          locale={i18n.language}
        />
      )}
      
      {showPickupTimePicker && (
        <DateTimePicker
          value={bookingForm.pickupTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickupTimeChange}
          locale={i18n.language}
        />
      )}
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 16 }}
        >
          <View style={styles.dialogIconContainer}>
            <MaterialCommunityIcons
              name="package-variant-closed-check"
              size={54}
              color={theme.colors.primary}
            />
          </View>
          <Dialog.Content>
            <Text variant="titleLarge" style={{ marginBottom: 12, textAlign: 'center', fontWeight: '700' }}>
              {t('package.confirmation.title')}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
              {t('package.confirmation.message', { price: calculatePackagePrice().toFixed(0) })}
            </Text>
            <View style={styles.confirmationDetails}>
              <View style={styles.confirmationRow}>
                <MaterialCommunityIcons name="package-variant" size={18} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.confirmationLabel}>{t('package.confirmation.packageType')}</Text>
                <Text variant="bodyMedium" style={styles.confirmationValue}>
                  {t(`package.packageType.${packageType}`)}
                </Text>
              </View>
              
              <View style={styles.confirmationRow}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.confirmationLabel}>{t('package.confirmation.pickup')}</Text>
                <Text variant="bodyMedium" style={styles.confirmationValue}>
                  {bookingForm.pickupDate.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')} at {bookingForm.pickupTime.toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={styles.confirmationRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.confirmationLabel}>{t('package.confirmation.from')}</Text>
                <Text variant="bodyMedium" style={styles.confirmationValue} numberOfLines={1}>
                  {bookingForm.pickupAddress || t('package.confirmation.notSpecified')}
                </Text>
              </View>
              
              <View style={styles.confirmationRow}>
                <MaterialCommunityIcons name="map-marker-radius" size={18} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.confirmationLabel}>{t('package.confirmation.to')}</Text>
                <Text variant="bodyMedium" style={styles.confirmationValue} numberOfLines={1}>
                  {bookingForm.deliveryAddress || t('package.confirmation.notSpecified')}
                </Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)} mode="outlined" style={{ borderRadius: 8 }}>
              {t('package.confirmation.cancel')}
            </Button>
            <Button onPress={handleConfirmBooking} mode="contained" style={{ borderRadius: 8 }}>
              {t('package.confirmation.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog
          visible={showSuccessDialog}
          dismissable={false}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 16 }}
        >
          <Dialog.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={theme.colors.primary}
              style={{ marginBottom: 16 }}
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8, fontWeight: '700' }}>
              {t('package.success.title')}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
              {t('package.success.message')}
            </Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
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
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoBannerContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  promoBanner: {
    borderRadius: 12,
    padding: 16,
  },
  promoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBannerTextContent: {
    flex: 3,
  },
  promoBannerTitle: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 4,
  },
  promoBannerDescription: {
    color: 'white',
    opacity: 0.9,
  },
  promoBannerIconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  packageTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packageTypeCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  packageTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageTypeTextContainer: {
    flex: 1,
  },
  packageTypeSelectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  packageDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  packageDescription: {
    flex: 1,
    marginLeft: 8,
    opacity: 0.8,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateContainer: {
    width: '48%',
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceSummaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryGradient: {
    borderRadius: 12,
    padding: 16,
  },
  bookButton: {
    marginTop: 8,
    borderRadius: 10,
    elevation: 3,
  },
  dialogIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  confirmationDetails: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationLabel: {
    marginLeft: 8,
    fontWeight: '600',
    width: 70,
  },
  confirmationValue: {
    flex: 1,
    marginLeft: 8,
  },
}); 