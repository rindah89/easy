import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';

// Import custom components
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';

// Import mock data
import { mockDrivers } from '../data/rideData';

// Define message interface
interface Message {
  id: string;
  text: string;
  sender: 'driver' | 'user';
  timestamp: Date;
}

export default function RideChat() {
  const theme = useTheme();
  const [messageText, setMessageText] = useState('');
  
  // Get a random driver for demo purposes
  const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
  
  // Mock messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello, I am on my way to pick you up!',
      sender: 'driver',
      timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
    },
    {
      id: '2',
      text: 'Great! I\'m waiting at the entrance.',
      sender: 'user',
      timestamp: new Date(Date.now() - 4 * 60000) // 4 minutes ago
    },
    {
      id: '3',
      text: 'I\'m in a black Toyota Camry. I\'ll be there in about 3 minutes.',
      sender: 'driver',
      timestamp: new Date(Date.now() - 3 * 60000) // 3 minutes ago
    },
    {
      id: '4',
      text: 'Okay, I\'ll look out for your car. I\'m wearing a blue jacket.',
      sender: 'user',
      timestamp: new Date(Date.now() - 2 * 60000) // 2 minutes ago
    }
  ]);
  
  // Format timestamp to display time
  const formatTimestamp = (timestamp: Date) => {
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessageText('');
    
    // Simulate driver reply after a short delay
    setTimeout(() => {
      const driverReplies = [
        "I'll be there shortly!",
        "Thanks for the update.",
        "No problem, see you soon!",
        "I'm just around the corner.",
        "Traffic is good, I'll be there in a minute."
      ];
      
      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      
      const driverReply: Message = {
        id: (Date.now() + 1).toString(),
        text: randomReply,
        sender: 'driver',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, driverReply]);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.driverInfoContainer}>
          <Image 
            source={{ uri: driver.photoUrl }} 
            style={styles.driverAvatar} 
          />
          <View style={styles.driverTextInfo}>
            <Text variant="titleMedium">{driver.name}</Text>
            <Text variant="bodySmall" style={styles.vehicleText}>
              {driver.vehicle}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Divider />
      
      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        inverted={false}
        renderItem={({ item }) => (
          <View 
            style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userMessage : styles.driverMessage
            ]}
          >
            <Text variant="bodyMedium" style={styles.messageText}>
              {item.text}
            </Text>
            <Text variant="bodySmall" style={styles.messageTime}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        )}
      />
      
      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              messageText.trim() === '' && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={messageText.trim() === ''}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  driverInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  driverTextInfo: {
    justifyContent: 'center',
  },
  vehicleText: {
    opacity: 0.7,
  },
  callButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6f7ff',
    borderBottomRightRadius: 4,
  },
  driverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#000',
  },
  messageTime: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2e8b57',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 