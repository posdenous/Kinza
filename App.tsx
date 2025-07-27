import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/i18n';

// Import custom components
import CustomTabBar from './src/components/CustomTabBar';

// Import screens
import PrivacyScreen from './src/screens/PrivacyScreen';
import TrustScreen from './src/screens/TrustScreen';
import { EnhancedSearchScreen } from './src/screens/EnhancedSearchScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import OrganiserDashboardScreen from './src/screens/OrganiserDashboardScreen';
import ReportReviewScreen from './src/screens/ReportReviewScreen';
import ScreenshotDemoScreen from './src/screens/ScreenshotDemoScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "kinza-berlin.firebaseapp.com",
  projectId: "kinza-berlin",
  storageBucket: "kinza-berlin.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create navigation stacks and tabs
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen 
        name="Search" 
        component={(props: any) => <EnhancedSearchScreen {...props} cityId="berlin" />} 
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// Home stack navigator
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={PlaceholderScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="EventDetail" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

// Profile stack navigator
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Trust" component={TrustScreen} />
      <Stack.Screen name="Screenshots" component={ScreenshotDemoScreen} options={{ title: 'Save Screenshots' }} />
    </Stack.Navigator>
  );
}

// Admin stack navigator
function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ReportReview" component={ReportReviewScreen} />
      <Stack.Screen name="ModerationQueue" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

// Organiser stack navigator
function OrganiserStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrganiserDashboard" component={OrganiserDashboardScreen} />
      <Stack.Screen name="SubmitEvent" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

// Placeholder component for screens we haven't implemented yet
function PlaceholderScreen({ route }: { route?: any }) {
  const screenName = route?.name || 'Screen';
  const testId = screenName.toLowerCase().replace('screen', '') + '-screen';
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }} testID={testId}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Welcome to {screenName}</Text>
      <Text style={{ textAlign: 'center', color: '#666' }}>This screen is under development</Text>
    </View>
  );
}

// Root navigation container
export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Admin" component={AdminStack} options={{ headerShown: false }} />
            <Stack.Screen name="Organiser" component={OrganiserStack} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
