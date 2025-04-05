import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, TextInput, Image, Animated, Dimensions } from 'react-native'
import React, { useState, useRef } from 'react'
import CheckBox from "@react-native-community/checkbox";
import HeaderWithCollapse from '../Common/HeaderWithCollapse';
import ListComponent from './ListComponent';
import LottieView from 'lottie-react-native';
import config from '../../config';

const AdvanceFilter = () => {
    const books = ["B*A", "B*K*J", "Bina Purza", "B*K"];
    const [data, setData] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [name, setName] = useState(null);
    const [fatherName, setfatherName] = useState(null);
    const [address, setAddress] = useState(null);
    const [minamount, setMinAmount] = useState(null);
    const [maxamount, setMaxAmount] = useState(null);
    const [status, setStatus] = useState(null);
    const statuses = ["Pending", "Completed"];


    const [goldMinWeight, setGoldMinWeight] = useState("");
    const [goldMaxWeight, setGoldMaxWeight] = useState("");
    const [silverMinWeight, setSilverMinWeight] = useState("");
    const [silverMaxWeight, setSilverMaxWeight] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");
    const [isGoldSelected, setIsGoldSelected] = useState(false);
    const [isSilverSelected, setIsSilverSelected] = useState(false);
    const GoldLogo = require("../../assets/gold_bar_shie.png");
    const SilverLogo = require("../../assets/silver_compressed.png");
    const screenHeight = Dimensions.get("window").height * 0.9;
    const heightAnim = useRef(new Animated.Value(screenHeight)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const rotateAnimation = () => {
        Animated.parallel([
            Animated.timing(rotateAnim, {
                toValue: isVisible ? 1 : 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });


    const selectValue = (value) => {
        if (modalType === "books") setSelectedBook(value);
        else if (modalType === "status") setStatus(value);
        setModalVisible(false);
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const toggleVisible = () => {
        setIsVisible(!isVisible);

        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: isVisible ? 0 : screenHeight,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
                toValue: isVisible ? 0 : 1,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start();
    };


    const search = () => {
        toggleVisible();
        rotateAnimation();
        hitSearchAPI();
    }


    const hitSearchAPI = async () => {
        
        const url = `${config.BASE_URL}advanceSearchBandhak.php`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedBook, name, fatherName, address, minamount, maxamount, goldMinWeight, goldMaxWeight, silverMaxWeight, silverMinWeight,isGoldSelected,isSilverSelected, status }),
        });
        const result = await response.json();
        if (result.status == "success") {
            setData(result.data);
        }
        else {
            setData(null);

        }
    }

    return (
        <View style={styles.container}>
            <HeaderWithCollapse toggleVisible={toggleVisible} isVisible={isVisible} rotateAnimation={rotateAnimation} rotateInterpolate={rotateInterpolate} />
            <Animated.View
                style={{
                    height: heightAnim,
                    opacity: opacityAnim,
                    overflow: "hidden",
                    backgroundColor: "white"
                }}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>📜 Bandhak Filter</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity style={[styles.input, { justifyContent: "center", width: "70%", backgroundColor: "#e6e3e1", paddingHorizontal: 5, borderRadius: 5 }]} onPress={() => openModal("books")}>
                            <Text style={{ color: selectedBook === null ? "gray" : "black" }}>{selectedBook || "Choose Book"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} onPress={() => setSelectedBook(null)}>
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TextInput placeholder='Name' style={{ backgroundColor: "#e6e3e1", width: "70%", paddingHorizontal: 5, paddingVertical: 0, borderRadius: 5, color:"black" }} placeholderTextColor={"gray"} onChangeText={(txt) => setName(txt)} value={name} />
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }}  onPress={()=>setName('')}>
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TextInput placeholder='Father/Husband Name' style={{ backgroundColor: "#e6e3e1", width: "70%", paddingHorizontal: 5, paddingVertical: 0, borderRadius: 5,color:"black" }} placeholderTextColor={"gray"} onChangeText={(txt) => setfatherName(txt)} value={fatherName}/>
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} onPress={()=>setfatherName('')}>
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TextInput placeholder='Address' style={{ color:"black",backgroundColor: "#e6e3e1", width: "70%", paddingHorizontal: 5, paddingVertical: 0, borderRadius: 5 }} placeholderTextColor={"gray"} onChangeText={(txt) => setAddress(txt)} value={address} />
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} onPress={()=>setAddress('')}>
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%" }}>

                            <TextInput placeholder='Min Amount' style={{color:"black", backgroundColor: "#e6e3e1", width: "45%", paddingHorizontal: 5, paddingVertical: 0, borderRadius: 5 }} placeholderTextColor={"gray"} onChangeText={(txt) => setMinAmount(txt)} keyboardType='numeric' value={minamount} />

                            <TextInput placeholder='Max Amount' style={{color:"black", backgroundColor: "#e6e3e1", width: "45%", paddingHorizontal: 5, paddingVertical: 0, borderRadius: 5 }} placeholderTextColor={"gray"} onChangeText={(txt) => setMaxAmount(txt)} keyboardType='numeric' value={maxamount} />
                        </View>
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} onPress={()=>{setMinAmount(null);setMaxAmount(null)}}>
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%" }}>
                            {/* Gold */}
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={() => setIsGoldSelected(!isGoldSelected)}
                            >
                                <CheckBox
                                    value={isGoldSelected}
                                    onValueChange={() => setIsGoldSelected(!isGoldSelected)}
                                    tintColors={{ false: "black" }}
                                />
                                <Image source={GoldLogo} style={{ height: 22, width: 25 }} />
                                <Text style={{ color: "black", fontSize: 13 }}>Gold</Text>
                            </TouchableOpacity>

                            {/* Silver */}
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={() => setIsSilverSelected(!isSilverSelected)}
                            >
                                <CheckBox
                                    value={isSilverSelected}
                                    onValueChange={() => setIsSilverSelected(!isSilverSelected)}
                                    tintColors={{ false: "black" }}
                                />
                                <Image source={SilverLogo} style={{ height: 22, width: 22 }} />
                                <Text style={{ color: "black", fontSize: 13 }}>Silver</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Clear Button */}
                        <TouchableOpacity
                            style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }}
                            onPress={() => {
                                setIsGoldSelected(false);
                                setIsSilverSelected(false);
                                setGoldMinWeight("");
                                setGoldMaxWeight("");
                                setSilverMinWeight("");
                                setSilverMaxWeight("");
                            }}
                        >
                            <Text style={{ color: "white" }}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gold Inputs */}
                    {isGoldSelected && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%" }}>
                                <TextInput
                                    placeholder="Min Gold"
                                    style={styles.inputStyle}
                                    placeholderTextColor="gray"
                                    value={goldMinWeight}
                                    onChangeText={setGoldMinWeight}
                                    keyboardType='numeric'

                                />
                                <TextInput
                                    placeholder="Max Gold"
                                    style={styles.inputStyle}
                                    placeholderTextColor="gray"
                                    value={goldMaxWeight}
                                    onChangeText={setGoldMaxWeight}
                                    keyboardType='numeric'
                                />
                            </View>
                            <TouchableOpacity onPress={() => { setGoldMaxWeight(null); setGoldMinWeight(null); }} style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} >
                                <Text style={{ color: "white" }}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Silver Inputs */}
                    {isSilverSelected && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%" }}>
                                <TextInput
                                    placeholder="Min Silver"
                                    style={styles.inputStyle}
                                    placeholderTextColor="gray"
                                    value={silverMinWeight}
                                    onChangeText={setSilverMinWeight}
                                    keyboardType='numeric'

                                />
                                <TextInput
                                    placeholder="Max Silver"
                                    style={styles.inputStyle}
                                    placeholderTextColor="gray"
                                    value={silverMaxWeight}
                                    onChangeText={setSilverMaxWeight}
                                    keyboardType='numeric'

                                />
                            </View>
                            <TouchableOpacity onPress={() => { setSilverMaxWeight(null); setSilverMinWeight(null); }} style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} >
                                <Text style={{ color: "white" }}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    )}

<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <TouchableOpacity
        style={[styles.input, { justifyContent: "center", width: "70%", backgroundColor: "#e6e3e1", paddingHorizontal: 5, borderRadius: 5 }]}
        onPress={() => openModal("status")}
    >
        <Text style={{ color: status === null ? "gray" : "black" }}>{status || "Choose Status"}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{ padding: 5, backgroundColor: "red", borderRadius: 5 }} onPress={() => setStatus(null)}>
        <Text style={{ color: "white" }}>Clear</Text>
    </TouchableOpacity>
</View>


                    <View style={{ alignItems: "flex-start", marginTop: 15 }}>
                        <TouchableOpacity onPress={search} style={{ paddingHorizontal: 20, paddingVertical: 5, borderRadius: 5, backgroundColor: "#1e3a8a" }}><Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Filter</Text></TouchableOpacity>
                    </View>

                </View>
            </Animated.View>

            {
                data && data.length == 0 ? (<View style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ height: 400, aspectRatio: 1 }}>
                        <LottieView style={{ flex: 1 }} source={require('../../assets/Animation - 1739937488069.json')} autoPlay loop />
                    </View>
                </View>) :
                    (<FlatList
                        data={data}
                        renderItem={({ item, index }) => (
                            <ListComponent book_name={item.book_name} id={item.id} purzinumber={item.purja_no} name={item.name} address={item.address} amount={item.amount_given} englishDate={item.englishDate} goldWeight={item.gold_weight} silverWeight={item.silver_weight} status={item.status} />
                          )}
                        keyExtractor={(item) => item.id.toString()}
                    />)

            }

            <Modal visible={modalVisible} transparent >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <FlatList
                                        data={modalType === "books" ? books : statuses}
                                    keyExtractor={(item) => item.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.modalItem} onPress={() => selectValue(item.toString())}>
                                            <Text style={{ color: "black" }}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>

            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    card: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        elevation: 5,
        gap: 10
    },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", maxHeight: "60%" },
    modalItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#d4af37" },
    inputStyle: {
        backgroundColor: "#e6e3e1",
        width: "45%",
        paddingHorizontal: 5,
        paddingVertical: 0,
        borderRadius: 5,
        color: "black"
    }

});

export default AdvanceFilter