import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, ScrollView, Button, Linking } from 'react-native';
import React, { useState } from 'react';
import ImageView from 'react-native-image-viewing';
import config from '../../config';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';


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
    const handleImagePress = (index) => {
        setSelectedImageIndex(index);
        setIsVisible(true);
    };

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
        const url = config.BASE_URL + 'deleteCompleteInvoice.php'; // Change to your actual delete endpoint
        const formData = new FormData();
        formData.append('id', invoiceID);

        const response = await fetch(url, { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === "success") {
            navigation.navigate("InvoiceHome");
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{invoice.name}</Text>
                    <TouchableOpacity onPress={deleteCompleteRecord}>
                        <Image source={binLogo} style={styles.binLogo} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5 }}>
                    <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Mobile: </Text>
                    <TouchableOpacity style={{ flexDirection: "row", gap: 10, alignItems: "center" }} onPress={() => Linking.openURL(`tel:${invoice.mobile}`)}>
                        <Text style={{ fontSize: 16, fontWeight: "normal", color: "white" }}>{invoice.mobile}</Text>
                        <Image source={phoneLogo} style={{ height: 25, width: 25 }} />
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
                </View>
                <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Description: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{invoice.description}</Text></Text>
                <Text style={[styles.detail, { fontSize: 18, fontWeight: "bold" }]}>Date: <Text style={{ fontSize: 16, fontWeight: "normal" }}>{formatDate(invoice.createdAt)}</Text></Text>

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

                <Modal transparent={true} visible={confirmationVisible} animationType="slide" onRequestClose={() => setConfirmationVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Are you sure you want to delete this image?</Text>
                            <View style={styles.modalButtonContainer}>
                                <Button title="Cancel" onPress={() => setConfirmationVisible(false)} color="#d4af37" />
                                <Button title="Okay" onPress={confirmDeleteImage} color="#d4af37" />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* New Delete Confirmation Modal */}
                <Modal transparent={true} visible={deleteConfirmationVisible} animationType="slide" onRequestClose={() => setDeleteConfirmationVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Are you sure you want to delete this invoice?</Text>
                            <View style={styles.modalButtonContainer}>
                                <Button title="Cancel" onPress={() => setDeleteConfirmationVisible(false)} color="#d4af37" />
                                <Button title="Okay" onPress={confirmDeleteRecord} color="#d4af37" />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContainer: {
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
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
});

export default InvoiceDetail;
