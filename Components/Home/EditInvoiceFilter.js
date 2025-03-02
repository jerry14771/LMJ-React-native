import React, { useState, useEffect } from 'react';
import { FlatList, Modal, View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, Dimensions, ActivityIndicator, Button } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';
import Header from './Header';
import DatePicker from 'react-native-date-picker';
import Contacts from 'react-native-contacts';

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 75) / 3;

const EditInvoiceFilter = ({ route }) => {
    const getFullImagePath = (path) => `https://lmjak.co.in/appAPI/${path.replace(/\\/g, '')}`;
    const navigation = useNavigation();
    const [receiptImages, setReceiptImages] = useState(route.params.invoice.receiptImages ? JSON.parse(route.params.invoice.receiptImages).map((img) => ({ uri: getFullImagePath(img), isExisting: true })) : []);
    const [designImages, setDesignImages] = useState(route.params.invoice.designImages ? JSON.parse(route.params.invoice.designImages).map((img) => ({ uri: getFullImagePath(img), isExisting: true })) : []);
    const [removedReceiptImages, setRemovedReceiptImages] = useState([]);
    const [removedDesignImages, setRemovedDesignImages] = useState([]);
    const [activity, setActivity] = useState(false);
    const [invoice_number, setinvoice_number] = useState(route.params.invoice.invoice_number);
    const [name, setName] = useState(route.params.invoice.name);
    const [mobile, setMobile] = useState(route.params.invoice.mobile);
    const [address, setAddress] = useState(route.params.invoice.address);
    const [description, setDescription] = useState(route.params.invoice.description);
    const [totalAmount, setTotalAmount] = useState(route.params.invoice.totalAmount);
    const [amountGiven, setAmountGiven] = useState(route.params.invoice.amountGiven);
    const phoneBook = require("../../assets/phonebook.png");
    const [orderDate, setOrderDate] = useState(new Date(route.params.invoice.orderDate));
    const [deliveryDate, setDeliveryDate] = useState(new Date(route.params.invoice.deliveryDate));
    const [isOrderDateOpen, setOrderDateOpen] = useState(false);
    const [isDeliveryDateOpen, setDeliveryDateOpen] = useState(false);
    const calanderLogo = require('../../assets/calendar.png');
    const closeLogo = require("../../assets/close.png");
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [metal, setMetal] = useState(route.params.invoice.metal);
    const [goldGrams, setGoldGrams] = useState(route.params.invoice.gold_grams);
    const [silverGrams, setSilverGrams] = useState(route.params.invoice.silver_grams);




    useEffect(() => {
        if (search) {
            const filtered = contacts.filter(contact =>
                contact.displayName.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredContacts(filtered);
        } else {
            setFilteredContacts(contacts);
        }
    }, [search, contacts]);



    const openPhoneBook = async () => {
        setLoadingContacts(true);
        const permission = await Contacts.requestPermission();
        if (permission === 'authorized') {
            Contacts.getAll()
                .then((contactsList) => {
                    const filteredContacts = contactsList.filter(
                        (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
                    );

                    if (filteredContacts.length === 0) {
                        Alert.alert('No Contacts with Phone Numbers', 'No contacts with phone numbers found.');
                    } else {
                        setModalVisible(true);
                        const sortedContacts = filteredContacts.sort((a, b) => {
                            const nameA = a.displayName || "";
                            const nameB = b.displayName || "";
                            return nameA.localeCompare(nameB);
                        });
                        setContacts(sortedContacts);
                        setFilteredContacts(sortedContacts);
                    }
                })
                .catch((error) => {
                    console.warn('Error fetching contacts:', error);
                })
                .finally(() => {
                    setLoadingContacts(false); // Stop loading indicator
                });
        } else {
            Alert.alert('Permission Denied', 'Cannot access contacts without permission.');
        }
    };


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

    const handleSubmit = async () => {
        setActivity(true);
        const apiURL = config.BASE_URL + 'updateInvoice.php';
        const formData = new FormData();
        formData.append('id', route.params.invoice.id);
        formData.append('name', name);
        formData.append('mobile', mobile);
        formData.append('address', address);
        formData.append('metal', metal);
        formData.append('silvergrams', metal == "Gold" ? "0" : silverGrams);
        formData.append('goldgrams', metal == "Silver" ? "0" : goldGrams);
        formData.append('description', description);
        formData.append('totalAmount', totalAmount);
        formData.append('amountGiven', amountGiven);
        formData.append('invoice_number', invoice_number);
        formData.append('orderDate', orderDate.toISOString());
        formData.append('deliveryDate', deliveryDate.toISOString());


        const removeBaseUrl = (uri) => uri.replace('https://lmjak.co.in/appAPI/', '');

        const safeReceiptImages = receiptImages || [];
        const safeDesignImages = designImages || [];
        const safeRemovedReceiptImages = removedReceiptImages || [];
        const safeRemovedDesignImages = removedDesignImages || [];

        const keptReceiptImages = safeReceiptImages.filter((img) => img.isExisting).map((img) => removeBaseUrl(img.uri));
        const removedReceiptImages = safeRemovedReceiptImages.map(removeBaseUrl);
        const keptDesignImages = safeDesignImages.filter((img) => img.isExisting).map((img) => removeBaseUrl(img.uri));
        const removedDesignImages = safeRemovedDesignImages.map(removeBaseUrl);

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

        const newReceiptImages = safeReceiptImages.filter((img) => !img.isExisting);
        const newDesignImages = safeDesignImages.filter((img) => !img.isExisting);

        // Log the count and paths of new receipt images
        newReceiptImages.forEach((image, index) => {
            formData.append('receiptImages[]', {
                uri: image.uri,
                type: 'image/jpeg',
                name: `receipt_${Date.now()}_${index}.jpg`,
            });
        });

        // Log the count and paths of new design images
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
                navigation.navigate('StatusHome');
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


    const renderContactItem = ({ item }) => {
        const displayName = item.displayName || `${item.givenName || ""} ${item.familyName || ""}`.trim();

        return item.phoneNumbers.length > 0 ? (
            <TouchableOpacity
                onPress={() => selectContact(item)}
                style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: '#ddd',
                    width: '100%',
                }}
            >
                <Text style={{ fontSize: 16, color: "black" }}>{displayName || "Unnamed Contact"}</Text>
                <Text style={{ color: '#666' }}>{item.phoneNumbers[0]?.number || "No Number"}</Text>
            </TouchableOpacity>
        ) : null;
    };

    const selectContact = (contact) => {
        if (contact.phoneNumbers.length > 0) {
            setMobile(contact.phoneNumbers[0].number.replace(/[^0-9+]/g, ''));
            setModalVisible(false);
        } else {
            Alert.alert('No Phone Number', 'This contact does not have a phone number.');
        }
    };


    const options = [
        { label: "Gold", image: require("../../assets/gold_bar_shie.png") },
        { label: "Silver", image: require("../../assets/silver_compressed.png") },
        { label: "Mix", image: require("../../assets/mix.png") },
    ];

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

                    <View style={{
                        height: 50,
                        borderColor: '#d4af37',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        marginBottom: 15,
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: 'center'
                    }}>
                        <TextInput
                            placeholder="Mobile Number"
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="number-pad"
                            maxLength={15}
                            placeholderTextColor="#999"
                            style={{ width: "85%", color: "black" }}
                        />
                        <TouchableOpacity onPress={openPhoneBook} style={{ width: "15%", justifyContent: "center", alignItems: "center", borderColor: "gray", borderLeftWidth: 1 }}>
                            <Image source={phoneBook} style={{ height: 35, width: 35 }} />
                        </TouchableOpacity>
                    </View>



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


                    <TouchableOpacity onPress={() => setOrderDateOpen(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 10, borderRadius: 7, borderColor: "#d4af37", borderWidth: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                            {orderDate ? <Text style={{ color: "black", fontWeight: "600" }}>{orderDate.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}</Text> : <Text style={{ color: "gray" }}>Eg. 20/12/2024 (Order)</Text>}
                            <Image source={calanderLogo} style={{ height: 25, width: 25 }} />
                        </View>
                    </TouchableOpacity>

                    <DatePicker
                        modal
                        title={"Select Order Date"}
                        theme='dark'
                        mode='date'
                        open={isOrderDateOpen}
                        date={orderDate || new Date()}
                        onConfirm={(date) => {
                            setOrderDateOpen(false);
                            setOrderDate(date);
                        }}
                        onCancel={() => {
                            setOrderDateOpen(false);
                        }}
                    />

                    <TouchableOpacity onPress={() => setDeliveryDateOpen(true)} style={{ backgroundColor: "#f0f0f0", padding: 10, marginVertical: 10, borderRadius: 7, borderColor: "#d4af37", borderWidth: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                            {deliveryDate ? <Text style={{ color: "black", fontWeight: "600" }}>{deliveryDate.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}</Text> : <Text style={{ color: "gray" }}>Eg. 20/12/2024 (Delivery)</Text>}
                            <Image source={calanderLogo} style={{ height: 25, width: 25 }} />
                        </View>
                    </TouchableOpacity>

                    <DatePicker
                        modal
                        title={"Select Delivery Date"}
                        mode='date'
                        theme='dark'
                        open={isDeliveryDateOpen}
                        date={deliveryDate || new Date()}
                        onConfirm={(date) => {
                            setDeliveryDateOpen(false);
                            setDeliveryDate(date);
                        }}
                        onCancel={() => {
                            setDeliveryDateOpen(false);
                        }}
                    />




                    <View style={{ paddingBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                onPress={() => setMetal(option.label)}
                                style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
                            >
                                <View
                                    style={{
                                        height: 20,
                                        width: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: "#000",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginRight: 5,
                                    }}
                                >
                                    {metal === option.label && (
                                        <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5,
                                                backgroundColor: "#000",
                                            }}
                                        />
                                    )}
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: "600", color: "black" }}>{option.label}</Text>
                                <Image
                                    source={option.image}
                                    style={{ width: 30, height: 30, }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View>
                        {metal === "Gold" && (
                            <View>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={goldGrams ? goldGrams.toString() : ""}
                                    onChangeText={setGoldGrams}
                                    placeholder="Gold (grams)"
                                    placeholderTextColor="#999"

                                />
                            </View>
                        )}
                        {metal === "Silver" && (
                            <View>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={silverGrams ? silverGrams.toString() : ""}
                                    onChangeText={setSilverGrams}
                                    placeholder="Silver (grams)"
                                    placeholderTextColor="#999"

                                />
                            </View>
                        )}
                        {metal === "Mix" && (
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ width: "45%" }}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={goldGrams ? goldGrams.toString() : ""}
                                        onChangeText={setGoldGrams}
                                        placeholder="Gold (grams)"
                                        placeholderTextColor="#999"

                                    />
                                </View>

                                <View style={{ width: "45%" }}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={silverGrams ? silverGrams.toString() : ""}
                                        onChangeText={setSilverGrams}
                                        placeholder="Silver (grams)"
                                        placeholderTextColor="#999"

                                    />
                                </View>
                            </View>
                        )}
                    </View>


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
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: '80%',
                            backgroundColor: 'white',
                            borderRadius: 8,
                            padding: 20,
                            maxHeight: "80%"

                        }}
                    >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "gray" }}>Select Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Image source={closeLogo} style={{ height: 30, width: 30 }} />
                            </TouchableOpacity>

                        </View>

                        <TextInput
                            placeholder="Search contacts"
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor={"gray"}
                            style={{
                                width: '100%',
                                padding: 10,
                                marginBottom: 15,
                                borderColor: '#ddd',
                                borderWidth: 1,
                                borderRadius: 8,
                                backgroundColor: '#f0f0f0',
                                color: "black"
                            }}
                        />


                        <FlatList
                            data={filteredContacts}
                            keyExtractor={(item) => item.recordID}
                            renderItem={renderContactItem}
                        />

                    </View>
                </View>
            </Modal>

            {
                loadingContacts ? (<View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>) : <></>
            }

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
});

export default EditInvoiceFilter;
