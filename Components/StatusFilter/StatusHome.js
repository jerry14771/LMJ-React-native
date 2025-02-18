import { View, Text, TextInput, Button, ScrollView, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import HeaderWithCollapse from '../Home/HeaderWithCollapse';
import CheckBox from "@react-native-community/checkbox";

const StatusHome = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [amountmin, setAmountmin] = useState('');
  const [amountmax, setAmountmax] = useState('');
  const [isGold, setIsGold] = useState(false);
  const [isSilver, setIsSilver] = useState(false);
  const [isMix, setIsMix] = useState(false);

  const screenHeight = Dimensions.get("window").height * 0.9;
  const clearAll = require('../../assets/multiply.png');

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
    <View style={{ flex: 1}}>

      <HeaderWithCollapse toggleVisible={toggleVisible} isVisible={isVisible} rotateAnimation={rotateAnimation} rotateInterpolate={rotateInterpolate} />

      <Animated.View
        style={{
          height: heightAnim,
          opacity: opacityAnim,
          overflow: "hidden",
        }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20, padding: 10 }}>
          <View style={{ gap: 10 }}>
            <View>
              <View style={{ paddingHorizontal: 5, backgroundColor: "#03f0fc", paddingVertical: 2, alignItems: "center", borderRadius: 5 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 5, color: "black" }}>Advance Filter</Text>
              </View>
            </View>


            <View style={{ flexDirection: "row" }}>
              <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={'gray'}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 5,
                  width: '80%',
                  color: "black"
                }}
              />
              <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => setAddress("")}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
              </View>
            </View>

            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
              <View style={{ width: "80%", flexDirection: "row", justifyContent: "space-between" }}>
                <TextInput
                  placeholder="Min Billing"
                  value={amountmin}
                  onChangeText={setAmountmin}
                  placeholderTextColor={'gray'}
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    borderRadius: 5,
                    padding: 5,
                    width: "47%",
                    color: "black"

                  }}
                />
                <TextInput
                  placeholder="Max Billing"
                  value={amountmax}
                  onChangeText={setAmountmax}
                  placeholderTextColor={'gray'}
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    borderRadius: 5,
                    padding: 5,
                    width: "47%",
                    color: "black"
                  }}
                />
              </View>
              <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => { setAmountmin(""); setAmountmax("") }}><Image source={clearAll} style={{ height: 30, width: 30 }} /></TouchableOpacity>
              </View>
            </View>




            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsGold(!isGold)}>
                <CheckBox value={isGold} onValueChange={setIsGold} tintColors={{false: "black" }} />
                <Text style={{ marginLeft: 8, color:"black" }}>Gold</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsSilver(!isSilver)}>
                <CheckBox value={isSilver} onValueChange={setIsSilver} tintColors={{false: "black" }} />
                <Text style={{ marginLeft: 8, color:"black" }}>Silver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setIsMix(!isMix)}>
                <CheckBox value={isMix} onValueChange={setIsMix} tintColors={{false: "black" }} />
                <Text style={{ marginLeft: 8, color:"black"}}>Mix</Text>
              </TouchableOpacity>

            </View>
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
          <Text style={{ color:"black" }}>Hellllo</Text>
          <Text style={{ color:"black" }}>Hellllo</Text>
          <Text style={{ color:"black" }}>Hellllo</Text>
          <Text style={{ color:"black" }}>Hellllo</Text>
          <Text style={{ color:"black" }}>Hellllo1888</Text>
        </View>

      </ScrollView>



    </View>
  );
};

export default StatusHome;
