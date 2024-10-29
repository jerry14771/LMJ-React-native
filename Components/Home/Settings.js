import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Header from './Header';

const Settings = () => {
    const [userimg, setuserImg] = useState(null);
    const navigation = useNavigation()
    const edit = require("../../assets/pencil.png")
    const cameralogo = require("../../assets/camera.png");
    const [data, setData] = useState();
    const signalError = require('../../assets/signal.png');
    const loadingGIF = require("../../assets/loader.gif");

    useFocusEffect(
        React.useCallback(() => {
            const fetchid = async () => {
                const storedUserId = await AsyncStorage.getItem('userId');
            }
            fetchid();
            fetchUserDetail();
        }, [])
    );

    const fetchUserDetail = async () => {
        const url = 'https://sharmaglass.in/LMJ/adminDetail.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(),
        });
        const result = await response.json();
        if (result.status == "success") {
            setData(result.data)
            console.log(result)
        }
    }

    const moveToEditPage = () => {
        navigation.navigate("EditProfile", {
            firstName: data.member_name, middleName: data.member_middel_name
        })
    }

    const onSelectImage = async () => {
        Alert.alert('Choose Medium', 'Choose option', [
            {
                text: 'Camera',
                onPress: () => onCamera(),
            },
            {
                text: 'Gallery',
                onPress: () => onGallery(),
            },
            {
                text: 'Cancel',
                onPress: () => { },
            },
        ]);
    };

    const onCamera = () => {
        ImagePicker.openCamera({
            width: 500,
            height: 500,
            cropping: true,
            includeBase64: true,
        }).then(image => {
            setuserImg(image)

        });
    };

    const onGallery = () => {
        ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
            includeBase64: true,
        }).then(image => {
            setuserImg(image)
        });
    };

    useEffect(() => {
        const changeProfilePic = async () => {
            const userImageToSend = userimg ? 'data:' + userimg.mime + ';base64,' + userimg.data : null;
            const url = 'https://trust.webmastersinfotech.in/api/update_profile/update_member_image.php';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: userImageToSend }),
            });
            const result = await response.json();
            if (result.code == 200) {
                setuserImg(null);
                fetchUserDetail();
            }
            else {
                console.log(result)
            }
        }

        if (userimg) {
            changeProfilePic()
        }
    }, [userimg])



    if (data) {
        return (
            <View style={{ flex: 1 }}>
                <Header />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ backgroundColor: "black", justifyContent: "space-evenly", alignItems: "center", gap: 15, paddingVertical: 10 }}>
                        <View style={{ alignItems: "flex-end", width: "90%" }}>
                            <TouchableOpacity onPress={moveToEditPage}>
                                <Image source={edit} style={{ height: 25, width: 25 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 5, backgroundColor: "#d4af37", borderRadius: 80 }}>
                            <Image source={{ uri: data.profile_pic ? data.profile_pic : "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={{ height: 150, width: 150, borderRadius: 75 }} />
                            <TouchableOpacity onPress={onSelectImage} activeOpacity={0.5}
                                style={{
                                    position: 'absolute',
                                    bottom: 5,
                                    right: 5,
                                    backgroundColor: 'white',
                                    borderRadius: 20,
                                    padding: 7,
                                    marginRight: 5,
                                    marginBottom: 5,
                                }}
                            >
                                <Image source={cameralogo} style={{ height: 22, width: 22 }} />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{ color: "white", fontSize: 25, fontWeight: "700" }}>
                                {data.admin_name ? data.admin_name : "Anjani Gandola"}
                            </Text>
                        </View>
                        <View style={{ gap: 10, }}>
                            <Text style={{ color: "white", fontSize: 20, fontWeight: "500" }}>{data.shop_name ? data.shop_name : "Laxmi Manohar Jewellers"}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default Settings