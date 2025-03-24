import { View, Text, Image, TouchableOpacity, StatusBar, Modal, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDrawerStatus } from '@react-navigation/drawer';
import config from '../../config'

const CustomDrawer = (props) => {

  const navigation = useNavigation();

  const invoiceActive = require("../../assets/invoice_sidebar_active.png");
  const invoiceDeactive = require("../../assets/invoice_sidebar_deactive.png");
  const filterActive = require("../../assets/filterWhite.png");
  const filterDeactive = require("../../assets/filter.png");
  const bandhakActive = require("../../assets/cashback_active.png");
  const bandhakDeactive = require("../../assets/cashback_deactive.png");
  const logoutLogo = require("../../assets/switch.png")

  const settingicon = require("../../assets/settings.png");
  const settingActive = require("../../assets/settings_active.png");
  const [pageName, setPageName] = useState("HomeScreen");
  const [data, setData] = useState();
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const { state } = props
    const { routes, index } = state;
    const focusedRoute = routes[index].name;
    setPageName(focusedRoute);
  })

  const isDrawerOpen = useDrawerStatus();


  useEffect(() => {
    const fetchid = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');

    }
    fetchid();

    fetchUserDetail();

  }, [isDrawerOpen])


  const fetchUserDetail = async () => {
    const url = config.BASE_URL+'adminDetail.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(),
    });
    const result = await response.json();
    if (result.status == "success") {
      setData(result.data)
    }
  }



  const handleOpenModal = () => {
    setModalVisible(true);
};

const handleCloseModal = () => {
    setModalVisible(false);
};

const handleConfirm = async() => {
    await AsyncStorage.clear();

    setModalVisible(false);
    navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
    });
};

  if (!data) {
    return (
      <Text>Seems No Internet</Text>
    )
  }
  else {

    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: "space-between", paddingVertical: 20 }}>
        <StatusBar backgroundColor="black" barStyle="light-content" />

        <View>
          <View style={{ alignItems: "center", flexDirection: "row", marginLeft: 10, gap: 10, paddingVertical: 30 }}>

            <Image resizeMode='center' source={{ uri: data.profile_pic?config.BASE_URL+data.profile_pic:  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }} style={{ borderRadius: 50, height: 70, width: 70, borderColor: "black", borderWidth: 1 }} />
            <View>
              <Text style={{ color: "gray", fontSize: 13, fontFamily: "Inter-Regular" }}>Welcome</Text>
              <Text style={{ color: "#28282B", fontSize: 15, fontFamily: "Inter-SemiBold" }}>{data.admin_name ? data.admin_name : ""}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => { navigation.navigate("InvoiceHome") }} style={{ marginLeft: 10, backgroundColor: pageName == "InvoiceNav" ? "#d4af37" : "transparent", borderRadius: 5, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Image source={pageName == "InvoiceNav" ? invoiceActive : invoiceDeactive} style={{ height: 18, width: 18 }} />
              <Text style={{ marginLeft: 10, fontFamily: 'Inter-Bold', fontSize: 15, color: pageName == "InvoiceNav" ? "white" : "gray" }}>Invoice</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { navigation.navigate("FilterNav") }} style={{ marginLeft: 10, backgroundColor: pageName == "FilterNav" ? "#d4af37" : "transparent", borderRadius: 5, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Image source={pageName == "FilterNav" ? filterActive : filterDeactive} style={{ height: 18, width: 18 }} />
              <Text style={{ marginLeft: 10, fontFamily: 'Inter-Bold', fontSize: 15, color: pageName == "FilterNav" ? "white" : "gray" }}>Filter</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { navigation.navigate("BandhakNav", { screen: "BandhakHome" }) }} style={{ marginLeft: 10, backgroundColor: pageName == "BandhakNav" ? "#d4af37" : "transparent", borderRadius: 5, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Image source={pageName == "BandhakNav" ? bandhakActive : bandhakDeactive} style={{ height: 18, width: 18 }} />
              <Text style={{ marginLeft: 10, fontFamily: 'Inter-Bold', fontSize: 15, color: pageName == "BandhakNav" ? "white" : "gray" }}>Bandhak</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 10, backgroundColor: pageName == "Settings" ? "#d4af37" : "transparent", borderRadius: 5, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Image source={pageName == "Settings" ? settingActive : settingicon} style={{ height: 18, width: 18 }} />
              <Text style={{ marginLeft: 10, fontFamily: 'Inter-Bold', fontSize: 15, color: pageName == "Settings" ? "white" : "gray" }}>Settings</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenModal} style={{ marginLeft: 10, borderRadius: 5, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Image source={ logoutLogo} style={{ height: 18, width: 18 }} />
              <Text style={{ marginLeft: 10, fontFamily: 'Inter-Bold', fontSize: 15, color: "gray" }}>Logout</Text>
            </View>
          </TouchableOpacity>

          <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure?</Text>
                        <Text style={styles.modalMessage}>You will be redirected to login !</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                                <Text style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>

      </DrawerContentScrollView>


    )
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: 300,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color:"gray"
  },
  modalMessage: {
      marginVertical: 10,
      textAlign: 'center',
      color:"gray"
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
  },
  button: {
      flex: 1,
      padding: 10,
      margin: 5,
      borderRadius: 5,
      backgroundColor: '#ccc',
      alignItems: 'center',
  },
  confirmButton: {
      backgroundColor: 'red',
  },
  buttonText: {
      color: 'white',
  },
});

export default CustomDrawer