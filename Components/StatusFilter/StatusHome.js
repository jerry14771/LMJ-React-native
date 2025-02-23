import { View, Text, TextInput, Button, ScrollView, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import HeaderWithCollapse from '../Home/HeaderWithCollapse';
import CheckBox from "@react-native-community/checkbox";
import DatePicker from 'react-native-date-picker';


const StatusHome = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [amountmin, setAmountmin] = useState('');
  const [amountmax, setAmountmax] = useState('');
  const [isGold, setIsGold] = useState(false);
  const [isSilver, setIsSilver] = useState(false);
  const [isMix, setIsMix] = useState(false);
  const [deliverDateStart, setdeliveryDateStart] = useState(null);
  const [deliverDateEnd, setdeliveryDateEnd] = useState(null);
  const [isDeliveryDateOpenStart, setDeliveryDateOpenStart] = useState(false);
  const [isDeliveryDateOpenEnd, setDeliveryDateOpenEnd] = useState(false);

  const calanderLogo = require('../../assets/calendar.png');
  const screenHeight = Dimensions.get("window").height * 0.9;
  const clearAll = require('../../assets/multiply.png');


  const GoldLogo = require("../../assets/gold_bar_shie.png");
  const SilverLogo = require("../../assets/silver_compressed.png");
  const MixLogo = require("../../assets/mix.png");














  const heightAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;


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
    <View style={{ flex: 1 }}>

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
                    style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsGold(!isGold)}>
                    <CheckBox value={isGold} onValueChange={setIsGold} tintColors={{ false: "black" }} />
                    <Image source={GoldLogo} style={{ height: 25, width: 25 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Gold</Text>

                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsSilver(!isSilver)}>
                    <CheckBox value={isSilver} onValueChange={setIsSilver} tintColors={{ false: "black" }} />
                    <Image source={SilverLogo} style={{ height: 22, width: 22 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Silver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsMix(!isMix)}>
                    <CheckBox value={isMix} onValueChange={setIsMix} tintColors={{ false: "black" }} />
                    <Image source={MixLogo} style={{ height: 25, width: 25 }} />
                    <Text style={{ color: "black", fontSize: 13 }}>Mix</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => { setIsGold(false); setIsSilver(false); setIsMix(false); }}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
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




            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={{ padding: 10, backgroundColor: "#24fffb", borderRadius: 5 }} onPress={() => { toggleVisible(); rotateAnimation(); }}>
                <Text style={{ color: "black" }}>Search</Text>
              </TouchableOpacity>
            </View>



          </View>

        </ScrollView>
      </Animated.View>

      <ScrollView>
        <View>
          <Text style={{ color: "black" }}>Hellllo</Text>
          <Text style={{ color: "black" }}>Hellllo</Text>
          <Text style={{ color: "black" }}>Hellllo</Text>
          <Text style={{ color: "black" }}>Hellllo</Text>
          <Text style={{ color: "black" }}>Hellllo1888</Text>
        </View>

      </ScrollView>



    </View>
  );
};

export default StatusHome;
