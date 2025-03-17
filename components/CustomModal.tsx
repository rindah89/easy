import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal as RNModal, 
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { Text } from './CustomText';
import { useTheme } from 'react-native-paper';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

interface ModalTitleProps {
  children: React.ReactNode;
}

interface ModalContentProps {
  children: React.ReactNode;
}

interface ModalActionsProps {
  children: React.ReactNode;
}

export function Modal({ visible, onDismiss, children }: ModalProps) {
  const theme = useTheme();
  
  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

Modal.Title = function ModalTitle({ children }: ModalTitleProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.titleContainer}>
      <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
        {children}
      </Text>
    </View>
  );
};

Modal.Content = function ModalContent({ children }: ModalContentProps) {
  return (
    <View style={styles.content}>
      {children}
    </View>
  );
};

Modal.Actions = function ModalActions({ children }: ModalActionsProps) {
  return (
    <View style={styles.actions}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  container: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 480,
    minWidth: 280,
    padding: 0,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    paddingHorizontal: 16,
  },
}); 