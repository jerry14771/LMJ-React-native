import { View, Text, Image, TouchableOpacity, StatusBar, FlatList, StyleSheet } from 'react-native';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from './Header';
import LottieView from 'lottie-react-native';


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
    const nameLogo = require('../../assets/driving_license.png');
    const pricelist = require('../../assets/price_list.png');
    const valueRef = useRef('');
    const [data, setData] = useState(null);

    const fetchTodaysOrder = async () => {
        valueRef.current = "order";
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
    const fetchTodaysDelivery = async () => {
        valueRef.current = "delivery";
        const url = `${config.BASE_URL}fetchTodaysDelivery.php`;
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
            if (valueRef.current == "delivery") {
                fetchTodaysDelivery();
            }
            else {
                fetchTodaysOrder();
            }
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })} style={{ margin: 10 }}>
            <View style={styles.card}>
                <TriangleCorner text={item.invoice_number} />
                {/* <TriangleCorner text="1223" /> */}

                <Image source={pricelist} style={styles.image} />
                <View style={{ flexShrink: 1 }}>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                        <Text style={styles.nameText}>
                            Name: <Text style={styles.boldText}>{item.name}</Text>
                        </Text>
                        <View
                            style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: item.metal == "Gold" ? "gold" : item.metal == "Silver" ? "#C0C0C0" : item.metal == "Mix" ? "red" : "blue", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                {item.metal == "Gold" ? "G" : item.metal == "Silver" ? "S" : item.metal == "Mix" ? "M" : "U"}
                            </Text>
                        </View>

                    </View>
                    <Text style={styles.amountText}>
                        Billing Amount: <Text style={styles.boldAmountText}>₹{item.totalAmount}</Text>
                    </Text>
                    <Text style={styles.amountText}>
                        Paid Amount: <Text style={styles.boldAmountText}>₹{item.amountGiven}</Text>
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <Text style={styles.mobileText}>Status: </Text>
                        <Text style={{ padding: 5, backgroundColor: item.status == "Completed" ? '#32CD32' : item.status == "Pending" ? "#FFA500" : item.status == "Ongoing" ? '#1E90FF' : '#FFD700', borderRadius: 5, color: "white", fontWeight: "700", fontSize: 9 }}>{item.status}</Text>
                    </View>
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
                    onPress={() => navigation.navigate("ListAllOrder")}
                >
                    <Image source={nameLogo} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>List All Orders (Filters)</Text>
                </TouchableOpacity>

            </View>


            <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-evenly', }}>

                <TouchableOpacity style={valueRef.current != "delivery" ? styles.titleContainerActive : styles.titleContainer} onPress={fetchTodaysOrder} >
                    <Text style={valueRef.current != "delivery" ? styles.titleTextActive : styles.titleText}>Today's Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity style={valueRef.current == "delivery" ? styles.titleContainerActive : styles.titleContainer} onPress={fetchTodaysDelivery}>
                    <Text style={valueRef.current == "delivery" ? styles.titleTextActive : styles.titleText}>Today's Delivery</Text>
                </TouchableOpacity>
            </View>


            {
               data && data.length ==0 ? (<View style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ height: 400, aspectRatio: 1 }}>
                        <LottieView style={{ flex: 1 }} source={require('../../assets/Animation - 1739937488069.json')} autoPlay loop />
                    </View>
                </View>) :
                    (<FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                    />)

            }






            {/* <View style={{ backgroundColor:"#00ffee", justifyContent:"center", height:30, alignItems:"center", display:"flex"}}><Text style={{ color:"black" }}>Legend Here</Text></View> */}
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
        marginTop: 5,
        justifyContent: 'space-evenly',
    },
    touchable: {
        width: "45%",
        backgroundColor: "white",
        borderRadius: 5,
        shadowColor: "red",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        alignItems: "center",
        height: 110,
        justifyContent: "center"
    },
    buttonImage: {
        height: 50,
        width: 50,
    },
    buttonText: {
        textAlign: "center",
        color: "black",
        fontSize: 16,
        fontWeight: "600"
    },
    titleContainer: {
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 5,
        padding: 5,
        width: "45%"
    },
    titleContainerActive: {
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 5,
        padding: 5,
        width: "45%",
        backgroundColor: "#044780"
    },
    titleText: {
        fontSize: 16,
        color: "black",
        fontWeight: "600",
    },
    titleTextActive: {
        fontSize: 16,
        color: "white",
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
        fontSize: 13,
        fontWeight: "600",
        // marginBottom: 4,
    },
    boldText: {
        color: "#555",
        fontSize: 15,
        fontWeight: "700",
    },
    amountText: {
        color: "#333",
        fontSize: 13,
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
        fontSize: 13,
        fontWeight: "600",
        // marginBottom: 4,
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
