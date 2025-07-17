import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestoreInstance } from '../hooks/useFirestoreInstance';
import { getAuth } from 'firebase/auth';
import { City, useUserCity } from '../hooks/useCities';

interface CitySwitcherProps {
  onCityChange?: (cityId: string) => void;
  compact?: boolean;
}

const CitySwitcher: React.FC<CitySwitcherProps> = ({ onCityChange, compact = false }) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { currentCity, cities, loading, error } = useUserCity();
  const [firestore] = useFirestoreInstance();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleCitySelect = async (city: City) => {
    if (!firestore) return;
    
    try {
      // If user is logged in, update their city preference in their profile
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, {
          cityId: city.id,
          lastCityChangeAt: new Date()
        });
      }
      
      // Call the onCityChange callback if provided
      if (onCityChange) {
        onCityChange(city.id);
      }
      
      setIsModalVisible(false);
    } catch (err) {
      console.error('Error updating user city:', err);
      Alert.alert(
        t('citySwitcher.errorTitle'),
        t('citySwitcher.errorMessage'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const renderCityItem = ({ item }: { item: City }) => {
    const isSelected = currentCity?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.cityItem,
          isSelected && styles.selectedCityItem
        ]}
        onPress={() => handleCitySelect(item)}
        disabled={isSelected}
      >
        <View style={styles.cityInfo}>
          <Text style={[
            styles.cityName,
            isSelected && styles.selectedCityName
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.cityCountry,
            isSelected && styles.selectedCityCountry
          ]}>
            {item.country}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
        )}
        
        {!item.isActive && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>
              {t('citySwitcher.comingSoon')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  }

  if (error || !currentCity) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => window.location.reload()}
        >
          <Ionicons name="alert-circle-outline" size={compact ? 16 : 20} color="#FF5722" />
          <Text style={styles.errorText}>{t('citySwitcher.error')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={compact ? styles.compactContainer : styles.container}
        onPress={() => setIsModalVisible(true)}
      >
        {compact ? (
          <View style={styles.compactContent}>
            <Text style={styles.compactCityName}>{currentCity.name}</Text>
            <Ionicons name="chevron-down" size={16} color="#666666" />
          </View>
        ) : (
          <>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>{currentCity.name}</Text>
            </View>
            <Text style={styles.switchText}>{t('citySwitcher.switchCity')}</Text>
          </>
        )}
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citySwitcher.selectCity')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={cities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cityList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyText}>{t('citySwitcher.noCities')}</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 4,
  },
  cityBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cityBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  switchText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF5722',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  cityList: {
    padding: 16,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedCityItem: {
    backgroundColor: '#E3F2FD',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  selectedCityName: {
    color: '#2196F3',
  },
  cityCountry: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCityCountry: {
    color: '#2196F3',
  },
  comingSoonBadge: {
    backgroundColor: '#FFF9C4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#FFA000',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default CitySwitcher;
