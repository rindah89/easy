import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../../components/CustomText';
import { Button } from '../../components/Button';
import { Card } from '../../components/CustomCard';
import { Divider } from '../../components/CustomDivider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConsultationBookingModal } from '../furniture';

const { width } = Dimensions.get('window');

// Service interface for design services
interface DesignService {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image: { uri: string };
  longDescription?: string;
  benefits?: string[];
  includedItems?: string[];
}

// Design services data
const designServices: DesignService[] = [
  {
    id: 'service1',
    title: 'Basic Design Consultation',
    description: 'A 1-hour virtual consultation to discuss your space and design ideas. Includes mood board and basic recommendations.',
    longDescription: 'Our Basic Design Consultation is perfect for homeowners who need professional advice but want to implement the changes themselves. During this 1-hour virtual session, our expert designers will listen to your needs, review photos of your space, and provide practical recommendations tailored to your style and budget. After the consultation, we\'ll send you a digital mood board and a summary of our recommendations to guide your project.',
    price: 'XAF 25,000',
    duration: '1 hour',
    image: { uri: 'https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=600' },
    benefits: [
      'Professional advice without full design commitment',
      'Budget-friendly option for DIY enthusiasts',
      'Quick turnaround for immediate design challenges',
      'Personalized mood board for visual guidance',
      'Recommendations for materials, colors, and furniture'
    ],
    includedItems: [
      '1-hour virtual consultation session',
      'Digital mood board with style direction',
      'Basic furniture layout suggestions',
      'Color palette recommendations',
      'Email summary of design advice'
    ]
  },
  {
    id: 'service2',
    title: 'Full Room Design Package',
    description: 'Complete design solution for one room including furniture layout, color scheme, and shopping list.',
    longDescription: 'Transform a single room with our comprehensive design package. We\'ll create a cohesive plan that addresses layout, style, color scheme, and furniture selection. The process begins with an in-depth consultation to understand your lifestyle and preferences, followed by a detailed design concept presentation. Once approved, you\'ll receive a complete shopping list and implementation guide to bring your new room to life.',
    price: 'XAF 150,000',
    duration: '2 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600' },
    benefits: [
      'Comprehensive solution for one complete room',
      'Professional space planning for optimal functionality',
      'Curated furniture and decor selections',
      'Custom color scheme tailored to your preferences',
      'Implementation guidance for assured results'
    ],
    includedItems: [
      'Initial in-home consultation (1-2 hours)',
      'Detailed floor plan and furniture layout',
      'Custom color palette and material selections',
      'Complete shopping list with budget options',
      'Digital room visualization',
      'Final presentation meeting',
      '1 round of revisions'
    ]
  },
  {
    id: 'service3',
    title: 'Luxury Home Makeover',
    description: 'Comprehensive redesign of your entire home with premium furniture selections and custom solutions.',
    longDescription: 'Elevate your entire living space with our Luxury Home Makeover service. This premium offering provides end-to-end design solutions for your whole home, ensuring a cohesive, sophisticated aesthetic throughout. Our senior designers will develop a comprehensive design strategy, source exclusive furniture pieces, and coordinate with contractors and craftsmen. We handle everything from concept to completion, delivering a magazine-worthy home that reflects your personal style and elevates your lifestyle.',
    price: 'XAF 1,200,000',
    duration: '4-6 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600' },
    benefits: [
      'Comprehensive whole-home design solution',
      'Access to exclusive designer furniture and decor',
      'Custom-designed features and built-ins',
      'Coordination with contractors and craftsmen',
      'Project management from concept to completion',
      'High-end, magazine-worthy results'
    ],
    includedItems: [
      'Multiple in-home consultations',
      'Complete space planning for all rooms',
      'Custom furniture design options',
      'Material and finish selections',
      'Contractor coordination and site visits',
      'Shopping and procurement services',
      'Installation and styling',
      'Final reveal and walkthrough'
    ]
  },
  {
    id: 'service4',
    title: 'Commercial Space Design',
    description: 'Professional design services for offices, restaurants, and retail spaces to impress clients and enhance productivity.',
    longDescription: 'Create a commercial environment that enhances your brand identity, improves customer experience, and maximizes staff productivity. Our Commercial Space Design service offers specialized solutions for offices, restaurants, retail stores, and other business environments. We combine aesthetic appeal with functional requirements, addressing factors like traffic flow, brand consistency, and industry compliance. From concept development to implementation oversight, we deliver commercial spaces that make a lasting impression on clients and staff alike.',
    price: 'XAF 2,500,000+',
    duration: 'Varies',
    image: { uri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600' },
    benefits: [
      'Brand-aligned design that strengthens identity',
      'Optimized layouts for productivity and traffic flow',
      'Solutions that enhance customer/client experience',
      'Compliance with commercial regulations and standards',
      'Durable materials selected for high-traffic environments',
      'Potential ROI through increased business performance'
    ],
    includedItems: [
      'Site analysis and needs assessment',
      'Brand integration strategy',
      'Space planning and traffic flow optimization',
      'Custom fixtures and furniture specifications',
      'Lighting and acoustic planning',
      'Material and finish selections',
      'Vendor coordination',
      'Implementation oversight',
      'Post-occupancy evaluation'
    ]
  },
  {
    id: 'service5',
    title: 'Kitchen & Bath Renovation',
    description: 'Specialized design for the most value-adding rooms in your home with expert material selection and contractor coordination.',
    longDescription: 'Kitchens and bathrooms are the most complex rooms to design and the most valuable to renovate. Our specialized Kitchen & Bath Renovation service combines expert design knowledge with technical expertise to create functional, beautiful spaces that enhance your daily life and home value. We guide you through layout options, material selection, fixture choices, and work directly with contractors to ensure seamless execution. Whether you\'re looking for a modern chef\'s kitchen or a spa-like bathroom retreat, our designers create spaces that balance beauty and practicality.',
    price: 'XAF 750,000',
    duration: '3-4 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1556912031-f9022b89b396?q=80&w=600' },
    benefits: [
      'Expert design for the highest-value rooms in your home',
      'Technical expertise in plumbing, electrical, and cabinetry',
      'Material selections that balance beauty and durability',
      'Layout optimization for functionality and flow',
      'Potential for significant return on investment'
    ],
    includedItems: [
      'Detailed site measurement and assessment',
      'Multiple layout options with pros/cons',
      'Cabinet and storage solutions',
      'Fixture and appliance specifications',
      'Material and finish selections',
      'Technical drawings for contractors',
      'Contractor coordination',
      'Site visits during implementation',
      'Final walkthrough and punch list'
    ]
  },
  {
    id: 'service6',
    title: 'Outdoor Living Design',
    description: 'Extend your living space outdoors with beautiful, functional designs for gardens, patios, and entertainment areas.',
    longDescription: 'Transform your outdoor areas into true living spaces that complement your home and lifestyle. Our Outdoor Living Design service addresses gardens, patios, decks, and entertainment areas with the same attention to detail as interior spaces. We consider factors like climate, maintenance requirements, privacy, and your entertainment needs to create outdoor rooms that are both beautiful and practical. From intimate garden retreats to expansive entertainment spaces, we help you maximize your property\'s potential for outdoor living.',
    price: 'XAF 500,000',
    duration: '2-3 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600' },
    benefits: [
      'Seamless extension of your interior living space',
      'Climate-appropriate design for comfort and durability',
      'Solutions that enhance property value and curb appeal',
      'Balanced approach to aesthetics and maintenance requirements',
      'Custom features like outdoor kitchens, fire pits, or water elements'
    ],
    includedItems: [
      'Site analysis and assessment',
      'Concept development with 3D visualization',
      'Hardscape and softscape recommendations',
      'Furniture and accessory selections',
      'Lighting plan for evening enjoyment',
      'Planting suggestions (if applicable)',
      'Implementation guidelines for contractors',
      'Styling advice for seasonal adaptability'
    ]
  }
];

// Service detail component
const ServiceDetailCard = ({ service, onBook }: { service: DesignService, onBook: () => void }) => {
  const theme = useTheme();
  
  return (
    <Card style={styles.detailCard}>
      <Card.Cover source={service.image} style={styles.detailImage} />
      <Card.Content style={styles.detailContent}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceHeaderLeft}>
            <Text variant="titleLarge" style={styles.detailTitle}>{service.title}</Text>
            <Text variant="titleMedium" style={[styles.detailPrice, { color: theme.colors.primary }]}>
              {service.price}
            </Text>
          </View>
          <View style={styles.serviceHeaderRight}>
            <View style={styles.durationBadge}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.durationText}>
                {service.duration}
              </Text>
            </View>
          </View>
        </View>
        
        <Divider style={styles.detailDivider} />
        
        <Text variant="bodyLarge" style={styles.detailDescription}>
          {service.longDescription || service.description}
        </Text>
        
        {service.benefits && (
          <View style={styles.detailSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Benefits</Text>
            {service.benefits.map((benefit, index) => (
              <View key={index} style={styles.bulletItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} style={styles.bulletIcon} />
                <Text variant="bodyMedium" style={styles.bulletText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
        
        {service.includedItems && (
          <View style={styles.detailSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>What's Included</Text>
            {service.includedItems.map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color={theme.colors.primary} style={styles.bulletIcon} />
                <Text variant="bodyMedium" style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Button
          mode="contained"
          style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
          onPress={onBook}
        >
          Book This Service
        </Button>
      </Card.Content>
    </Card>
  );
};

const DesignServicesScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<DesignService | null>(null);

  const handleBookService = (service: DesignService) => {
    setSelectedService(service);
    setConsultationModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>Design Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <Text variant="headlineMedium" style={styles.heroTitle}>
              Interior Design Services
            </Text>
            <Text variant="bodyLarge" style={styles.heroSubtitle}>
              Transform your space with our professional design expertise
            </Text>
          </View>
        </View>

        <View style={styles.introSection}>
          <Text variant="bodyLarge" style={styles.introText}>
            Our team of experienced interior designers specializes in creating beautiful, functional 
            spaces tailored to your lifestyle and preferences. From quick consultations to full home 
            makeovers, we offer services to match every need and budget.
          </Text>
        </View>

        <View style={styles.servicesSection}>
          <Text variant="titleLarge" style={styles.sectionHeader}>Our Services</Text>
          {designServices.map((service) => (
            <ServiceDetailCard 
              key={service.id}
              service={service}
              onBook={() => handleBookService(service)}
            />
          ))}
        </View>

        <View style={styles.processSection}>
          <Text variant="titleLarge" style={styles.sectionHeader}>Our Design Process</Text>
          <Card style={styles.processCard}>
            <Card.Content>
              <View style={styles.processStep}>
                <View style={[styles.processStepNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>1</Text>
                </View>
                <View style={styles.processStepContent}>
                  <Text variant="titleMedium" style={styles.processStepTitle}>Consultation</Text>
                  <Text variant="bodyMedium" style={styles.processStepDescription}>
                    We begin with a thorough consultation to understand your vision, needs, style preferences, and budget constraints.
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.processDivider} />
              
              <View style={styles.processStep}>
                <View style={[styles.processStepNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>2</Text>
                </View>
                <View style={styles.processStepContent}>
                  <Text variant="titleMedium" style={styles.processStepTitle}>Concept Development</Text>
                  <Text variant="bodyMedium" style={styles.processStepDescription}>
                    Our designers create a detailed concept including floor plans, color schemes, material selections, and furniture recommendations.
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.processDivider} />
              
              <View style={styles.processStep}>
                <View style={[styles.processStepNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>3</Text>
                </View>
                <View style={styles.processStepContent}>
                  <Text variant="titleMedium" style={styles.processStepTitle}>Presentation & Refinement</Text>
                  <Text variant="bodyMedium" style={styles.processStepDescription}>
                    We present the design concept and gather your feedback, making adjustments to ensure the final design aligns perfectly with your vision.
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.processDivider} />
              
              <View style={styles.processStep}>
                <View style={[styles.processStepNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>4</Text>
                </View>
                <View style={styles.processStepContent}>
                  <Text variant="titleMedium" style={styles.processStepTitle}>Implementation</Text>
                  <Text variant="bodyMedium" style={styles.processStepDescription}>
                    Depending on your service level, we either provide detailed guidance for DIY implementation or manage the entire process with contractors and vendors.
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.processDivider} />
              
              <View style={styles.processStep}>
                <View style={[styles.processStepNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>5</Text>
                </View>
                <View style={styles.processStepContent}>
                  <Text variant="titleMedium" style={styles.processStepTitle}>Final Reveal</Text>
                  <Text variant="bodyMedium" style={styles.processStepDescription}>
                    We ensure all elements are perfectly executed and provide a final walkthrough of your beautifully transformed space.
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.ctaSection}>
          <Card style={styles.ctaCard}>
            <Card.Content style={styles.ctaContent}>
              <Text variant="titleLarge" style={styles.ctaTitle}>Ready to Transform Your Space?</Text>
              <Text variant="bodyLarge" style={styles.ctaText}>
                Book a consultation with our design team today and take the first step toward your dream interior.
              </Text>
              <Button 
                mode="contained" 
                style={styles.ctaButton}
                onPress={() => handleBookService(designServices[0])}
              >
                Book Initial Consultation
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Consultation Booking Modal */}
      <ConsultationBookingModal
        visible={consultationModalVisible}
        onClose={() => setConsultationModalVisible(false)}
        service={selectedService}
      />
    </SafeAreaView>
  );
};

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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heroTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'white',
    textAlign: 'center',
  },
  introSection: {
    padding: 16,
    marginBottom: 16,
  },
  introText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  servicesSection: {
    padding: 16,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailImage: {
    height: 200,
  },
  detailContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceHeaderLeft: {
    flex: 1,
  },
  serviceHeaderRight: {
    marginLeft: 16,
  },
  detailTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailPrice: {
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  durationText: {
    marginLeft: 4,
  },
  detailDivider: {
    marginVertical: 12,
  },
  detailDescription: {
    marginBottom: 16,
    lineHeight: 24,
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
  },
  bookButton: {
    marginTop: 16,
  },
  processSection: {
    padding: 16,
    marginTop: 16,
  },
  processCard: {
    borderRadius: 12,
  },
  processStep: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  processStepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  processStepContent: {
    flex: 1,
  },
  processStepTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  processStepDescription: {
    lineHeight: 20,
  },
  processDivider: {
    marginLeft: 56,
  },
  ctaSection: {
    padding: 16,
    marginTop: 16,
  },
  ctaCard: {
    borderRadius: 12,
  },
  ctaContent: {
    padding: 8,
  },
  ctaTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  ctaButton: {
    marginTop: 8,
  },
});

export default DesignServicesScreen; 