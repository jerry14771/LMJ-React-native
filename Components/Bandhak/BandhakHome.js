import { View, Text, Image, TouchableOpacity, StatusBar, StyleSheet, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ListComponent from './ListComponent';


const BandhakHome = () => {
    const navigation = useNavigation();
    const goldloan = require('../../assets/goldloan.png');
    const document = require('../../assets/document.png');
    const [data, setData] = useState([]);

    const fetchData = async () => {
          const url = `${config.BASE_URL}getTodaysBandhak.php`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(),
          });
          const result = await response.json();
          if (result.status === "success") {
            setData(result.data);
          } else {
            setData([]);
          }
      };

       useFocusEffect(
          React.useCallback(() => {
            fetchData();
          }, [])
        );
    

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Header />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => navigation.navigate("AddBandhak", { data: null })}
                >
                    <Image source={goldloan} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Create Bandhak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => navigation.navigate("ListAllBandak")}
                >
                    <Image source={document} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>All Bandhak</Text>
                </TouchableOpacity>
            </View>

            {data.length === 0 ? (
                <Text style={styles.noData}>No Record Found</Text>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ListComponent id={item.id} purzinumber={item.purja_no} name={item.name} fatherName={item.father_name} mobile={item.mobile_no} englishDate={item.englishDate} goldWeight={item.gold_weight} silverWeight={item.silver_weight} />
                    )}
                />
            )}
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
    noData: {
        textAlign: "center",
        fontSize: 18,
        color: "gray",
        marginTop: 20,
      },

});

export default BandhakHome;
