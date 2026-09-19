import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Login from './Components/Login/Login';
import Home from './Components/Common/Home';
import PinAuth from './Components/Login/PinAuth';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import C from './colorConfig';
import {
  registerForegroundHandler,
  registerNotificationOpenedHandlers,
} from './Components/Common/notificationService';


function App() {
  const Stack = createStackNavigator();
  const navigationRef = useRef(null);
  const [navPage, setNavPage] = useState(null); 
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false); 

  const checkLogin = async () => {
    const username = await AsyncStorage.getItem('email');
    if (username) {
      setIsBiometricEnabled(true);
    } else {
      setNavPage('Login'); 
    }
  };

  const authenticateBiometric = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  
    if (!available) {
      // No biometric sensor available, navigate directly to PIN authentication
      setNavPage('PinAuth');
      return;
    }
  
    try {
      const result = await rnBiometrics.simplePrompt({
        promptMessage: `Authenticate with ${biometryType === 'FaceID' ? 'Face ID' : 'Fingerprint'}`,
        cancelButtonText: 'Use PIN Instead', // Triggers cancellation when pressed
      });
  
      if (result.success) {
        setNavPage('Home'); // Biometric authentication succeeded
      } else {
        setNavPage('PinAuth'); // Switch to PIN authentication on failure
      }
    } catch (error) {
      if (error === 'UserCanceled' || error === 'UserFallback') {
        // User opted to cancel biometric or fallback to PIN
        setNavPage('PinAuth');
      } else {
        // Handle unexpected errors gracefully
        Alert.alert('Authentication Error', 'An error occurred. Please try again.');
      }
    }
  };
  

  useEffect(() => {
    checkLogin();
  }, []);

  // Push notifications: foreground display + tap-to-open-invoice deep link.
  // If the user taps a notification while the app is in the background, send
  // them to the Home drawer first, then into the invoice's detail screen.
  useEffect(() => {
    const openInvoice = ({ invoiceId, invoice_number } = {}) => {
      navigationRef.current?.navigate('InvoiceNav', {
        screen: 'InvoiceDetail',
        params: { invoiceid: invoiceId, source: 'PushNotification' },
      });
    };

    const unsubscribeForeground = registerForegroundHandler(openInvoice);
    registerNotificationOpenedHandlers(openInvoice);

    return unsubscribeForeground;
  }, []);

  useEffect(() => {
    if (isBiometricEnabled) {
      authenticateBiometric();
    }
  }, [isBiometricEnabled]);

  if (!navPage) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
                <LottieView
                  source={require('./assets/Coin purse.json')}
                  autoPlay loop
                  style={{ width: 140, height: 140 }}
                />
                <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Loading LMJ</Text>
              </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={navPage}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="PinAuth" component={PinAuth} options={{ headerShown: false, title: 'Authenticate with PIN' }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

export default App;
