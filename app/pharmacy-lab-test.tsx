import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { Text as CustomText } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Chip } from '../components/CustomChip';
import { Divider } from '../components/CustomDivider';
import { Badge } from '../components/CustomBadge';
import { useTranslation } from 'react-i18next';

// Sample lab test data
const LAB_TESTS = [
  {
    id: 1,
    name: 'Complete Blood Count',
    price: 35.99,
    turnaround: '24 hours',
    description: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anemia, infection and leukemia.',
    longDescription: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anemia, infection and leukemia. The test measures several components and features of your blood, including red blood cells, white blood cells, platelets, hemoglobin, hematocrit, and mean corpuscular volume.',
    image: 'https://placehold.co/500x300/png',
    category: 'Common Tests',
    requirements: [
      'Fasting not required',
      'Water consumption allowed',
      'No recent exercise before test'
    ],
    popularity: 5,
    recommendedFor: [
      'Routine health checks',
      'Diagnosing blood disorders',
      'Monitoring overall health'
    ]
  },
  {
    id: 2,
    name: 'Diabetes Screening',
    price: 45.99,
    turnaround: '24 hours',
    description: 'Tests blood sugar levels to detect diabetes or pre-diabetes. Includes fasting glucose and HbA1c tests.',
    longDescription: 'Diabetes screening tests measure your blood sugar levels to check for diabetes or pre-diabetes. The test includes a fasting blood glucose test which measures blood sugar after fasting for at least 8 hours, and an HbA1c test which provides an average of your blood sugar levels over the past 2-3 months. This screening is essential for early detection and management of diabetes.',
    image: 'https://placehold.co/500x300/png',
    category: 'Metabolic Tests',
    requirements: [
      'Fasting for 8-12 hours required',
      'Water consumption allowed',
      'Avoid sugary drinks and foods before test'
    ],
    popularity: 4,
    recommendedFor: [
      'People over 45 years',
      'Overweight individuals',
      'Family history of diabetes'
    ]
  },
  {
    id: 3,
    name: 'Cholesterol Panel',
    price: 39.99,
    turnaround: '24 hours',
    description: 'Measures levels of cholesterol and triglycerides in your blood to assess heart disease risk.',
    longDescription: 'A lipid panel or cholesterol test measures the levels of fats and fatty substances (lipids) in your blood. This panel typically includes tests for total cholesterol, high-density lipoprotein (HDL) cholesterol, low-density lipoprotein (LDL) cholesterol, and triglycerides. Monitoring these levels helps assess your risk of heart disease and other cardiovascular conditions.',
    image: 'https://placehold.co/500x300/png',
    category: 'Cardiac Tests',
    requirements: [
      'Fasting for 9-12 hours required',
      'Water consumption allowed',
      'Avoid fatty foods 24 hours before'
    ],
    popularity: 4,
    recommendedFor: [
      'Adults over 20 years',
      'Family history of heart disease',
      'High blood pressure patients'
    ]
  },
  {
    id: 4,
    name: 'Thyroid Function',
    price: 69.99,
    turnaround: '48 hours',
    description: 'Evaluates how well your thyroid gland is working by measuring hormone levels in your blood.',
    longDescription: 'The thyroid function test measures the levels of thyroid hormones in your blood to determine if your thyroid gland is functioning properly. This test typically measures thyroid-stimulating hormone (TSH), free T4, and sometimes free T3. These tests help diagnose conditions such as hypothyroidism, hyperthyroidism, and other thyroid disorders that affect metabolism and many body functions.',
    image: 'https://placehold.co/500x300/png',
    category: 'Hormone Tests',
    requirements: [
      'No special preparation required',
      'Inform about medications that affect thyroid',
      'Early morning test recommended'
    ],
    popularity: 3,
    recommendedFor: [
      'Unexplained weight changes',
      'Fatigue and weakness',
      'Women over 50'
    ]
  }
];

const PharmacyLabTestScreen = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { testId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);

  // Dynamic styles that depend on theme
  const dynamicStyles = {
    turnaroundText: {
      marginLeft: 8,
      color: theme.colors.primary,
    },
    processNumberText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  };

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const foundTest = LAB_TESTS.find(t => t.id === Number(testId));
      
      if (foundTest) {
        setTest(foundTest);
      } else {
        Alert.alert(t('common.errorOccurred'), t('pharmacy.labTestDetails.notFound.title'), [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [testId, t]);

  const handleBookTest = () => {
    router.push('/pharmacy-book-sample-collection');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Button 
              mode="text" 
              onPress={() => router.back()}
              icon={() => <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />}
              style={styles.backButton}
            />
            <CustomText variant="headlineSmall" style={styles.headerTitle}>{t('pharmacy.labTestDetails.title')}</CustomText>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <CustomText variant="bodyMedium" style={styles.loadingText}>{t('pharmacy.labTestDetails.loading')}</CustomText>
          </View>
        ) : test === null ? (
          // Error state
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
            <CustomText variant="titleMedium">{t('pharmacy.labTestDetails.notFound.title')}</CustomText>
            <Button 
              mode="contained" 
              onPress={() => router.back()} 
              style={styles.backToPharmacyButton}
              icon={() => <Ionicons name="arrow-back" size={20} color="white" />}
            >
              {t('pharmacy.labTestDetails.notFound.backButton')}
            </Button>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Test Image */}
            <Image 
              source={{ uri: test.image }} 
              style={styles.testImage}
              resizeMode="cover"
            />

            {/* Basic Info */}
            <View style={styles.infoContainer}>
              <Chip 
                style={styles.categoryChip}
                textStyle={{ color: theme.colors.primary }}
              >
                {test.category}
              </Chip>

              <CustomText variant="headlineMedium" style={styles.testName}>{test.name}</CustomText>
              
              <View style={styles.priceContainer}>
                <CustomText variant="headlineSmall" style={styles.price}>${test.price.toFixed(2)}</CustomText>
                <Badge style={styles.discountBadge} textColor="#4CAF50">{t('pharmacy.labTestDetails.discount', { discount: 10 })}</Badge>
              </View>

              <View style={styles.turnaroundContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                <CustomText variant="bodyMedium" style={dynamicStyles.turnaroundText}>
                  {t('pharmacy.labTestDetails.resultsIn', { time: test.turnaround })}
                </CustomText>
              </View>
            </View>

            {/* Book Button */}
            <Button
              mode="contained"
              onPress={handleBookTest}
              style={styles.bookButton}
              icon={() => <MaterialCommunityIcons name="calendar-check" size={20} color={theme.colors.onPrimary} />}
            >
              {t('pharmacy.labTestDetails.bookButton')}
            </Button>

            <Divider style={styles.divider} />

            {/* Description */}
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.labTestDetails.about')}</CustomText>
                <CustomText variant="bodyMedium" style={styles.descriptionText}>
                  {test.longDescription}
                </CustomText>
              </Card.Content>
            </Card>

            {/* Test Requirements */}
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.labTestDetails.preparation')}</CustomText>
                <View style={styles.requirementsContainer}>
                  {test.requirements.map((requirement, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <MaterialCommunityIcons name="check-circle-outline" size={20} color="#4CAF50" />
                      <CustomText variant="bodyMedium" style={styles.requirementText}>{requirement}</CustomText>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Recommended For */}
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.labTestDetails.recommendedFor')}</CustomText>
                <View style={styles.recommendationsContainer}>
                  {test.recommendedFor.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <MaterialCommunityIcons name="account-check" size={20} color={theme.colors.primary} />
                      <CustomText variant="bodyMedium" style={styles.recommendationText}>{recommendation}</CustomText>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Collection Process */}
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.labTestDetails.collectionProcess.title')}</CustomText>
                <View style={styles.processContainer}>
                  <View style={styles.processItem}>
                    <View style={styles.processNumber}>
                      <CustomText style={dynamicStyles.processNumberText}>1</CustomText>
                    </View>
                    <View style={styles.processContent}>
                      <CustomText variant="bodyMedium" style={styles.processTitle}>{t('pharmacy.labTestDetails.collectionProcess.step1Title')}</CustomText>
                      <CustomText variant="bodySmall">{t('pharmacy.labTestDetails.collectionProcess.step1Description')}</CustomText>
                    </View>
                  </View>

                  <View style={styles.processItem}>
                    <View style={styles.processNumber}>
                      <CustomText style={dynamicStyles.processNumberText}>2</CustomText>
                    </View>
                    <View style={styles.processContent}>
                      <CustomText variant="bodyMedium" style={styles.processTitle}>{t('pharmacy.labTestDetails.collectionProcess.step2Title')}</CustomText>
                      <CustomText variant="bodySmall">{t('pharmacy.labTestDetails.collectionProcess.step2Description')}</CustomText>
                    </View>
                  </View>

                  <View style={styles.processItem}>
                    <View style={styles.processNumber}>
                      <CustomText style={dynamicStyles.processNumberText}>3</CustomText>
                    </View>
                    <View style={styles.processContent}>
                      <CustomText variant="bodyMedium" style={styles.processTitle}>{t('pharmacy.labTestDetails.collectionProcess.step3Title')}</CustomText>
                      <CustomText variant="bodySmall">{t('pharmacy.labTestDetails.collectionProcess.step3Description')}</CustomText>
                    </View>
                  </View>

                  <View style={styles.processItem}>
                    <View style={styles.processNumber}>
                      <CustomText style={dynamicStyles.processNumberText}>4</CustomText>
                    </View>
                    <View style={styles.processContent}>
                      <CustomText variant="bodyMedium" style={styles.processTitle}>{t('pharmacy.labTestDetails.collectionProcess.step4Title')}</CustomText>
                      <CustomText variant="bodySmall">{t('pharmacy.labTestDetails.collectionProcess.step4Description')}</CustomText>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* FAQ */}
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>{t('pharmacy.labTestDetails.faq.title')}</CustomText>
                
                <View style={styles.faqItem}>
                  <CustomText variant="bodyMedium" style={styles.faqQuestion}>
                    {t('pharmacy.labTestDetails.faq.question1')}
                  </CustomText>
                  <CustomText variant="bodySmall" style={styles.faqAnswer}>
                    {test.requirements[0].toLowerCase().includes('fast') 
                      ? t('pharmacy.labTestDetails.faq.answer1Fast')
                      : t('pharmacy.labTestDetails.faq.answer1NoFast')}
                  </CustomText>
                </View>
                
                <View style={styles.faqItem}>
                  <CustomText variant="bodyMedium" style={styles.faqQuestion}>
                    {t('pharmacy.labTestDetails.faq.question2')}
                  </CustomText>
                  <CustomText variant="bodySmall" style={styles.faqAnswer}>
                    {t('pharmacy.labTestDetails.faq.answer2', { time: test.turnaround })}
                  </CustomText>
                </View>
                
                <View style={styles.faqItem}>
                  <CustomText variant="bodyMedium" style={styles.faqQuestion}>
                    {t('pharmacy.labTestDetails.faq.question3')}
                  </CustomText>
                  <CustomText variant="bodySmall" style={styles.faqAnswer}>
                    {t('pharmacy.labTestDetails.faq.answer3')}
                  </CustomText>
                </View>
              </Card.Content>
            </Card>

            {/* Book Again Button */}
            <Button
              mode="contained"
              onPress={handleBookTest}
              style={styles.bookAgainButton}
              icon={() => <MaterialCommunityIcons name="calendar-check" size={20} color={theme.colors.onPrimary} />}
            >
              {t('pharmacy.labTestDetails.bookButton')}
            </Button>

            {/* Disclaimer */}
            <View style={styles.disclaimerContainer}>
              <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.outline} />
              <CustomText variant="bodySmall" style={styles.disclaimerText}>
                {t('pharmacy.labTestDetails.disclaimer')}
              </CustomText>
            </View>
          </ScrollView>
        )}
      </ScrollView>
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
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  backToPharmacyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  testImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  infoContainer: {
    marginTop: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#e8f5e9',
  },
  testName: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#e8f5e9',
  },
  turnaroundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    lineHeight: 22,
  },
  requirementsContainer: {
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    marginLeft: 12,
    flex: 1,
  },
  recommendationsContainer: {
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    marginLeft: 12,
    flex: 1,
  },
  processContainer: {
    marginBottom: 8,
  },
  processItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  processNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  processContent: {
    flex: 1,
  },
  processTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    opacity: 0.8,
  },
  bookAgainButton: {
    marginVertical: 16,
    borderRadius: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    marginLeft: 12,
    flex: 1,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export default PharmacyLabTestScreen; 