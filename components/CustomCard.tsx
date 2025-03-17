import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, StyleProp, ViewStyle, ImageStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

interface CardCoverProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardActionsProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style, onPress }: CardProps) {
  const theme = useTheme();
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </CardComponent>
  );
}

Card.Cover = function CardCover({ source, style }: CardCoverProps) {
  return (
    <Image
      source={source}
      style={[styles.cover, style]}
      resizeMode="cover"
    />
  );
};

Card.Content = function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

Card.Actions = function CardActions({ children, style }: CardActionsProps) {
  return (
    <View style={[styles.actions, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cover: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
  },
}); 