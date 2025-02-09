import { View, Text, Image, TouchableOpacity, StatusBar, Modal, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = (props) => {
    const hamburger = require('../../assets/more.png');
    const logoutLogo = require('../../assets/switch.png');
    const logo = require('../../assets/logo.png');
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleConfirm = async () => {
        await AsyncStorage.clear();

        setModalVisible(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };


    return (
        <View style={{ backgroundColor: 'black', justifyContent: "space-between", alignItems: "center", flexDirection: 'row', paddingHorizontal: 15 }}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ height: 65, width: 35, justifyContent: "center" }} >
                <Image
                    source={hamburger}
                    style={{ height: 25, width: 25 }}
                />
            </TouchableOpacity>

            <View>
                <Image source={logo} style={{ height: 65, width: 65 }} />
            </View>

            {
                props.id ? (
                    <View style={{ backgroundColor:"red", height:"50%", padding:5, borderRadius:4 }}>
                        <Text style={{ color: "white", fontSize:16, fontWeight:"600" }}>{props.id}</Text>
                    </View>
                ) :
                    <View>
                        <Text>           </Text>
                    </View>

            }

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure?</Text>
                        <Text style={styles.modalMessage}>You will be redirected to login !</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                                <Text style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "gray"
    },
    modalMessage: {
        marginVertical: 10,
        textAlign: 'center',
        color: "gray"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 10,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#ccc',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: 'white',
    },
});

export default Header