import React, { useState } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, Text as RNText, TouchableOpacity, ViewStyle, Modal, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextVariant } from './CustomText';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: FieldError;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  labelVariant?: TextVariant;
  errorVariant?: TextVariant;
}

// New interface for SimpleFormInput that doesn't require react-hook-form
interface SimpleFormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  labelVariant?: TextVariant;
  errorVariant?: TextVariant;
  errorText?: string;
  containerStyle?: ViewStyle;
}

// Interface for FormDropdown component
interface FormDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ label: string; value: string; color?: string }>;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder?: string;
  errorText?: string;
  labelVariant?: TextVariant;
  errorVariant?: TextVariant;
  containerStyle?: ViewStyle;
  isColorPicker?: boolean;
}

// Interface for QuantitySelector component
interface QuantitySelectorProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  errorText?: string;
  labelVariant?: TextVariant;
  errorVariant?: TextVariant;
  containerStyle?: ViewStyle;
}

// Interface for ColorGridSelector component
interface ColorGridSelectorProps {
  label: string;
  colors: Array<{ label: string; value: string; color: string; quantity?: number }>;
  selectedColors: Array<{ value: string; quantity: number }>;
  onSelectionChange: (selectedColors: Array<{ value: string; quantity: number }>) => void;
  labelVariant?: TextVariant;
  containerStyle?: ViewStyle;
}

// Get font weight based on variant
const getFontWeight = (variant: TextVariant) => {
  switch (variant) {
    case 'regular':
      return '400';
    case 'medium':
    case 'bodyMedium':
    case 'labelMedium':
    case 'titleMedium':
    case 'headlineMedium':
    case 'displayMedium':
      return '500';
    case 'bold':
    case 'titleLarge':
    case 'headlineLarge':
    case 'displayLarge':
      return '700';
    case 'heavy':
      return '900';
    case 'bodySmall':
    case 'labelSmall':
    case 'titleSmall':
    case 'headlineSmall':
    case 'displaySmall':
      return '400';
    case 'bodyLarge':
    case 'labelLarge':
      return '500';
    default:
      return '400';
  }
};

// Get font size based on variant
const getFontSize = (variant: TextVariant) => {
  switch (variant) {
    case 'titleLarge':
      return 24;
    case 'titleMedium':
      return 20;
    case 'titleSmall':
      return 16;
    case 'bodyLarge':
      return 16;
    case 'bodyMedium':
      return 14;
    case 'bodySmall':
      return 12;
    case 'labelLarge':
      return 16;
    case 'labelMedium':
      return 14;
    case 'labelSmall':
      return 12;
    case 'headlineLarge':
      return 32;
    case 'headlineMedium':
      return 28;
    case 'headlineSmall':
      return 24;
    case 'displayLarge':
      return 48;
    case 'displayMedium':
      return 40;
    case 'displaySmall':
      return 36;
    case 'bold':
      return 18;
    case 'medium':
      return 16;
    case 'heavy':
      return 20;
    case 'regular':
    default:
      return 14;
  }
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  icon,
  labelVariant = 'medium',
  errorVariant = 'regular',
}: FormInputProps<T>) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <RNText 
        style={[
          styles.label, 
          { 
            color: error ? theme.colors.error : theme.colors.onSurface,
            fontWeight: getFontWeight(labelVariant),
            fontSize: getFontSize(labelVariant)
          }
        ]}
      >
        {label}
      </RNText>
      
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[
            styles.inputContainer, 
            { 
              borderColor: error 
                ? theme.colors.error 
                : isFocused 
                  ? theme.colors.primary 
                  : theme.colors.outline 
            }
          ]}>
            {icon && (
              <MaterialCommunityIcons 
                name={icon} 
                size={20} 
                color={error ? theme.colors.error : theme.colors.onSurfaceVariant} 
                style={styles.icon} 
              />
            )}
            
            <RNTextInput
              style={[
                styles.input, 
                { color: theme.colors.onSurface }
              ]}
              value={value as string}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : 1}
            />
            
            {secureTextEntry && (
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
                <MaterialCommunityIcons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      
      {error && (
        <RNText 
          style={[
            styles.errorText, 
            { 
              color: theme.colors.error,
              fontWeight: getFontWeight(errorVariant),
              fontSize: getFontSize(errorVariant)
            }
          ]}
        >
          {error.message}
        </RNText>
      )}
    </View>
  );
}

// New SimpleFormInput component that doesn't require react-hook-form
export function SimpleFormInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  icon,
  labelVariant = 'medium',
  errorVariant = 'regular',
  errorText,
  containerStyle,
}: SimpleFormInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <RNText 
        style={[
          styles.label, 
          { 
            color: errorText ? theme.colors.error : theme.colors.onSurface,
            fontWeight: getFontWeight(labelVariant),
            fontSize: getFontSize(labelVariant)
          }
        ]}
      >
        {label}
      </RNText>
      
      <View style={[
        styles.inputContainer, 
        { 
          borderColor: errorText 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.outline 
        }
      ]}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={errorText ? theme.colors.error : theme.colors.onSurfaceVariant} 
            style={styles.icon} 
          />
        )}
        
        <RNTextInput
          style={[
            styles.input, 
            { color: theme.colors.onSurface }
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
            <MaterialCommunityIcons 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={theme.colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {errorText && (
        <RNText 
          style={[
            styles.errorText, 
            { 
              color: theme.colors.error,
              fontWeight: getFontWeight(errorVariant),
              fontSize: getFontSize(errorVariant)
            }
          ]}
        >
          {errorText}
        </RNText>
      )}
    </View>
  );
}

// Custom dropdown component
export function FormDropdown({
  label,
  value,
  onValueChange,
  items,
  icon,
  placeholder = 'Select an option',
  errorText,
  labelVariant = 'medium',
  errorVariant = 'regular',
  containerStyle,
  isColorPicker = false,
}: FormDropdownProps) {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Find the selected item label
  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem ? selectedItem.label : placeholder;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <RNText 
        style={[
          styles.label, 
          { 
            color: errorText ? theme.colors.error : theme.colors.onSurface,
            fontWeight: getFontWeight(labelVariant),
            fontSize: getFontSize(labelVariant)
          }
        ]}
      >
        {label}
      </RNText>
      
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.inputContainer,
          { 
            borderColor: errorText 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.outline 
          }
        ]}
      >
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={errorText ? theme.colors.error : theme.colors.onSurfaceVariant}
            style={styles.icon} 
          />
        )}
        
        <View style={styles.selectedValueContainer}>
          {isColorPicker && selectedItem?.color && (
            <View 
              style={[
                styles.colorCircle, 
                { 
                  backgroundColor: selectedItem.color,
                  marginRight: 8,
                }
              ]} 
            />
          )}
          
          <RNText 
            style={[
              styles.input,
              { 
                color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant
              }
            ]}
            numberOfLines={1}
          >
            {displayText}
          </RNText>
        </View>
        
        <MaterialCommunityIcons 
          name="chevron-down" 
          size={20} 
          color={theme.colors.onSurfaceVariant}
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      
      {errorText && (
        <RNText 
          style={[
            styles.errorText, 
            { 
              color: theme.colors.error,
              fontWeight: getFontWeight(errorVariant),
              fontSize: getFontSize(errorVariant)
            }
          ]}
        >
          {errorText}
        </RNText>
      )}
      
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface }
            ]}
          >
            <View style={styles.modalHeader}>
              <RNText 
                style={[
                  styles.modalTitle,
                  { color: theme.colors.onSurface }
                ]}
              >
                {label}
              </RNText>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
            
            {isColorPicker ? (
              <View style={styles.colorGridContainer}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.colorGridItem,
                      value === item.value && styles.selectedColorBorder
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsModalVisible(false);
                    }}
                  >
                    <View 
                      style={[
                        styles.colorCircleLarge, 
                        { backgroundColor: item.color || '#CCCCCC' }
                      ]} 
                    />
                    <RNText style={styles.colorLabel}>{item.label}</RNText>
                    {value === item.value && (
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={22} 
                        color={theme.colors.primary}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      value === item.value && { 
                        backgroundColor: theme.colors.primaryContainer
                      }
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsModalVisible(false);
                    }}
                  >
                    <RNText 
                      style={[
                        styles.dropdownItemText,
                        { color: theme.colors.onSurface },
                        value === item.value && { 
                          color: theme.colors.primary,
                          fontWeight: 'bold'
                        }
                      ]}
                    >
                      {item.label}
                    </RNText>
                    {value === item.value && (
                      <MaterialCommunityIcons 
                        name="check" 
                        size={20} 
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Custom quantity selector with plus/minus buttons
export function QuantitySelector({
  label,
  value,
  onValueChange,
  min = 1,
  max = 999,
  step = 1,
  icon,
  errorText,
  labelVariant = 'medium',
  errorVariant = 'regular',
  containerStyle,
}: QuantitySelectorProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const increment = () => {
    if (value + step <= max) {
      onValueChange(value + step);
    }
  };
  
  const decrement = () => {
    if (value - step >= min) {
      onValueChange(value - step);
    }
  };
  
  const handleTextChange = (text: string) => {
    const newValue = parseInt(text);
    if (!isNaN(newValue)) {
      if (newValue >= min && newValue <= max) {
        onValueChange(newValue);
      } else if (newValue < min) {
        onValueChange(min);
      } else if (newValue > max) {
        onValueChange(max);
      }
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.quantityLabelRow}>
        <RNText 
          style={[
            styles.label, 
            { 
              color: errorText ? theme.colors.error : theme.colors.onSurface,
              fontWeight: getFontWeight(labelVariant),
              fontSize: getFontSize(labelVariant)
            }
          ]}
        >
          {label}
        </RNText>
        
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={errorText ? theme.colors.error : theme.colors.onSurfaceVariant}
            style={styles.quantityIcon} 
          />
        )}
      </View>
      
      <View style={styles.quantityControlsRow}>
        <TouchableOpacity
          onPress={decrement}
          style={[
            styles.quantityButton,
            { 
              backgroundColor: theme.colors.primary + '10',
              opacity: value <= min ? 0.4 : 1,
              borderColor: theme.colors.outline + '30',
              borderWidth: 1
            }
          ]}
          disabled={value <= min}
        >
          <MaterialCommunityIcons 
            name="minus" 
            size={18} 
            color={value <= min ? theme.colors.onSurfaceVariant : theme.colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={[
          styles.quantityInputContainer,
          {
            borderColor: errorText 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.outline + '50',
          }
        ]}>
          <RNTextInput
            style={[
              styles.quantityInput, 
              { 
                color: theme.colors.onSurface,
              }
            ]}
            value={value.toString()}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            textAlign="center"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        
        <TouchableOpacity
          onPress={increment}
          style={[
            styles.quantityButton,
            { 
              backgroundColor: theme.colors.primary + '10',
              opacity: value >= max ? 0.4 : 1,
              borderColor: theme.colors.outline + '30',
              borderWidth: 1
            }
          ]}
          disabled={value >= max}
        >
          <MaterialCommunityIcons 
            name="plus" 
            size={18} 
            color={value >= max ? theme.colors.onSurfaceVariant : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {errorText && (
        <RNText 
          style={[
            styles.errorText, 
            { 
              color: theme.colors.error,
              fontWeight: getFontWeight(errorVariant),
              fontSize: getFontSize(errorVariant)
            }
          ]}
        >
          {errorText}
        </RNText>
      )}
    </View>
  );
}

// Color Grid Selector component
export function ColorGridSelector({
  label,
  colors,
  selectedColors,
  onSelectionChange,
  labelVariant = 'medium',
  containerStyle,
}: ColorGridSelectorProps) {
  const theme = useTheme();
  
  const isSelected = (colorValue: string) => {
    return selectedColors.some(item => item.value === colorValue);
  };
  
  const getQuantity = (colorValue: string) => {
    const found = selectedColors.find(item => item.value === colorValue);
    return found ? found.quantity : 0;
  };
  
  const toggleColor = (colorValue: string) => {
    let newSelectedColors = [...selectedColors];
    
    // If color is already selected, remove it
    if (isSelected(colorValue)) {
      newSelectedColors = newSelectedColors.filter(item => item.value !== colorValue);
    } else {
      // Add color with default quantity 1
      newSelectedColors.push({ value: colorValue, quantity: 1 });
    }
    
    onSelectionChange(newSelectedColors);
  };
  
  const updateQuantity = (colorValue: string, quantity: number) => {
    // Don't allow quantity less than 1
    if (quantity < 1) return;
    
    let newSelectedColors = [...selectedColors];
    const index = newSelectedColors.findIndex(item => item.value === colorValue);
    
    if (index !== -1) {
      newSelectedColors[index] = { ...newSelectedColors[index], quantity };
      onSelectionChange(newSelectedColors);
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <RNText 
        style={[
          styles.label, 
          { 
            color: theme.colors.onSurface,
            fontWeight: getFontWeight(labelVariant),
            fontSize: getFontSize(labelVariant)
          }
        ]}
      >
        {label}
      </RNText>
      
      <View style={styles.colorSelectionContainer}>
        {colors.map((color) => (
          <View key={color.value} style={styles.colorItemContainer}>
            <TouchableOpacity
              style={[
                styles.colorSelectorItem,
                isSelected(color.value) && [
                  styles.colorSelectorItemSelected,
                  { borderColor: theme.colors.primary }
                ]
              ]}
              onPress={() => toggleColor(color.value)}
            >
              <View 
                style={[
                  styles.colorCircleLarge, 
                  { backgroundColor: color.color || '#CCCCCC' }
                ]} 
              />
              <RNText 
                style={[
                  styles.colorLabel,
                  isSelected(color.value) && { fontWeight: '600', color: theme.colors.primary }
                ]}
              >
                {color.label}
              </RNText>
              
              {isSelected(color.value) && (
                <View style={[
                  styles.colorSelectedBadge,
                  { backgroundColor: theme.colors.primary }
                ]}>
                  <MaterialCommunityIcons 
                    name="check" 
                    size={16} 
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
            
            {isSelected(color.value) && (
              <View style={[
                styles.colorQuantityContainer,
                { backgroundColor: theme.colors.primaryContainer }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.colorQuantityButton,
                    { backgroundColor: theme.colors.surface }
                  ]}
                  onPress={() => updateQuantity(color.value, getQuantity(color.value) - 1)}
                >
                  <MaterialCommunityIcons 
                    name="minus" 
                    size={14} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
                
                <RNText style={[
                  styles.colorQuantityText,
                  { color: theme.colors.onPrimaryContainer }
                ]}>
                  {getQuantity(color.value)}
                </RNText>
                
                <TouchableOpacity
                  style={[
                    styles.colorQuantityButton,
                    { backgroundColor: theme.colors.surface }
                  ]}
                  onPress={() => updateQuantity(color.value, getQuantity(color.value) + 1)}
                >
                  <MaterialCommunityIcons 
                    name="plus" 
                    size={14} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  quantityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityIcon: {
    marginLeft: 8,
  },
  quantityControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInputContainer: {
    borderWidth: 1,
    borderRadius: 6,
    height: 42,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityInput: {
    height: 42,
    width: '100%',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  selectedValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  colorGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  colorGridItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  selectedColorBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  colorCircleLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 12,
  },
  colorItemContainer: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  colorSelectorItem: {
    width: '100%',
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  colorSelectorItemSelected: {
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  colorSelectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'green',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
  },
  colorQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    padding: 4,
    elevation: 1,
  },
  colorQuantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  colorQuantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
}); 