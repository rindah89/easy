import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/CustomText';
import { Divider } from '../components/CustomDivider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

// Mock messages for demonstration
const generateMockMessages = (type: string): Message[] => {
  const commonMessages: Message[] = [
    {
      id: '1',
      text: 'Hello there!',
      sender: 'other',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      text: 'Hi! How can I help you today?',
      sender: 'user',
      timestamp: '10:31 AM',
      status: 'read'
    }
  ];

  let typeSpecificMessages: Message[] = [];

  switch (type) {
    case 'Furniture':
      typeSpecificMessages = [
        {
          id: '3',
          text: 'When will my furniture be delivered?',
          sender: 'other',
          timestamp: '10:32 AM'
        },
        {
          id: '4',
          text: 'Your delivery is scheduled for tomorrow between 10 AM and 2 PM. Our driver will call you 30 minutes before arrival.',
          sender: 'user',
          timestamp: '10:35 AM',
          status: 'read'
        }
      ];
      break;
    case 'Pharmacy':
      typeSpecificMessages = [
        {
          id: '3',
          text: 'Is my prescription ready?',
          sender: 'other',
          timestamp: '2:15 PM'
        },
        {
          id: '4',
          text: 'Yes, your prescription is ready for pickup at our Main Street location.',
          sender: 'user',
          timestamp: '2:20 PM',
          status: 'read'
        },
        {
          id: '5',
          text: 'Thank you! I\'ll be there in an hour.',
          sender: 'other',
          timestamp: '2:22 PM'
        },
        {
          id: '6',
          text: 'Great! We\'ll keep it at the counter for you.',
          sender: 'user',
          timestamp: '2:25 PM',
          status: 'delivered'
        }
      ];
      break;
    case 'Ride':
      typeSpecificMessages = [
        {
          id: '3',
          text: 'I\'m at the airport. Where should I meet you?',
          sender: 'other',
          timestamp: '3:45 PM'
        },
        {
          id: '4',
          text: 'I\'ve arrived at your location. I\'m in a blue Toyota Corolla, license plate XYZ123.',
          sender: 'user',
          timestamp: '3:50 PM',
          status: 'read'
        },
        {
          id: '5',
          text: 'I\'m coming out now. I\'m wearing a red jacket.',
          sender: 'other',
          timestamp: '3:52 PM'
        }
      ];
      break;
    default:
      typeSpecificMessages = [
        {
          id: '3',
          text: 'Do you have any questions about your order?',
          sender: 'user',
          timestamp: '11:00 AM',
          status: 'delivered'
        }
      ];
  }

  return [...commonMessages, ...typeSpecificMessages];
};

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, type, orderId } = params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  // Load mock messages on component mount
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMessages(generateMockMessages(type as string));
      setLoading(false);
    }, 1000);
  }, [type]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'other',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser 
            ? [styles.userBubble, { backgroundColor: theme.colors.primary }] 
            : [styles.otherBubble, { backgroundColor: theme.colors.surfaceVariant }]
        ]}>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.messageText,
              isUser ? { color: 'white' } : { color: theme.colors.onSurface }
            ]}
          >
            {item.text}
          </Text>
        </View>
        
        <View style={styles.messageFooter}>
          <Text 
            variant="bodySmall" 
            style={styles.timestamp}
          >
            {item.timestamp}
          </Text>
          
          {isUser && item.status && (
            <View style={styles.statusContainer}>
              {item.status === 'sent' && (
                <MaterialCommunityIcons name="check" size={14} color="#757575" />
              )}
              {item.status === 'delivered' && (
                <MaterialCommunityIcons name="check-all" size={14} color="#757575" />
              )}
              {item.status === 'read' && (
                <MaterialCommunityIcons name="check-all" size={14} color={theme.colors.primary} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.customHeader}>
          <View style={styles.headerLeftSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.colors.onSurface} 
              />
            </TouchableOpacity>
            
            <View style={styles.headerContainer}>
              <View style={[
                styles.avatarPlaceholder, 
                { backgroundColor: theme.colors.primaryContainer }
              ]}>
                <MaterialCommunityIcons
                  name={
                    type === 'Furniture' ? 'sofa' :
                    type === 'Pharmacy' ? 'pill' :
                    type === 'Ride' ? 'car' :
                    type === 'Restaurant' ? 'food' :
                    type === 'Grocery' ? 'cart' :
                    type === 'Car Rental' ? 'car-key' :
                    type === 'Textiles' ? 'hanger' : 'chat'
                  }
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View>
                <Text 
                  variant="titleSmall" 
                  style={styles.headerTitle}
                >
                  {name as string}
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={styles.headerSubtitle}
                >
                  {type as string} • Order #{(orderId as string).split('-').pop()}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              router.push(`/order-details?id=${orderId}`);
            }}
          >
            <MaterialCommunityIcons 
              name="clipboard-text" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
      
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
          
          <Divider />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface
              }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { backgroundColor: theme.colors.primary }
              ]}
              onPress={sendMessage}
              disabled={newMessage.trim() === ''}
            >
              <MaterialCommunityIcons name="send" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#757575',
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  statusContainer: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 