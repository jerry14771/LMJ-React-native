import React, { useState, useEffect } from 'react';
import { View, Text, Image, StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Login from './Components/Login/Login';
import Home from './Components/Common/Home';
import PinAuth from './Components/Login/PinAuth';
import Toast from 'react-native-toast-message';

function App() {
  const Stack = createStackNavigator();
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

  useEffect(() => {
    if (isBiometricEnabled) {
      authenticateBiometric();
    }
  }, [isBiometricEnabled]);

  if (!navPage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Image source={require('./assets/logo.png')} style={{ height: 300, width: 300 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={navPage}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="PinAuth" component={PinAuth} options={{ headerShown: true, title: 'Authenticate with PIN' }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

export default App;
