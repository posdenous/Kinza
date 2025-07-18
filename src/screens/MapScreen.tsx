import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Animated } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import theme from '../styles/theme';

import useMapEvents from '../hooks/useMapEvents';
import MapEventMarker from '../components/MapEventMarker';
import MapFilters from '../components/MapFilters';
import { Event, EventFilter } from '../types/events';
import useUserRole from '../hooks/useUserRole';

type RootStackParamList = {
  Map: undefined;
  EventDetail: { eventId: string };
};

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

/**
 * Map screen component showing events on a map with filtering options
 */
const MapScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { userRole, cityId } = useUserRole();
  const mapRef = useRef<MapView>(null);
  
  // State for map and location
  const [region, setRegion] = useState<Region>({
    latitude: 52.52,
    longitude: 13.405,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  
  // State for events and filters
  const [filters, setFilters] = useState<EventFilter>({});
  const { events, loading: eventsLoading, error: eventsError } = useMapEvents({
    cityId: cityId || 'berlin',
    filters,
    center: region ? { latitude: region.latitude, longitude: region.longitude } : undefined,
    radius: 10, // 10km radius
  });

  // Request location permission and get current location
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          setLocationPermissionGranted(true);
          
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          
          // Animate map to user location
          mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    getLocationPermission();
  }, []);

  // Handle region change on map
  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: EventFilter) => {
    setFilters(newFilters);
  };

  // Handle event marker press
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  // Center map on user location
  const centerOnUserLocation = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  return (
    <View style={styles.container}>
      {locationLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('map.loadingLocation')}</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            onRegionChangeComplete={handleRegionChange}
            showsUserLocation={locationPermissionGranted}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
          >
            {events.map((event) => (
              <MapEventMarker
                key={event.id}
                event={event}
                onPress={handleEventPress}
              />
            ))}
          </MapView>
          
          {/* Map Filters */}
          <MapFilters
            onApplyFilters={handleApplyFilters}
            initialFilters={filters}
          />
          
          {/* My Location Button */}
          {locationPermissionGranted && (
            <TouchableOpacity
              style={styles.myLocationButton}
              onPress={centerOnUserLocation}
            >
              <Ionicons name="locate" size={24} color={theme.colors.secondary} aria-label="Center on my location" />
            </TouchableOpacity>
          )}
          
          {/* Events Loading Indicator */}
          {eventsLoading && (
            <View style={styles.eventsLoadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.eventsLoadingText}>{t('map.loadingEvents')}</Text>
            </View>
          )}
          
          {/* Events Error Message */}
          {eventsError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{eventsError}</Text>
            </View>
          )}
          
          {/* Events Count */}
          <View style={styles.eventsCountContainer}>
            <Text style={styles.eventsCountText}>
              {t('map.eventsFound', { count: events.length })}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.colors.gradients.map[0], // Use the first color from the map gradient
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.dark,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: theme.borders.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  eventsLoadingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borders.radius.xl,
    padding: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.layout.touchableMinHeight,
    ...theme.shadows.sm,
  },
  eventsLoadingText: {
    marginLeft: theme.spacing[2],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  eventsCountContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borders.radius.xl,
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    ...theme.shadows.sm,
  },
  eventsCountText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.dark,
  },
});

export default MapScreen;
