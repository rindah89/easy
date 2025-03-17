import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function TabsLayout() {
  const theme = useTheme();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialCommunityIcons name="chat" color={color} size={size} />
              {/* Show unread message badge when there are unread messages */}
              {/* This would be replaced with actual unread count from a context/state in a real app */}
              {true && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: theme.colors.error,
                    borderRadius: 12,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    3
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="car-rental"
        options={{
          title: 'Car Rental',
          href: null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car-key" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialCommunityIcons name="cart" color={color} size={size} />
              {cartCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 12,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          // Profile screen won't appear in the tab bar but will be part of the tabs navigation
        }}
      />
      <Tabs.Screen
        name="car-booking"
        options={{
          href: null,
          // This screen won't appear in the tab bar but will be part of the tabs navigation
        }}
      />
      <Tabs.Screen
        name="package"
        options={{
          href: null,
          // Package screen won't appear in the tab bar but will be part of the tabs navigation
        }}
      />
      <Tabs.Screen
        name="textiles"
        options={{
          href: null,
          // Textiles screen won't appear in the tab bar but will be part of the tabs navigation
        }}
      />
    </Tabs>
  );
} 