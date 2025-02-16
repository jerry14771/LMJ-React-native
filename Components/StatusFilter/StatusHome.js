import { View, Text, TextInput, Button, ScrollView, Animated, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import HeaderWithCollapse from '../Home/HeaderWithCollapse';
import { TouchableOpacity } from 'react-native-gesture-handler';

const StatusHome = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const screenHeight = Dimensions.get("window").height * 0.9; // Get full screen height

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
          backgroundColor: '#f1f1f1',
          overflow: "hidden",
        }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View>
            <View style={{ paddingHorizontal: 5, backgroundColor: "#03f0fc", paddingVertical: 2, alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 5, color: "black" }}>Advance Filter</Text>
            </View>
          </View>

          {[...Array(9)].map((_, index) => (
            <View key={index}>
              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={'black'}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 10
                }}
              />

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={'black'}
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 10
                }}
              />
            </View>
          ))}
          <View style={{ alignItems: "center" }}>

            <TouchableOpacity style={{ padding: 10, backgroundColor: "#24fffb", borderRadius: 5 }} onPress={() => { toggleVisible(); rotateAnimation(); }}>
              <Text style={{ color: "white" }}>Search</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>

      <ScrollView>
        <View>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo676</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo</Text>
          <Text>Hellllo1888</Text>
        </View>

      </ScrollView>



    </View>
  );
};

export default StatusHome;
