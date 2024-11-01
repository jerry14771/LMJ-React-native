import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Calendar from 'date-bengali-revised'
 


const Udhari = () => {

  let cal = new Calendar()

  console.log(cal.fromGregorian(2024, 10, 30));
  let bacl = new Calendar(1425, 1, 1)
  bacl.format()
//> '১ ১, ১৪২৫'
console.log(bacl.format('dddd D MMMM, Y [Q]'))

  return (
    <View>
      <Header />
      <Text>hello</Text>
    </View>
  );
};

export default Udhari;
