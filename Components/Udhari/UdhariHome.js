import { View, Text, Image, TouchableOpacity, StatusBar, FlatList, StyleSheet } from 'react-native';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';





const UdhariHome = () => {
    const navigation = useNavigation();
    const borrow = require('../../assets/borrow.png');
    const book = require('../../assets/book.png');
    const pricelist = require('../../assets/price_list.png');
    const valueRef = useRef('');
    const [data, setData] = useState(null);

    const fetchTodaysUdhari = async () => {
        const url = `${config.BASE_URL}fetchTodaysUdhari.php`;
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
            fetchTodaysUdhari();
        }, [])
    );



   const renderItem = ({ item }) => (
  <View
    style={{
      marginVertical: 10,
      marginHorizontal: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    }}
  >
    {/* Top Section: Name & Date */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>{item.name}</Text>
      <Text style={{ fontSize: 12, color: '#6c757d' }}>
        {new Date(item.udharDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
      </Text>
    </View>

    {/* Billing Section */}
    <View style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 4 }}>
        Billing Amount: <Text style={{ fontWeight: '700', color: '#e76f51' }}>₹{item.totalAmount}</Text>
      </Text>
      <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 4 }}>
        Paid Amount: <Text style={{ fontWeight: '700', color: '#2a9d8f' }}>₹{item.amountGiven}</Text>
      </Text>
      <Text style={{ fontSize: 14, color: '#6c757d' }}>
        Remaining: <Text style={{ fontWeight: '700', color: '#f4a261' }}>₹{item.totalAmount - item.amountGiven}</Text>
      </Text>
    </View>

    {/* Contact Details */}
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 13, color: '#495057', marginBottom: 2 }}>
        📞 Mobile: <Text style={{ fontWeight: '600', color: '#1a1a1a' }}>{item.mobile}</Text>
      </Text>
      <Text style={{ fontSize: 13, color: '#495057', marginBottom: 2 }}>
        🏠 Address: <Text style={{ fontWeight: '600', color: '#1a1a1a' }}>{item.address}</Text>
      </Text>
    </View>

    {/* Description */}
    {item.description ? (
      <View style={{ paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e9ecef', marginTop: 8 }}>
        <Text style={{ fontSize: 13, color: '#6c757d' }}>
          📝 Description: <Text style={{ fontWeight: '500', color: '#1a1a1a' }}>{item.description}</Text>
        </Text>
      </View>
    ) : null}
  </View>
);


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Header />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => navigation.navigate("AddUdhari")}
                >
                    <Image source={borrow} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Add Udhaar</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => navigation.navigate("ListAllUdhaar")}
                >
                    <Image source={book} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>All Udhaar</Text>
                </TouchableOpacity>

            </View>



            {
                data && data.length == 0 ? (<View style={{ justifyContent: "center", alignItems: "center" }}>
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
        marginBottom:5
    },
    touchable: {
        width: "42%",
        backgroundColor: "white",
        borderRadius: 5,
        shadowColor: "red",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        alignItems: "center",
        height: 100,
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
        padding: 12,
        borderRadius: 8,
        shadowColor: "red",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
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
        fontSize: 12,
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

export default UdhariHome;
