import { View, Text } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import InvoiceHome from './InvoiceHome';
import Udhari from '../Udhari/Udhari';
import InvoiceNav from './InvoiceNav';
import CustomDrawer from './CustomDrawer';
import Settings from '../Setting/Settings';
import FilterNav from './FilterNav';



const Home = () => {
const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen name="InvoiceNav" component={InvoiceNav} options={{ headerShown: false }}  />
        <Drawer.Screen name="FilterNav" component={FilterNav} options={{ headerShown: false }} />
        <Drawer.Screen name="Udhari" component={Udhari} options={{ headerShown: false }} />
        <Drawer.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      </Drawer.Navigator>
  )
}

export default Home