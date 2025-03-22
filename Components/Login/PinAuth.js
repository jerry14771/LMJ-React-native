import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

const PinAuth = ({ navigation }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputs = useRef([]);

  const handlePinChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      setPin(newPin);

      // Move to the next input if there's a digit and it's not the last box
      if (text && index < 3) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newPin = [...pin];

      if (newPin[index] === '') {
        // If the current field is empty, move to the previous field and clear its content
        if (index > 0) {
          newPin[index - 1] = ''; // Clear previous input
          setPin(newPin);
          inputs.current[index - 1].focus();
        }
      } else {
        // Clear the current field
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const handlePinSubmit = (enteredPin) => {
    if (enteredPin === '1234') {
      navigation.replace('Home'); // Navigate to Home on successful authentication
    } else {
      Alert.alert('Error', 'Incorrect PIN. Please try again.');
      setPin(['', '', '', '']); // Clear all inputs
      inputs.current[0].focus(); // Focus back on the first input
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your PIN</Text>
        <View style={styles.inputContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              placeholderTextColor="#aaa"
              secureTextEntry
              autoFocus={index === 0} // Automatically focus the first input
            />
          ))}
        </View>
        <Button title="Submit" onPress={() => handlePinSubmit(pin.join(''))} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  input: {
    width: 50,
    height: 50,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
  },
});

export default PinAuth;
