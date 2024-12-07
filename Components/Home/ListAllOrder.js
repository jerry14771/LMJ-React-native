import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, Modal, Button } from 'react-native';
import React, { useState, useCallback } from 'react';
import Header from './Header';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const ListAllOrder = () => {

    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterOption, setFilterOption] = useState('name');
    const [filterText, setFilterText] = useState('');
    const pricelist = require('../../assets/price_list.png');

    const fetchAllOrder = async () => {
        const url = `${config.BASE_URL}listAllOrder.php`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(),
        });
        const result = await response.json();
        if (result.status == "success") {
            setData(result.data);
            setFilteredData(result.data);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllOrder();
        }, [])
    );

    const filterData = (text) => {
        setFilterText(text);
        if (text === '') {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) => {
                const valueToFilter = item[filterOption].toString().toLowerCase();
                return valueToFilter.includes(text.toLowerCase());
            });
            setFilteredData(filtered);
        }
    };

    const TriangleCorner = ({ text }) => {
        return (
            <View style={styles.ribbonContainer}>
                <View style={styles.triangleCorner} />
                <Text style={styles.ribbonText}>{text}</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })} style={{ margin: 10 }}>
            <View style={styles.card}>
                <TriangleCorner text={item.invoice_number} />
                <Image source={pricelist} style={styles.image} />
                <View style={{ flexShrink: 1, width:"100%"}}>
                    <Text style={styles.nameText}>
                        Name: <Text style={styles.boldText}>{item.name}</Text>
                    </Text>
                    <Text style={styles.amountText}>
                        Billing Amount: <Text style={styles.boldAmountText}>₹{item.totalAmount}</Text>
                    </Text>
                    <Text style={styles.amountText}>
                        Paid Amount: <Text style={styles.boldAmountText}>₹{item.amountGiven}</Text>
                    </Text>
                    <View style={{ flexDirection:"row", justifyContent:"space-between" }}>
                    <Text style={styles.mobileText}>
                        Mobile: <Text style={styles.boldMobileText}>{item.mobile}</Text>
                    </Text>

                    <Text style={styles.reciptStatus}>{item.status}</Text>

                    </View>
                    
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <Header />

            <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                <Text style={{ color: "gray", fontSize: 16, fontWeight: "700" }}>Select filter:</Text>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={filterOption}
                        onValueChange={(itemValue) => setFilterOption(itemValue)}
                        style={{ color:"black" }}
                    >
                        <Picker.Item label="Name" value="name" />
                        <Picker.Item label="Mobile" value="mobile" />
                        <Picker.Item label="Order Number" value="invoice_number" />
                    </Picker>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder={filterOption!='invoice_number'?`Enter ${filterOption}`:`Enter order number`}
                    value={filterText}
                    onChangeText={filterData}
                    placeholderTextColor={"gray"}
                />
            </View>
            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    picker: {
        backgroundColor: '#f9f9f9', // Light neutral background for picker
        borderRadius: 8,
        borderColor: '#ddd', // Light gray border for a soft look
        borderWidth: 1,
        marginTop: 5,
    },
    input: {
        height: 40,
        borderColor: '#ddd', // Matching border color with picker
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 10,
        backgroundColor: '#ffffff', // White background for a clean look
        color: "#333", // Dark text color for good contrast
    },
    // Rest of your styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        color: 'black',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: "#ffffff", // White background for card
        marginVertical: 5,
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
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
        color: "#333", // Darker shade for readability
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    boldText: {
        color: "#555", // Slightly lighter than main text for emphasis
        fontSize: 16,
        fontWeight: "700",
    },
    amountText: {
        color: "#333",
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
       
    },
    boldMobileText: {
        color: "#555",
        fontSize: 16,
        fontWeight: "500",
    },
    reciptStatus: {
        color: "#555",
        fontSize: 12,
        fontWeight: "700",
        borderWidth:1,
        borderRadius:5,
        borderColor:"black",
        padding:5
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
        borderRightWidth: 80,
        borderTopWidth: 60,
        borderRightColor: "transparent",
        borderTopColor: "red",
    },
    ribbonText: {
        position: 'absolute',
        left: 5,
        top: 5,
        fontSize: 15,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});


export default ListAllOrder;
