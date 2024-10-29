import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Login from './Components/Login/Login';
import Home from './Components/Home/Home';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddInvoice from './Components/Home/AddInvoice';



function App() {
  const Stack = createStackNavigator();
  const [navPage, setNavPage] = useState(null);
  const logo = require("./assets/logo.png");
  const loader = require('./assets/loader.gif');

  const checkLogin = async () => {
    const username = await AsyncStorage.getItem('email');
    if (username) {
      setNavPage('Home')
    }
    else {
      setNavPage('Login')
    }
  }

  useEffect(() => {
    checkLogin()
  }, []);

  if (!navPage) {
    return (
      <View style={{ flex:1, backgroundColor:"black", justifyContent:"center", alignItems:"center"}}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Image source={loader} style={{ height:300, width:300 }} />
      </View>
    )
  }
  else {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={navPage}>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        </Stack.Navigator>

      </NavigationContainer>
    );
  }




}

export default App;