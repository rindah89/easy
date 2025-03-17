import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface LanguageButtonProps {
  style?: object;
}

const LanguageButton: React.FC<LanguageButtonProps> = ({ style }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { language } = useLanguage();

  const openLanguageSelector = () => {
    setIsModalVisible(true);
  };

  const closeLanguageSelector = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={openLanguageSelector}
      >
        <FontAwesome name="language" size={18} color="#007AFF" />
        <Text style={styles.text}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <LanguageSelector
        isVisible={isModalVisible}
        onClose={closeLanguageSelector}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  text: {
    marginLeft: 5,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default LanguageButton; 