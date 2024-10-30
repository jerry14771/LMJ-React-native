import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';


const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 75) / 3;

const AddInvoice = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImages, setReceiptImages] = useState([]);
  const [designImages, setDesignImages] = useState([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [amountGiven, setAmountGiven] = useState('');
  const [activity, setActivity] = useState(false);
  const [invoice_number, setinvoice_number] = useState("");

  // Function to handle image selection for receipts
  const handleReceiptImageSelection = () => {
    Alert.alert(
      'Choose an option',
      '',
      [
        {
          text: 'Camera',
          onPress: openReceiptCamera,
        },
        {
          text: 'Gallery',
          onPress: pickReceiptImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickReceiptImage = () => {
    ImagePicker.openPicker({
      multiple: true,
      cropping: true,
    }).then(images => {
      setReceiptImages(prevImages => [...prevImages, ...images]);
    }).catch(error => console.log('Error picking receipt images:', error));
  };

  const openReceiptCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
    }).then(image => {
      setReceiptImages(prevImages => [...prevImages, image]);
    }).catch(error => console.log('Error opening camera:', error));
  };

  // Function to handle image selection for designs
  const handleDesignImageSelection = () => {
    Alert.alert(
      'Choose an option',
      '',
      [
        {
          text: 'Camera',
          onPress: openDesignCamera,
        },
        {
          text: 'Gallery',
          onPress: pickDesignImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickDesignImage = () => {
    ImagePicker.openPicker({
      multiple: true,
      cropping: true,
    }).then(images => {
      setDesignImages(prevImages => [...prevImages, ...images]);
    }).catch(error => console.log('Error picking design images:', error));
  };

  const openDesignCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
    }).then(image => {
      setDesignImages(prevImages => [...prevImages, image]);
    }).catch(error => console.log('Error opening camera:', error));
  };

  const handleRemoveImage = (setImageList, index) => {
    setImageList(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setActivity(true);
    const apiURL = config.BASE_URL+'insertInvoice.php';
    const formData = new FormData();

    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('address', address);
    formData.append('description', description);
    formData.append('totalAmount', totalAmount);
    formData.append('amountGiven', amountGiven);
    formData.append('invoice_number', invoice_number);

    receiptImages.forEach((image, index) => {
      formData.append('receiptImages[]', {
        uri: image.path,
        type: image.mime,
        name: `receipt_${Date.now()}_${index}.jpg`,
      });
    });

    designImages.forEach((image, index) => {
      formData.append('designImages[]', {
        uri: image.path,
        type: image.mime,
        name: `design_${Date.now()}_${index}.jpg`,
      });
    });

    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const result = await response.json();
      if (result.status === 'success') {
        setName("");
        setAddress("");
        setMobile("");
        setDescription("");
        setAmountGiven("");
        setTotalAmount("");
        setDesignImages([]);
        setReceiptImages([]);
        navigation.navigate('InvoiceHome');
        Alert.alert('Success', 'Invoice submitted successfully');

      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit invoice');
      console.error(error);
    }
    finally{
      setActivity(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <TextInput
            placeholder="Invoice Number"
            value={invoice_number}
            onChangeText={setinvoice_number}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            placeholderTextColor="#999"
            multiline
          />
          <TextInput
            placeholder="Total Amount"
            value={totalAmount}
            onChangeText={setTotalAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Amount Given"
            value={amountGiven}
            onChangeText={setAmountGiven}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholderTextColor="#999"
            multiline
          />

          {/* Button for choosing between camera and gallery for receipts */}
          <TouchableOpacity style={styles.imagePicker} onPress={handleReceiptImageSelection}>
            <Text style={styles.imagePickerText}>Upload Receipt Images</Text>
          </TouchableOpacity>

          <View style={styles.imageList}>
            {receiptImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.path }} style={styles.image} />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(setReceiptImages, index)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Button for choosing between camera and gallery for designs */}
          <TouchableOpacity style={styles.imagePicker} onPress={handleDesignImageSelection}>
            <Text style={styles.imagePickerText}>Upload Design Images</Text>
          </TouchableOpacity>
          <View style={styles.imageList}>
            {designImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.path }} style={styles.image} />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(setDesignImages, index)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
{activity&&

        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
}


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  input: {
    height: 50,
    borderColor: '#d4af37',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  imagePicker: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#d4af37',
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    borderColor: '#d4af37',
    borderWidth: 1,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddInvoice;
