import React, { useState, useEffect } from 'react';
import { FlatList, Modal, View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, Dimensions, ActivityIndicator, Button } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 75) / 3;

const EditInvoice = ({ route }) => {
    const getFullImagePath = (path) => `https://lmjak.co.in/appAPI/${path.replace(/\\/g, '')}`;
    const navigation = useNavigation();
    const [receiptImages, setReceiptImages] = useState(route.params.invoice.receiptImages ? JSON.parse(route.params.invoice.receiptImages).map((img) => ({ uri: getFullImagePath(img), isExisting: true })) : []);
    const [designImages, setDesignImages] = useState(route.params.invoice.designImages ? JSON.parse(route.params.invoice.designImages).map((img) => ({ uri: getFullImagePath(img), isExisting: true })) : []);
    const [removedReceiptImages, setRemovedReceiptImages] = useState([]);
    const [removedDesignImages, setRemovedDesignImages] = useState([]);
    const [activity, setActivity] = useState(false);

    // Image Picker for Receipt
    const handleReceiptImageSelection = () => {
        Alert.alert(
            'Choose an option',
            '',
            [
                { text: 'Camera', onPress: openReceiptCamera },
                { text: 'Gallery', onPress: pickReceiptImage },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const pickReceiptImage = () => {
        ImagePicker.openPicker({ multiple: true, cropping: true }).then(images => {
            setReceiptImages(prevImages => [
                ...prevImages,
                ...images.map(img => ({ uri: img.path, isExisting: false }))
            ]);
        }).catch(error => console.log('Error picking receipt images:', error));
    };

    const openReceiptCamera = () => {
        ImagePicker.openCamera({ cropping: true }).then(image => {
            setReceiptImages(prevImages => [...prevImages, { uri: image.path, isExisting: false }]);
        }).catch(error => console.log('Error opening camera:', error));
    };

    // Image Picker for Design
    const handleDesignImageSelection = () => {
        Alert.alert(
            'Choose an option',
            '',
            [
                { text: 'Camera', onPress: openDesignCamera },
                { text: 'Gallery', onPress: pickDesignImage },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const pickDesignImage = () => {
        ImagePicker.openPicker({ multiple: true, cropping: true }).then(images => {
            setDesignImages(prevImages => [
                ...prevImages,
                ...images.map(img => ({ uri: img.path, isExisting: false }))
            ]);
        }).catch(error => console.log('Error picking design images:', error));
    };

    const openDesignCamera = () => {
        ImagePicker.openCamera({ cropping: true }).then(image => {
            setDesignImages(prevImages => [...prevImages, { uri: image.path, isExisting: false }]);
        }).catch(error => console.log('Error opening camera:', error));
    };

    // Handle Image Removal
    const handleRemoveImage = (imageType, index) => {
        if (imageType === 'receipt') {
            const imageToRemove = receiptImages[index];
            if (imageToRemove.isExisting) {
                setRemovedReceiptImages(prev => [...prev, imageToRemove.uri]);
            }
            setReceiptImages(prevImages => prevImages.filter((_, i) => i !== index));
        } else if (imageType === 'design') {
            const imageToRemove = designImages[index];
            if (imageToRemove.isExisting) {
                setRemovedDesignImages(prev => [...prev, imageToRemove.uri]);
            }
            setDesignImages(prevImages => prevImages.filter((_, i) => i !== index));
        }
    };

    // Submit Form
    const handleSubmit = async () => {
        setActivity(true);
        const apiURL = config.BASE_URL + 'updateInvoice.php';
        const formData = new FormData();
        formData.append('id', route.params.invoice.id);
    
        const removeBaseUrl = (uri) => uri.replace('https://lmjak.co.in/appAPI/', '');
    
        // Ensure receiptImages and designImages are not undefined
        const safeReceiptImages = receiptImages || [];
        const safeDesignImages = designImages || [];
        const safeRemovedReceiptImages = removedReceiptImages || [];
        const safeRemovedDesignImages = removedDesignImages || [];
    
        // Prepare arrays for kept and removed images
        const keptReceiptImages = safeReceiptImages.filter((img) => img.isExisting).map((img) => removeBaseUrl(img.uri));
        const removedReceiptImages = safeRemovedReceiptImages.map(removeBaseUrl);
        const keptDesignImages = safeDesignImages.filter((img) => img.isExisting).map((img) => removeBaseUrl(img.uri));
        const removedDesignImages = safeRemovedDesignImages.map(removeBaseUrl);
    
        // Only append kept images if there are any
        if (keptReceiptImages.length > 0) {
            formData.append('keptReceiptImages', JSON.stringify(keptReceiptImages));
        }
        if (removedReceiptImages.length > 0) {
            formData.append('removedReceiptImages', JSON.stringify(removedReceiptImages));
        }
    
        if (keptDesignImages.length > 0) {
            formData.append('keptDesignImages', JSON.stringify(keptDesignImages));
        }
        if (removedDesignImages.length > 0) {
            formData.append('removedDesignImages', JSON.stringify(removedDesignImages));
        }
    
        // Handle new receipt images (only append if new)
        const newReceiptImages = safeReceiptImages.filter((img) => !img.isExisting);
        newReceiptImages.forEach((image, index) => {
            formData.append('receiptImages[]', {
                uri: image.uri,
                type: 'image/jpeg',
                name: `receipt_${Date.now()}_${index}.jpg`,
            });
        });
    
        // Handle new design images (only append if new)
        const newDesignImages = safeDesignImages.filter((img) => !img.isExisting);
        newDesignImages.forEach((image, index) => {
            formData.append('designImages[]', {
                uri: image.uri,
                type: 'image/jpeg',
                name: `design_${Date.now()}_${index}.jpg`,
            });
        });
    
        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                Alert.alert('Success', 'Invoice updated successfully');
                navigation.navigate('InvoiceHome');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error("Network Error:", error);
            Alert.alert('Error', 'Failed to update invoice');
        } finally {
            setActivity(false);
        }
    };
    
    
    
    

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.imagePicker} onPress={handleReceiptImageSelection}>
                    <Text style={styles.imagePickerText}>Upload Receipt Images</Text>
                </TouchableOpacity>
                <View style={styles.imageList}>
                    {receiptImages.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri: image.uri }} style={styles.image} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage('receipt', index)}>
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.imagePicker} onPress={handleDesignImageSelection}>
                    <Text style={styles.imagePickerText}>Upload Design Images</Text>
                </TouchableOpacity>
                <View style={styles.imageList}>
                    {designImages.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri: image.uri }} style={styles.image} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage('design', index)}>
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>

            {activity && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#ffffff' },
    imagePicker: { alignItems: 'center', padding: 15, backgroundColor: '#d4af37', borderRadius: 5 },
    imagePickerText: { color: '#ffffff', fontSize: 16 },
    imageList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
    imageContainer: { position: 'relative', margin: 5 },
    image: { width: imageSize, height: imageSize, borderRadius: 5 },
    removeButton: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ff0000', padding: 5, borderRadius: 15 },
    removeButtonText: { color: '#ffffff', fontSize: 12 },
    submitButton: { backgroundColor: '#4CAF50', padding: 15, marginTop: 20, alignItems: 'center', borderRadius: 5 },
    submitButtonText: { color: '#ffffff', fontSize: 18 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
});

export default EditInvoice;
