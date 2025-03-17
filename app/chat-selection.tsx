import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/CustomCard';
import { Text } from '../components/CustomText';
import { Divider } from '../components/CustomDivider';
import { Badge } from '../components/CustomBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for chat conversations
const mockChats = [
  {
    id: '1',
    name: 'Alex Thompson',
    lastMessage: 'When will my furniture be delivered?',
    timestamp: '10:30 AM',
    unreadCount: 2,
    avatar: null,
    type: 'Furniture',
    orderId: 'ORD-2023-001'
  },
  {
    id: '2',
    name: 'Marie Curie',
    lastMessage: 'Your prescription is ready for pickup',
    timestamp: 'Yesterday',
    unreadCount: 0,
    avatar: null,
    type: 'Pharmacy',
    orderId: 'ORD-2023-002'
  },
  {
    id: '3',
    name: 'John Driver',
    lastMessage: 'I\'ve arrived at your location',
    timestamp: 'Yesterday',
    unreadCount: 1,
    avatar: null,
    type: 'Ride',
    orderId: 'ORD-2023-005'
  },
  {
    id: '4',
    name: 'Raju Tailor',
    lastMessage: 'Your textiles are ready for fitting',
    timestamp: 'Mon',
    unreadCount: 0,
    avatar: null,
    type: 'Textiles',
    orderId: 'ORD-2023-007'
  },
  {
    id: '5',
    name: 'Car Rental Support',
    lastMessage: 'Your car rental has been confirmed',
    timestamp: 'Sun',
    unreadCount: 0,
    avatar: null,
    type: 'Car Rental',
    orderId: 'ORD-2023-006'
  },
  {
    id: '6',
    name: 'Fresh Groceries',
    lastMessage: 'Thank you for your order!',
    timestamp: 'Sat',
    unreadCount: 0,
    avatar: null,
    type: 'Grocery',
    orderId: 'ORD-2023-003'
  },
  {
    id: '7',
    name: 'Restaurant Delicious',
    lastMessage: 'How was your meal?',
    timestamp: 'Fri',
    unreadCount: 0,
    avatar: null,
    type: 'Restaurant',
    orderId: 'ORD-2023-004'
  }
];

// Function to get icon based on chat type
const getChatTypeIcon = (type) => {
  switch (type) {
    case 'Furniture':
      return 'sofa';
    case 'Pharmacy':
      return 'pill';
    case 'Grocery':
      return 'cart';
    case 'Restaurant':
      return 'food';
    case 'Ride':
      return 'car';
    case 'Car Rental':
      return 'car-key';
    case 'Textiles':
      return 'hanger';
    default:
      return 'chat';
  }
};

export default function ChatSelectionScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? mockChats.filter(
        chat => 
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockChats;

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push(`/chat?id=${item.id}&name=${item.name}&type=${item.type}&orderId=${item.orderId}`)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name={getChatTypeIcon(item.type)}
              size={24}
              color={theme.colors.primary}
            />
          </View>
        )}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text variant="titleSmall" style={styles.chatName}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <Badge style={styles.unreadBadge}>
              {item.unreadCount}
            </Badge>
          )}
        </View>
        
        <Text variant="bodySmall" style={styles.orderType}>
          {item.type} • #{item.orderId.split('-').pop()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            // Simulate refresh
            setTimeout(() => setLoading(false), 1000);
          }}
        >
          <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          placeholder="Search chats..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.chatList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chat-outline" size={80} color={theme.colors.outline} />
          <Text variant="titleMedium" style={styles.emptyText}>No chats found</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "Your conversations will appear here"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  chatName: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#757575',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: 'bold',
  },
  unreadBadge: {
    marginLeft: 4,
  },
  orderType: {
    color: '#757575',
  },
  divider: {
    marginLeft: 16 + 50 + 16, // Matching avatar width + padding
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    color: '#757575',
  },
}); 