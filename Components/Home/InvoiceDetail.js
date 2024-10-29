import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';
import ImageView from 'react-native-image-viewing';
import config from '../../config';
import Header from './Header';

const InvoiceDetail = ({ route }) => {
    const { invoice } = route.params;
    const [visible, setIsVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleImagePress = (index) => {
        setSelectedImageIndex(index);
        setIsVisible(true);
    };

    const designImages = JSON.parse(invoice.designImages).map(image => ({
        uri: `${config.BASE_URL}${image}`,
    }));

    const receiptImages = JSON.parse(invoice.receiptImages).map(image => ({
        uri: `${config.BASE_URL}${image}`,
    }));

    const images = [...designImages, ...receiptImages];

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

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{invoice.name}</Text>
                <Text style={styles.detail}>Mobile: {invoice.mobile}</Text>
                <Text style={styles.detail}>Address: {invoice.address}</Text>
                <Text style={styles.detail}>Total Amount: <Text style={{ color: "black", fontWeight: "600" }}>₹ {invoice.totalAmount}</Text></Text>
                <Text style={styles.detail}>Paid Amount: <Text style={{ color: "green", fontWeight: "600" }}>₹ {invoice.amountGiven}</Text></Text>
                <Text style={styles.detail}>Remaining Amount: <Text style={{ color: "red", fontWeight: "600" }}>₹ {invoice.totalAmount - invoice.amountGiven}</Text></Text>
                <Text style={styles.detail}>Description: {invoice.description}</Text>
                <Text style={styles.detail}>Date: {formatDate(invoice.createdAt)}</Text>

                <Text style={styles.imageLabel}>Design Images:</Text>
                {designImages.map((image, index) => (
                    <TouchableOpacity key={index} onPress={() => handleImagePress(index)}>
                        <Image
                            source={{ uri: image.uri }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                ))}

                <Text style={styles.imageLabel}>Receipt Images:</Text>
                {receiptImages.map((image, index) => (
                    <TouchableOpacity key={index} onPress={() => handleImagePress(designImages.length + index)}>
                        <Image
                            source={{ uri: image.uri }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                ))}

                <ImageView
                    images={images}
                    imageIndex={selectedImageIndex}
                    visible={visible}
                    onRequestClose={() => setIsVisible(false)}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "gray"
    },
    detail: {
        fontSize: 16,
        marginBottom: 8,
        color: "gray"
    },
    imageLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color:"black"
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
});

export default InvoiceDetail;
