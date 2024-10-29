import { View, Text, Image, TouchableOpacity, StatusBar, FlatList, StyleSheet } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from './Header';

// TriangleCorner Component
const TriangleCorner = ({ text }) => {
    return (
        <View style={styles.ribbonContainer}>
            <View style={styles.triangleCorner} />
            <Text style={styles.ribbonText}>{text}</Text>
        </View>
    );
};

const InvoiceHome = () => {
    const navigation = useNavigation();
    const invoice = require('../../assets/invoice.png');
    const dateLogo = require('../../assets/timetable.png');
    const mobileLogo = require('../../assets/mobile_app.png');
    const nameLogo = require('../../assets/driving_license.png');
    const pricelist = require('../../assets/price_list.png');

    const [data, setData] = useState(null);

    const fetchTodaysOrder = async () => {
        const url = `${config.BASE_URL}fetchTodaysInvoice.php`;
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
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTodaysOrder();
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })} style={{ margin: 10 }}>
            <View style={styles.card}>
                <TriangleCorner text={item.invoice_number} />
                {/* <TriangleCorner text="1223" /> */}
                
                <Image source={pricelist} style={styles.image} />
                <View style={{ flexShrink: 1 }}>
                    <Text style={styles.nameText}>
                        Name: <Text style={styles.boldText}>{item.name}</Text>
                    </Text>
                    <Text style={styles.amountText}>
                        Billing Amount: <Text style={styles.boldAmountText}>₹{item.totalAmount}</Text>
                    </Text>
                    <Text style={styles.amountText}>
                        Paid Amount: <Text style={styles.boldAmountText}>₹{item.amountGiven}</Text>
                    </Text>
                    <Text style={styles.mobileText}>
                        Mobile: <Text style={styles.boldMobileText}>{item.mobile}</Text>
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Header />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => navigation.navigate("AddInvoice")}
                >
                    <Image source={invoice} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Create Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => {/* Add your navigation here */ }}
                >
                    <Image source={dateLogo} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Search By Date</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => {/* Add your navigation here */ }}
                >
                    <Image source={mobileLogo} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Search By Mobile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => {/* Add your navigation here */ }}
                >
                    <Image source={nameLogo} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Search By Name</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Today's Orders</Text>
            </View>

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
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
        marginTop: 20,
        justifyContent: 'space-evenly',
    },
    touchable: {
        width: "22%",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 5,
        shadowColor: "red",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        alignItems: "center",
    },
    buttonImage: {
        height: 40,
        width: 40,
    },
    buttonText: {
        textAlign: "center",
        color: "black",
    },
    titleContainer: {
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 5,
        padding: 5,
    },
    titleText: {
        fontSize: 18,
        color: "black",
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
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    boldText: {
        color: "#555",
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

export default InvoiceHome;
