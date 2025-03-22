import { View, Text, TextInput, Button, ScrollView, Animated, Dimensions, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import HeaderWithCollapse from '../Common/HeaderWithCollapse';
import CheckBox from "@react-native-community/checkbox";
import DatePicker from 'react-native-date-picker';
import config from '../../config';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';



const StatusHome = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [address, setAddress] = useState('');
  const [amountmin, setAmountmin] = useState('');
  const [amountmax, setAmountmax] = useState('');
  const [metal, setMetal] = useState(false);
  const [data, setData] = useState(null);
  const navigation = useNavigation();

  const [deliverDateStart, setdeliveryDateStart] = useState(null);
  const [deliverDateEnd, setdeliveryDateEnd] = useState(null);
  const [isDeliveryDateOpenStart, setDeliveryDateOpenStart] = useState(false);
  const [isDeliveryDateOpenEnd, setDeliveryDateOpenEnd] = useState(false);

  const [orderDateStart, setorderDateStart] = useState(null);
  const [orderDateEnd, setorderDateEnd] = useState(null);
  const [isOrderDateOpenStart, setOrderDateOpenStart] = useState(false);
  const [isOrderDateOpenEnd, setOrderDateOpenEnd] = useState(false);

  const calanderLogo = require('../../assets/calendar.png');
  const screenHeight = Dimensions.get("window").height * 0.9;
  const clearAll = require('../../assets/multiply.png');

  const pricelist = require('../../assets/price_list.png');

  const GoldLogo = require("../../assets/gold_bar_shie.png");
  const SilverLogo = require("../../assets/silver_compressed.png");
  const MixLogo = require("../../assets/mix.png");

  const heightAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const search = () => {
    toggleVisible();
    rotateAnimation();
    hitSearchAPI();
  }

  const TriangleCorner = ({ text }) => {
    return (
      <View style={styles.ribbonContainer}>
        <View style={styles.triangleCorner} />
        <Text style={styles.ribbonText}>{text}</Text>
      </View>
    );
  };

  const hitSearchAPI = async () => {
    console.log(metal, amountmax);
    const url = `${config.BASE_URL}advanceSearch.php`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, amountmin, amountmax, metal, deliverDateStart, deliverDateEnd, orderDateStart, orderDateEnd }),
    });
    const result = await response.json();
    if (result.status == "success") {
      setData(result.data);
    }
    else {
      setData(null);

    }

  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('StatusHomeInvoiceDetail', { invoice: item })} style={{ margin: 10 }}>
      <View style={styles.card}>
        <TriangleCorner text={item.invoice_number} />
        {/* <TriangleCorner text="1223" /> */}

        <Image source={pricelist} style={styles.image} />
        <View style={{ flexShrink: 1 }}>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <Text style={styles.nameText}>
              Name: <Text style={styles.boldText}>{item.name}</Text>
            </Text>
            <View
              style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: item.metal == "Gold" ? "gold" : item.metal == "Silver" ? "#C0C0C0" : item.metal == "Mix" ? "red" : "blue", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.metal == "Gold" ? "G" : item.metal == "Silver" ? "S" : item.metal == "Mix" ? "M" : "U"}
              </Text>
            </View>

          </View>
          <Text style={styles.amountText}>
            Billing Amount: <Text style={styles.boldAmountText}>₹{item.totalAmount}</Text>
          </Text>
          <Text style={styles.amountText}>
            Paid Amount: <Text style={styles.boldAmountText}>₹{item.amountGiven}</Text>
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text style={styles.mobileText}>Status: </Text>
            <Text style={{ padding: 5, backgroundColor: item.status == "Completed" ? '#32CD32' : item.status == "Pending" ? "#FFA500" : item.status == "Ongoing" ? '#1E90FF' : '#FFD700', borderRadius: 5, color: "white", fontWeight: "700", fontSize: 9 }}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );


  const toggleVisible = () => {
    setIsVisible(!isVisible);

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isVisible ? 0 : screenHeight, // Collapse to 0 or expand to full height
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: isVisible ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateAnimation = () => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>

      <HeaderWithCollapse toggleVisible={toggleVisible} isVisible={isVisible} rotateAnimation={rotateAnimation} rotateInterpolate={rotateInterpolate} />

      <Animated.View
        style={{
          height: heightAnim,
          opacity: opacityAnim,
          overflow: "hidden",
          backgroundColor: "white"
        }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20, padding: 10 }}>
          <View style={{ gap: 15 }}>
            {/* <View>
              <View style={{ paddingHorizontal: 5, backgroundColor: "#03f0fc", paddingVertical: 2, alignItems: "center", borderRadius: 5 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 5, color: "black" }}>Advance Filter</Text>
              </View>
            </View> */}


            <View style={{ flexDirection: "row" }}>
              <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={'gray'}
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 5,
                  padding: 5,
                  paddingHorizontal: 10,
                  width: '80%',
                  color: "black"
                }}
              />
              <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => setAddress("")}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
              </View>
            </View>
            <View>

              <Text style={{ color: "black", fontWeight: "600" }}>Billing Amount</Text>
              <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                <View style={{ width: "80%", flexDirection: "row", justifyContent: "space-between" }}>
                  <TextInput
                    placeholder="Min Amt"
                    value={amountmin}
                    onChangeText={setAmountmin}
                    placeholderTextColor={'gray'}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: 10,
                      borderRadius: 5,
                      padding: 5,
                      width: "47%",
                      color: "black",
                      paddingHorizontal: 10,

                    }}
                  />
                  <TextInput
                    placeholder="Max Amt"
                    value={amountmax}
                    onChangeText={setAmountmax}
                    placeholderTextColor={'gray'}
                    keyboardType="numeric"
                    style={{
                      padding: 10,
                      borderRadius: 5,
                      padding: 5,
                      width: "47%",
                      color: "black",
                      backgroundColor: "#f0f0f0",
                      paddingHorizontal: 10,

                    }}
                  />
                </View>
                <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => { setAmountmin(""); setAmountmax("") }}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <Text style={{ color: "black", fontWeight: "600" }}>Metal</Text>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "80%" }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => setMetal(metal === "Gold" ? "" : "Gold")}
                  >
                    <CheckBox
                      value={metal === "Gold"}
                      onValueChange={() => setMetal(metal === "Gold" ? "" : "Gold")}
                      tintColors={{ false: "black" }}
                    />
                    <Image source={GoldLogo} style={{ height: 25, width: 25 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Gold</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => setMetal(metal === "Silver" ? "" : "Silver")}
                  >
                    <CheckBox
                      value={metal === "Silver"}
                      onValueChange={() => setMetal(metal === "Silver" ? "" : "Silver")}
                      tintColors={{ false: "black" }}
                    />
                    <Image source={SilverLogo} style={{ height: 22, width: 22 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Silver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => setMetal(metal === "Mix" ? "" : "Mix")}
                  >
                    <CheckBox
                      value={metal === "Mix"}
                      onValueChange={() => setMetal(metal === "Mix" ? "" : "Mix")}
                      tintColors={{ false: "black" }}
                    />
                    <Image source={MixLogo} style={{ height: 25, width: 25 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Mix</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => setMetal("")}>
                    <Image source={clearAll} style={{ height: 30, width: 30 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <Text style={{ color: "black", fontWeight: "600" }}>Delivery Date Filter</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "80%", flexDirection: "row", justifyContent: "space-between" }}>
                  <TouchableOpacity onPress={() => setDeliveryDateOpenStart(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 2, borderRadius: 7, width: '48%' }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: deliverDateStart ? "black" : "gray", fontWeight: deliverDateStart ? "600" : "normal" }}>
                        {deliverDateStart ? deliverDateStart.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "From"}</Text>
                      {deliverDateStart ? <View style={{ height: 25, width: 25 }} /> : <Image source={calanderLogo} style={{ height: 25, width: 25 }} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setDeliveryDateOpenEnd(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 2, borderRadius: 7, width: '48%' }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: deliverDateEnd ? "black" : "gray", fontWeight: deliverDateEnd ? "600" : "normal" }}>
                        {deliverDateEnd ? deliverDateEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "To"}</Text>
                      {deliverDateEnd ? <View style={{ height: 25, width: 25 }} /> : <Image source={calanderLogo} style={{ height: 25, width: 25 }} />}
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => { setdeliveryDateStart(null); setdeliveryDateEnd(null); }}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
                </View>
              </View>
            </View>

            <DatePicker modal title={"Select Delivery Date"} mode='date' theme='dark' open={isDeliveryDateOpenStart} date={deliverDateStart || new Date()} onConfirm={(date) => {
              setDeliveryDateOpenStart(false); setdeliveryDateStart(date);
            }} onCancel={() => { setDeliveryDateOpenStart(false); }} />
            <DatePicker modal title={"Select Delivery Date"} mode='date' theme='dark' open={isDeliveryDateOpenEnd} date={deliverDateEnd || new Date()} onConfirm={(date) => {
              setDeliveryDateOpenEnd(false); setdeliveryDateEnd(date);
            }} onCancel={() => { setDeliveryDateOpenEnd(false); }} />





            <View>
              <Text style={{ color: "black", fontWeight: "600" }}>Order Date Filter</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "80%", flexDirection: "row", justifyContent: "space-between" }}>
                  <TouchableOpacity onPress={() => setOrderDateOpenStart(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 2, borderRadius: 7, width: '48%' }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: orderDateStart ? "black" : "gray", fontWeight: orderDateStart ? "600" : "normal" }}>
                        {orderDateStart ? orderDateStart.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "From"}</Text>
                      {orderDateStart ? <View style={{ height: 25, width: 25 }} /> : <Image source={calanderLogo} style={{ height: 25, width: 25 }} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setOrderDateOpenEnd(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 2, borderRadius: 7, width: '48%' }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: orderDateEnd ? "black" : "gray", fontWeight: orderDateEnd ? "600" : "normal" }}>
                        {orderDateEnd ? orderDateEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "To"}</Text>
                      {orderDateEnd ? <View style={{ height: 25, width: 25 }} /> : <Image source={calanderLogo} style={{ height: 25, width: 25 }} />}
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => { setorderDateStart(null); setorderDateEnd(null); }}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
                </View>
              </View>
            </View>

            <DatePicker modal title={"Select Order Date"} mode='date' theme='dark' open={isOrderDateOpenStart} date={orderDateStart || new Date()} onConfirm={(date) => {
              setOrderDateOpenStart(false); setorderDateStart(date);
            }} onCancel={() => { setOrderDateOpenStart(false); }} />
            <DatePicker modal title={"Select Order Date"} mode='date' theme='dark' open={isOrderDateOpenEnd} date={orderDateEnd || new Date()} onConfirm={(date) => {
              setOrderDateOpenEnd(false); setorderDateEnd(date);
            }} onCancel={() => { setOrderDateOpenEnd(false); }} />

















            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={{ padding: 10, backgroundColor: "#24fffb", borderRadius: 5 }} onPress={search}>
                <Text style={{ color: "black" }}>Search</Text>
              </TouchableOpacity>
            </View>



          </View>

        </ScrollView>
      </Animated.View>

      {
        data && data.length == 0 ? (<View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={{ height: 400, aspectRatio: 1 }}>
            <LottieView style={{ flex: 1 }} source={require('../../assets/Animation - 1739937488069.json')} autoPlay loop />
          </View>
        </View>) :
          (<FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />)

      }





    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    marginTop: 5,
    justifyContent: 'space-evenly',
  },
  touchable: {
    width: "45%",
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "red",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    height: 110,
    justifyContent: "center"
  },
  buttonImage: {
    height: 50,
    width: 50,
  },
  buttonText: {
    textAlign: "center",
    color: "black",
    fontSize: 16,
    fontWeight: "600"
  },
  titleContainer: {
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    width: "45%"
  },
  titleContainerActive: {
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    width: "45%",
    backgroundColor: "#044780"
  },
  titleText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  titleTextActive: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    marginVertical: 5,
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    shadowColor: "red",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    position: 'relative',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  nameText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    // marginBottom: 4,
  },
  boldText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "700",
  },
  amountText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  boldAmountText: {
    color: "#2a9d8f",
    fontSize: 16,
    fontWeight: "700",
  },
  mobileText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    // marginBottom: 4,
  },
  boldMobileText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 80, // adjust for size
    borderTopWidth: 60, // adjust for size
    borderRightColor: "transparent",
    borderTopColor: "red", // change to your desired color
  },
  ribbonText: {
    position: 'absolute',
    left: 5, // adjust to position the text properly
    top: 5, // adjust to position the text properly
    fontSize: 15,
    color: '#fff', // white text for visibility
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default StatusHome;
