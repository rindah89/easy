import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const buttonFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Sequence the animations
    Animated.sequence([
      // First fade in and slide up the logo and text
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Then fade in the buttons
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Image 
            source={require('../../assets/images/easyrideLogo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Text 
            style={[
              styles.title, 
              { 
                color: theme.colors.primary,
                fontSize: 32,
                fontWeight: 'bold'
              }
            ]}
          >
            Welcome!
          </Text>
          
          <Text 
            style={[
              styles.subtitle, 
              { 
                color: theme.colors.onSurfaceVariant,
                fontSize: 18,
                lineHeight: 24
              }
            ]}
          >
            Your premium ride service provider
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: buttonFadeAnim }
          ]}
        >
          <Button 
            mode="contained" 
            onPress={() => router.push('/(auth)/login')} 
            fullWidth
            style={[styles.signInButton, { paddingVertical: 8, height: 56 }]}
            textStyle={styles.buttonText}
          >
            Sign In
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => router.push('/(auth)/register')} 
            fullWidth
            style={[styles.createAccountButton, { paddingVertical: 8, height: 56 }]}
            textStyle={styles.buttonText}
          >
            Create Account
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.8,
    height: height * 0.2,
    maxWidth: 350,
    maxHeight: 175,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 60,
    paddingHorizontal: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  signInButton: {
    borderRadius: 12,
    elevation: 2,
  },
  createAccountButton: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  }
}); 