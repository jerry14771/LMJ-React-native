import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import InvoiceHome from './InvoiceHome';
import AddInvoice from './AddInvoice';
import InvoiceDetail from './InvoiceDetail';
import ListAllOrder from './ListAllOrder';
import EditInvoice from './EditInvoice';




const InvoiceNav = () => {
    const InvoiceStack = createStackNavigator();

  return (
    <InvoiceStack.Navigator>
    <InvoiceStack.Screen name="InvoiceHome" component={InvoiceHome} options={{ headerShown: false }} />
    <InvoiceStack.Screen name="AddInvoice" component={AddInvoice} options={{ headerShown: false }} />
    <InvoiceStack.Screen name="InvoiceDetail" component={InvoiceDetail} options={{ headerShown: false }} />
    <InvoiceStack.Screen name="ListAllOrder" component={ListAllOrder} options={{ headerShown: false }} />
    <InvoiceStack.Screen name="EditInvoice" component={EditInvoice} options={{ headerShown: false }} />
  </InvoiceStack.Navigator>
  )
}

export default InvoiceNav