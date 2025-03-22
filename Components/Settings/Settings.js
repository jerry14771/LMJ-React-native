import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Header from '../Common/Header';
import config from '../../config';
import ToggleSwitch from 'toggle-switch-react-native'
import { TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';



const Settings = () => {
    const [userimg, setuserImg] = useState(null);
    const navigation = useNavigation()
    const edit = require("../../assets/pencil.png")
    const cameralogo = require("../../assets/camera.png");
    const [data, setData] = useState();
    const signalError = require('../../assets/signal.png');
    const loadingGIF = require("../../assets/loader.gif");
    const [isOn, setIsOn] = useState(null);
    const showIcon = require('../../assets/eye.png');
    const hideIcon = require('../../assets/hidden.png');
    const [showPassword, setShowPassword] = useState(false);
    const [staffUserName, setStaffUserName] = useState(null);
    const [staffPassword, setStaffPassword] = useState(null);




    useFocusEffect(
        React.useCallback(() => {
            const fetchid = async () => {
                const storedUserId = await AsyncStorage.getItem('userId');
            }
            fetchid();
            fetchUserDetail();
            getStaffStatus();
            getStaffCredential();
        }, [])
    );

    const getStaffStatus = async () => {
        const url = config.BASE_URL + 'getStaffStatus.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(),
        });
        const result = await response.json();
        if (result.code == 200) {
            setIsOn(true)
        }
        else {
            setIsOn(false)
        }
    }

    const getStaffCredential = async () => {
        const url = config.BASE_URL + 'getStaffCredential.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            }),
        });
        const result = await response.json();
        if (result.status == 200) {
            setStaffUserName(result.data.user_name);
            setStaffPassword(result.data.password);

        }
        else {
            console.log("something went wrong");
        }

    }


    const fetchUserDetail = async () => {
        const url = config.BASE_URL + 'adminDetail.php';
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
        }
    }

    const changeStaffStatus = async (status) => {
        const url = config.BASE_URL + 'toggleAdminStatus.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "status": status ? 'yes' : 'no'
            }),
        });
        const result = await response.json();
        if (result.status == "success") {
        }
        else {
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
            uploadImage(image);

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
            uploadImage(image);
        });
    };



    const uploadImage = async (image) => {
        const formData = new FormData();
        formData.append('profile_pic', {
            uri: image.path,
            type: image.mime,
            name: `profile_${Date.now()}.jpg`,
        });

        const response = await fetch(config.BASE_URL + 'updateProfilePic.php', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const result = await response.json();

        if (result.status === "success") {
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Image uploaded successfully!',
            });
            fetchUserDetail();
        } 

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
            }
        }

        if (userimg) {
            changeProfilePic()
        }
    }, [userimg])



    const updateStaffCredential = async () => {
        const url = config.BASE_URL + 'updateStaffCredential.php';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_name": staffUserName,
                "password": staffPassword
            }),
        })
        .then((response) => response.json())
        .then((result) => {
            if (result.code == "200") {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Staff credentials updated successfully!',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: result.message || 'Update failed!',
                });
            }
        })
        .catch((error) => {
            console.error("Error updating staff credentials:", error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Something went wrong. Please try again.',
            });
        });
    };
    
    



    if (data) {
        return (
            <View style={{ flex: 1 }}>
                <Header />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ backgroundColor: "black", justifyContent: "space-evenly", alignItems: "center", gap: 15, paddingVertical: 10, marginBottom: 10 }}>
                        <View style={{ alignItems: "flex-end", width: "90%" }}>
                            {/* <TouchableOpacity onPress={moveToEditPage}>
                                <Image source={edit} style={{ height: 25, width: 25 }} />
                            </TouchableOpacity> */}
                        </View>
                        <View style={{ padding: 5, backgroundColor: "#d4af37", borderRadius: 80 }}>
                            <Image source={{ uri: data.profile_pic ? config.BASE_URL + data.profile_pic : "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={{ height: 150, width: 150, borderRadius: 75 }} />
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
                    {
                        isOn != null ?

                            <ToggleSwitch
                                isOn={isOn}
                                onColor="green"
                                offColor="red"
                                label="Staff Status"
                                labelStyle={{ color: "black", fontWeight: "900" }}
                                size="medium"
                                onToggle={newValue => {
                                    setIsOn(newValue);
                                    changeStaffStatus(newValue);
                                }}
                            /> : ""
                    }

                    <View>

                        <View style={{ borderColor: "gray", borderWidth: 1, borderRadius: 5, margin: 10, padding: 5 }}>
                            <Text style={{ color: "gray" }}>UserName</Text>
                            <TextInput value={staffUserName} onChangeText={(text) => setStaffUserName(text)} style={{ padding: 0, fontSize: 18, fontWeight: "600", color: "black" }} />
                        </View>
                        <View style={{ borderColor: "gray", borderWidth: 1, borderRadius: 5, margin: 10, padding: 5 }}>
                            <Text style={{ color: "gray" }}>Password</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ width: "80%" }}>
                                    <TextInput onChangeText={(text) => setStaffPassword(text)} value={staffPassword} secureTextEntry={!showPassword} style={{ color: "black", padding: 0, fontSize: 18, fontWeight: "600" }} />
                                </View>
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Image source={showPassword ? showIcon : hideIcon} style={{ height: 20, width: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <TouchableOpacity onPress={updateStaffCredential} style={{ backgroundColor: "red", padding: 10, justifyContent: "center", alignItems: "center", width: 150, borderRadius: 5 }}>
                                <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Update</Text>
                            </TouchableOpacity>
                        </View>

                    </View>



                </ScrollView>
            </View>
        )
    }
}

export default Settings