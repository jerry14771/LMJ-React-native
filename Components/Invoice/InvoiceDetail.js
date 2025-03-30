import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, ScrollView, Button, Linking } from 'react-native';
import React, { useState } from 'react';
import ImageView from 'react-native-image-viewing';
import config from '../../config';
import Header from '../Common/Header';
import { useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Animated, {useSharedValue,useAnimatedStyle,withSpring,runOnJS,interpolateColor} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native'


const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const statuses = ['Pending', 'Ongoing', 'Completed', 'Delivered'];
const statusColors = {Pending: '#FFA500',Ongoing: '#1E90FF',Completed: '#32CD32',Delivered: '#FFD700',
};

const InvoiceDetail = ({ route }) => {
    const { invoice } = route.params;
    const [visible, setIsVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
    const [relativePath, setRelativePath] = useState('');
    const [designImages, setDesignImages] = useState(JSON.parse(invoice.designImages).map(image => ({ uri: `${config.BASE_URL}${image}` })));
    const [receiptImages, setReceiptImages] = useState(JSON.parse(invoice.receiptImages).map(image => ({ uri: `${config.BASE_URL}${image}` })));
    const invoiceID = invoice.id;
    const binLogo = require("../../assets/delete.png");
    const phoneLogo = require('../../assets/phone_call.png');
    const navigation = useNavigation();
    const shareLogo = require("../../assets/share.png");
    const editLogo = require("../../assets/pen.png");
    const [currentStatusIndex, setCurrentStatusIndex] = useState(invoice.status=="Pending"?0:invoice.status=="Ongoing"?1:invoice.status=="Completed"?2:3);
    const translateX = useSharedValue(0);
    const [isOn, setIsOn] = useState(invoice.staffAccess=="yes"?true:false);


    const handleImagePress = (index) => {
        setSelectedImageIndex(index);
        setIsVisible(true);
    };

    const editDetails = () =>{
        navigation.navigate("EditInvoice",{invoice:invoice})
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const time = `${formattedHours}:${formattedMinutes} ${ampm}`;
        const optionsDate = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
        return `${formattedDate.replace(/,/, '')} (${time})`;
    };

    const deleteSingleImage = (image) => {
        const path = image.uri.replace(config.BASE_URL, "");
        setRelativePath(path);
        setConfirmationVisible(true);
    };

    const confirmDeleteImage = async () => {
        setConfirmationVisible(false);
        const url = config.BASE_URL + 'deleteSingleImage_Order.php';
        const formData = new FormData();
        formData.append('imagePath', relativePath);
        formData.append('id', invoiceID);

        const response = await fetch(url, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === "success") {
            const isDesignImage = relativePath.startsWith('uploads/designs/');
            if (isDesignImage) {
                setDesignImages(prev => prev.filter(img => img.uri !== `${config.BASE_URL}${relativePath}`));
            } else {
                setReceiptImages(prev => prev.filter(img => img.uri !== `${config.BASE_URL}${relativePath}`));
            }
        }
    };

    const deleteCompleteRecord = () => {
        setDeleteConfirmationVisible(true);
    };

    const confirmDeleteRecord = async () => {
        setDeleteConfirmationVisible(false);
        const url = config.BASE_URL + 'deleteCompleteInvoice.php';
        const formData = new FormData();
        formData.append('id', invoiceID);

        const response = await fetch(url, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === "success") {
            navigation.navigate("InvoiceHome");
        }
    };

    const runShare = async () => {
        try {
            const currentDate = formatDate(new Date().toISOString());

            const designImageLinks = designImages.map(img => img.uri).join('\n\n');
            const receiptImageLinks = receiptImages.map(img => img.uri).join('\n\n');

            const shareMessage = `Invoice Details:
        \nName: ${invoice.name}
        \nDate: ${currentDate}
        \nOrder Date: ${formatOrderAndDeliveryDate(invoice.orderDate)}
        \nDeliver Date: ${formatOrderAndDeliveryDate(invoice.deliveryDate)}
        \nMobile: ${invoice.mobile}
        \nAddress: ${invoice.address}
        \nTotal Amount: ₹${parseInt(invoice.totalAmount)}
        \nPaid Amount: ₹${parseInt(invoice.amountGiven)}
        \nRemaining Amount: ₹${parseInt(invoice.totalAmount) - parseInt(invoice.amountGiven)}
        \nDescription: ${invoice.description}
        
        \nDesign Images:\n${designImageLinks}
        
        \nReceipt Images:\n${receiptImageLinks}`;

            // Prepare all image URIs for sharing
            const allImages = [...designImages, ...receiptImages].map(img => img.uri);

            const shareOptions = {
                title: 'Share Invoice Details',
                message: shareMessage,
                urls: allImages,  // Include all images in the share options
                social: Share.Social.WHATSAPP,
            };

            // Attempt to share using react-native-share
            const result = await Share.open(shareOptions);

            if (result.success) {
            }
        } catch (error) {
            if (error.message !== 'User did not share') {
            }
        }
    };

    const formatOrderAndDeliveryDate = (dateString) => {
        const date = new Date(dateString);
        const optionsDate = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
        return `${formattedDate.replace(/,/, '')}`;
    };

    const updateStatus = (direction) => {
        setCurrentStatusIndex((prevIndex) => {
            const newIndex = Math.min(Math.max(prevIndex + direction, 0), statuses.length - 1);
            if (newIndex !== prevIndex) {
                const newStatus = statuses[newIndex];
                callStatusChangeAPI(newStatus,invoiceID);
            }
            return newIndex;
        });
    };


    const callStatusChangeAPI = async(status,invoiceID) =>{
        const url = `${config.BASE_URL}updateOrderStatus.php`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"receiptID":invoiceID, "currentStatus":status}),
        });
        const result = await response.json();
        if (result.message == 'Order status updated successfully') {
            Toast.show({
                type: 'success',
                text1: 'Success 🎉',
                text2: 'Order status updated successfully 👍',
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.error || 'Failed to update order status',
            });
        }
    }

    const swipeGesture = Gesture.Pan().onUpdate((event) => {
            translateX.value = event.translationX;
        }).onEnd(() => {
            if (translateX.value < -SWIPE_THRESHOLD && currentStatusIndex > 0) {
                runOnJS(updateStatus)(-1);
            } else if (translateX.value > SWIPE_THRESHOLD && currentStatusIndex < statuses.length - 1) {
                runOnJS(updateStatus)(1);
            }
            translateX.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedStyle2 = useAnimatedStyle(() => {
        const nextIndex = translateX.value < 0
            ? Math.min(currentStatusIndex + 1, statuses.length - 1)
            : Math.max(currentStatusIndex - 1, 0);

        const backgroundColor = interpolateColor(
            translateX.value,
            [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
            [
                statusColors[statuses[nextIndex]],
                statusColors[statuses[currentStatusIndex]],
                statusColors[statuses[nextIndex]],
            ]
        );
        return {
            backgroundColor,
        };
    });

    const changeStaffStatusRecipt = async (status) => {
        const url = config.BASE_URL + 'toggleReciptStatus.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "status":status ? 'yes' : 'no',
                "id":invoiceID
            }),
        });
        const result = await response.json();
        if (result.status == "success") {
        }
        else{
        }

    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Header id={invoice.invoice_number} />
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                            <View><Text style={styles.title}>{invoice.name}</Text></View>
                        <ToggleSwitch
                        isOn={isOn}
                        onColor="green"
                        offColor="red"
                        label="Staff Status"
                        labelStyle={{ color: "black", fontWeight: "900" }}
                        size="medium"
                        onToggle={newValue => {
                            setIsOn(newValue);
                            changeStaffStatusRecipt(newValue);
                        }}
                    />

                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5 }}>
                        <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Mobile: </Text>
                        <TouchableOpacity style={{ flexDirection: "row", gap: 10, alignItems: "center" }} onPress={() => Linking.openURL(`tel:${invoice.mobile}`)}>
                            <Text style={{ fontSize: 16, fontWeight: "normal", color: "white" }}>{invoice.mobile}</Text>
                            <Image source={phoneLogo} style={{ height: 22, width: 22 }} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Address: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{invoice.address}</Text></Text>
                    <View style={styles.amountContainer}>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountText}>Total Amount:</Text>
                            <Text style={styles.amountValue}>₹ {parseInt(invoice.totalAmount)}</Text>
                        </View>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountText}>Paid Amount:</Text>
                            <Text style={styles.paidValue}>₹ {parseInt(invoice.amountGiven)}</Text>
                        </View>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountText}>Remaining Amount:</Text>
                            <Text style={styles.remainingValue}>₹ {parseInt(invoice.totalAmount) - parseInt(invoice.amountGiven)}</Text>
                        </View>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountText}>Gold</Text>
                            <Text style={styles.goldAndSilverText}>{parseFloat(invoice.gold_grams).toFixed(3)} gms</Text>
                        </View>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountText}>Silver</Text>
                            <Text style={styles.goldAndSilverText}>{(invoice.silver_grams==0) || (invoice.silver_grams=="0") ?"N/A":invoice.silver_grams + "gms"} </Text>
                        </View>
                    </View>
                    <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Description: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{invoice.description}</Text></Text>
                    <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Order Date: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{formatOrderAndDeliveryDate(invoice.orderDate)}</Text></Text>
                    <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Delivery Date: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{formatOrderAndDeliveryDate(invoice.deliveryDate)}</Text></Text>

                    <Text style={styles.imageLabel}>Design Images:</Text>
                    {designImages.map((image, index) => (
                        <TouchableOpacity key={index} onPress={() => handleImagePress(index)} onLongPress={() => deleteSingleImage(image)}>
                            <Image source={{ uri: image.uri }} style={styles.image} />
                        </TouchableOpacity>
                    ))}

                    <Text style={styles.imageLabel}>Receipt Images:</Text>
                    {receiptImages.map((image, index) => (
                        <TouchableOpacity key={index} onPress={() => handleImagePress(designImages.length + index)} onLongPress={() => deleteSingleImage(image)}>
                            <Image source={{ uri: image.uri }} style={styles.image} />
                        </TouchableOpacity>
                    ))}

                    <ImageView images={[...designImages, ...receiptImages]} imageIndex={selectedImageIndex} visible={visible} onRequestClose={() => setIsVisible(false)} />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity onPress={editDetails} style={{ backgroundColor: "white", justifyContent: "center", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Image source={editLogo} style={styles.binLogo} />
                            <Text style={{ color: "black", fontSize: 18, fontWeight: "700" }}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={deleteCompleteRecord} style={{ backgroundColor: "white", justifyContent: "center", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Image source={binLogo} style={styles.binLogo} />
                            <Text style={{ color: "black", fontSize: 18, fontWeight: "700" }}>Delete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={runShare} style={{ backgroundColor: "white", justifyContent: "center", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Image source={shareLogo} style={{ height: 30, width: 30 }} />
                            <Text style={{ color: "black", fontSize: 18, fontWeight: "700" }}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: "flex-end", padding: 10 }}><Text style={{ color: "white", fontSize: 12 }} >Created on : {formatDate(invoice.createdAt)}</Text></View>


                    <Animated.View style={[styles.swipeableContainer, animatedStyle2]}>
                        <GestureDetector gesture={swipeGesture}>
                            <Animated.View style={[styles.statusItem, animatedStyle]}>
                                <Text style={styles.currentStatus}>{statuses[currentStatusIndex]}</Text>
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>



                    <Modal transparent={true} visible={confirmationVisible} animationType="slide" onRequestClose={() => setConfirmationVisible(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalText}>Are you sure you want to delete this image?</Text>
                                <View style={styles.modalButtonContainer}>
                                    <Button title="Cancel" onPress={() => setConfirmationVisible(false)} color="#d4af37" />
                                    <Button title="Yes" onPress={confirmDeleteImage} color="#d4af37" />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal transparent={true} visible={deleteConfirmationVisible} animationType="slide" onRequestClose={() => setDeleteConfirmationVisible(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalText}>Are you sure you want to delete this invoice?</Text>
                                <View style={styles.modalButtonContainer}>
                                    <Button title="Cancel" onPress={() => setDeleteConfirmationVisible(false)} color="#d4af37" />
                                    <Button title="Yes" onPress={confirmDeleteRecord} color="#d4af37" />
                                </View>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>

            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContainer: {
        padding: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
    },
    binLogo: {
        height: 30,
        width: 30,
    },
    detail: {
        fontSize: 16,
        color: '#ffffff',
    },
    amountContainer: {
        borderWidth: 1,
        borderColor: '#d4af37',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#1a1a1a',
        marginBottom: 15,
    },
    amountText: {
        fontSize: 16,
        color: '#ffffff',
    },
    amountValue: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    paidValue: {
        color: '#66fc03',
        fontWeight: 'bold',
    },
    remainingValue: {
        color: '#ff1f40',
        fontWeight: 'bold',
    },
    goldAndSilverText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imageLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#ffffff',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#d4af37',
        backgroundColor: '#1a1a1a',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#ffffff',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    swipeableContainer: {
        // position: 'absolute',
        // bottom: 20,
        width: SCREEN_WIDTH * 0.95,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    statusItem: {
        width: '25%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        backgroundColor: 'white',
    },
    currentStatus: {
        color: 'black',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default InvoiceDetail;
