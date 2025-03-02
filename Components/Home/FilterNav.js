import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import StatusHome from '../StatusFilter/StatusHome';
import { createStackNavigator } from '@react-navigation/stack';
import StatusHomeInvoiceDetail from './StatusHomeInvoiceDetail';
import EditInvoiceFilter from './EditInvoiceFilter';



const FilterNav = () => {
const FilterStack = createStackNavigator();


  return (
    <FilterStack.Navigator>

        <FilterStack.Screen name="StatusHome" component={StatusHome} options={{ headerShown: false }} />
        <FilterStack.Screen name="StatusHomeInvoiceDetail" component={StatusHomeInvoiceDetail} options={{ headerShown: false }} />  
        <FilterStack.Screen name="EditInvoiceFilter" component={EditInvoiceFilter} options={{ headerShown: false }} />  
        </FilterStack.Navigator>
  )
}

export default FilterNav