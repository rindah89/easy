import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { IconButton } from '../components/CustomIconButton';
import { useTranslation } from 'react-i18next';
import LanguageButton from '../components/LanguageButton';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const navigateToPharmacy = () => {
    router.push('/pharmacy-all-lab-tests');
  };

  const navigateToGrocery = () => {
    router.push('/grocery-supermarket-selection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          {t('common.welcome')}
        </Text>
        <LanguageButton style={styles.languageButton} />
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('common.selectService')}
        </Text>

        <Card 
          style={styles.serviceCard}
          onPress={navigateToPharmacy}
        >
          <View style={styles.serviceCardContent}>
            <View style={styles.serviceInfo}>
              <Text variant="titleMedium">Pharmacy</Text>
              <Text variant="bodyMedium" color={theme.colors.onSurfaceVariant}>
                Order prescriptions, lab tests, and more.
              </Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <IconButton 
                icon="pill" 
                size={30}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </Card>

        <Card 
          style={styles.serviceCard}
          onPress={navigateToGrocery}
        >
          <View style={styles.serviceCardContent}>
            <View style={styles.serviceInfo}>
              <Text variant="titleMedium">Grocery Shopping</Text>
              <Text variant="bodyMedium" color={theme.colors.onSurfaceVariant}>
                Shop for groceries from local supermarkets.
              </Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <IconButton 
                icon="cart" 
                size={30}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  serviceCard: {
    marginBottom: 16,
  },
  serviceCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButton: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
}); 