import React from 'react'
import BandhakHome from './BandhakHome';
import { createStackNavigator } from '@react-navigation/stack';
import AddBandhak from './AddBandhak';
import ListAllBandak from './ListAllBandak';

const BandhakNav = () => {
  const BandhakStack = createStackNavigator();

  return (
    <BandhakStack.Navigator>
      <BandhakStack.Screen name="BandhakHome" component={BandhakHome} options={{ headerShown: false }} />
      <BandhakStack.Screen name="AddBandhak" component={AddBandhak} options={{ headerShown: false }} />
      <BandhakStack.Screen name="ListAllBandak" component={ListAllBandak} options={{ headerShown: false }} />
    </BandhakStack.Navigator>
  )
}

export default BandhakNav