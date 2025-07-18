import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

interface ImageWithFallbackProps {
  source: { uri: string } | null;
  fallbackSource?: { uri: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  accessibilityLabel?: string;
  loadingIndicatorSize?: 'small' | 'large';
  loadingIndicatorColor?: string;
  errorIconSize?: number;
  errorIconColor?: string;
  testID?: string;
}

/**
 * Image component with loading state and fallback handling
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  fallbackSource,
  style,
  resizeMode = 'cover',
  accessibilityLabel = 'image',
  loadingIndicatorSize = 'small',
  loadingIndicatorColor = theme.colors.primary,
  errorIconSize = 32,
  errorIconColor = theme.colors.text.light,
  testID = 'image-with-fallback',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Default fallback image if none provided
  const defaultFallback = { uri: 'https://via.placeholder.com/300x200?text=No+Image' };
  
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };
  
  const handleLoadEnd = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <View style={[{ position: 'relative', overflow: 'hidden' }, style]}>
      {source && !hasError && (
        <Image
          source={source}
          style={[{ width: '100%', height: '100%' }, style]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
        />
      )}
      
      {hasError && (
        <Image
          source={fallbackSource || defaultFallback}
          style={[{ width: '100%', height: '100%' }, style]}
          resizeMode={resizeMode}
          accessible={true}
          accessibilityLabel={`${accessibilityLabel} fallback`}
          testID={`${testID}-fallback`}
        />
      )}
      
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}>
          <ActivityIndicator 
            size={loadingIndicatorSize} 
            color={loadingIndicatorColor} 
            testID={`${testID}-loading`}
          />
        </View>
      )}
      
      {hasError && !fallbackSource && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons 
            name="image-outline" 
            size={errorIconSize} 
            color={errorIconColor} 
            testID={`${testID}-error-icon`}
          />
        </View>
      )}
    </View>
  );
};

export default ImageWithFallback;
