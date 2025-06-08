import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import UdhariHome from './UdhariHome';
import AddUdhari from './AddUdhari';
import ListAllUdhaar from './ListAllUdhaar';
import EditUdhari from './EditUdhari';



const UdhariNav = () => {
  const UdhariStack = createStackNavigator();

  return (
   <UdhariStack.Navigator>
      <UdhariStack.Screen name="UdhariHome" component={UdhariHome} options={{ headerShown: false }} />
      <UdhariStack.Screen name="AddUdhari" component={AddUdhari} options={{ headerShown: false }} />
      <UdhariStack.Screen name="ListAllUdhaar" component={ListAllUdhaar} options={{ headerShown: false }} />
      <UdhariStack.Screen name="EditUdhari" component={EditUdhari} options={{ headerShown: false }} />
    </UdhariStack.Navigator>
  )
}

export default UdhariNav