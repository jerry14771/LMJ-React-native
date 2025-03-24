import { View, Text } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import BandhakNav from '../Bandhak/BandhakNav';
import InvoiceNav from '../Invoice/InvoiceNav';
import CustomDrawer from './CustomDrawer';
import Settings from '../Settings/Settings';
import FilterNav from '../Filter/FilterNav';


const Home = () => {
const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen name="InvoiceNav" component={InvoiceNav} options={{ headerShown: false }}  />
        <Drawer.Screen name="FilterNav" component={FilterNav} options={{ headerShown: false }} />
        <Drawer.Screen name="BandhakNav" component={BandhakNav} options={{ headerShown: false }} />
        <Drawer.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      </Drawer.Navigator>
  )
}

export default Home