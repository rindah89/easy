import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const { language, changeLanguage, availableLanguages } = useLanguage();

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('common.selectLanguage')}</Text>
          
          {Object.entries(availableLanguages).map(([code, langInfo]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.languageOption,
                language === code && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange(code)}
            >
              <Text
                style={[
                  styles.languageText,
                  language === code && styles.selectedLanguageText,
                ]}
              >
                {langInfo.label}
              </Text>
              {language === code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0f0',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LanguageSelector; 