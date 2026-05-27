import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../Common/CustomDrawer';
import StatusHome from './StatusHome';
import { createStackNavigator } from '@react-navigation/stack';
// import StatusHomeInvoiceDetail from './StatusHomeInvoiceDetail';
// import EditInvoiceFilter from './EditInvoiceFilter';
import EditInvoice from '../Invoice/EditInvoice';
import InvoiceDetail from '../Invoice/InvoiceDetail';



const FilterNav = () => {
  const FilterStack = createStackNavigator();


  return (
    <FilterStack.Navigator>
      <FilterStack.Screen name="StatusHome" component={StatusHome} options={{ headerShown: false }} />
      <FilterStack.Screen name="StatusHomeInvoiceDetail" component={InvoiceDetail} options={{ headerShown: false }} />
      <FilterStack.Screen name="EditInvoiceFilter" component={EditInvoice} options={{ headerShown: false }} />
    </FilterStack.Navigator>
  )
}

export default FilterNav