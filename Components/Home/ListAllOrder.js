import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, Modal, Button, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './Header';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import debounce from 'lodash.debounce';

const ListAllOrder = () => {
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterOption, setFilterOption] = useState('name');
    const [filterText, setFilterText] = useState('');
    const [filterDate, setFilterDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [activityStatus, setActivityStatus] = useState(false);
    const [listRefState, setListRefState] = useState("")

    const pricelist = require('../../assets/price_list.png');

    const fetchAllOrder = useCallback(async () => {
        setActivityStatus(true);
        const url = `${config.BASE_URL}listAllOrder.php`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(),
        });
        const result = await response.json();
        if (result.status === 'success') {
            setData(result.data);
            setFilteredData(result.data); // Set initial full data
        }
        setActivityStatus(false);
    }, []);

    useEffect(() => {
        fetchAllOrder();
    }, [fetchAllOrder]);

    const filterData = (text = filterText, date = filterDate, status = statusFilter) => {
        let filtered = data;
    
        if (filterOption !== 'status' && filterOption !== 'delivery_date') {
            setFilteredData(data);
        }
    
        if (text) {
            filtered = filtered.filter((item) => {
                const valueToFilter = (item[filterOption] || '').toString().toLowerCase();
                return valueToFilter.includes(text.toLowerCase());
            });
        }
    
        if (date) {
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.deliveryDate).toISOString().split('T')[0];
                const filterFormattedDate = date.toISOString().split('T')[0];
                return itemDate === filterFormattedDate;
            });
        }
    
        if (status && status !== 'all') {
            filtered = filtered.filter((item) => item.status.toLowerCase() === status.toLowerCase());
        }
        setFilteredData(filtered);
    };
    

    const debouncedFilterData = useCallback(
        debounce((text, date, status) => {
            filterData(text, date, status);
        }, 300),
        [filterData]
    );

    const handleTextChange = (text) => {
        setFilterText(text);
        debouncedFilterData(text, filterDate, statusFilter);
    };

    const TriangleCorner = ({ text }) => (
        <View style={styles.ribbonContainer}>
            <View style={styles.triangleCorner} />
            <Text style={styles.ribbonText}>{text}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => {
                setListRefState(item.id); 
                navigation.navigate('InvoiceDetail', { invoice: item });
            }} 
            style={{ margin: 10 }}
        >
            <View style={[styles.card, { backgroundColor: listRefState === item.id ? "#b8f5e9" : "#ffffff" }]}>
                <TriangleCorner text={item.invoice_number} />
                <Image source={pricelist} style={styles.image} />
                <View style={{ flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                        <Text style={styles.nameText}>
                            Name: <Text style={styles.boldText}>{item.name}</Text>
                        </Text>
                        <View style={{
                            height: 20, width: 20, borderRadius: 20,
                            backgroundColor: item.metal === "Gold" ? "gold" :
                                            item.metal === "Silver" ? "#C0C0C0" :
                                            item.metal === "Mix" ? "red" : "blue",
                            justifyContent: "center", alignItems: "center"
                        }}>
                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                {item.metal === "Gold" ? "G" :
                                 item.metal === "Silver" ? "S" :
                                 item.metal === "Mix" ? "M" : "U"}
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
                        <Text style={{
                            padding: 5,
                            backgroundColor: item.status === "Completed" ? '#32CD32' :
                                             item.status === "Pending" ? "#FFA500" :
                                             item.status === "Ongoing" ? '#1E90FF' : '#FFD700',
                            borderRadius: 5, color: "white", fontWeight: "700", fontSize: 9
                        }}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );




    return (
        <View style={{ flex: 1 }}>
            <Header />
            <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                <Text style={{ color: 'gray', fontSize: 16, fontWeight: '700' }}>Select filter:</Text>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={filterOption}
                        onValueChange={(itemValue) => {
                            setFilterOption(itemValue);
                            setFilteredData(data);
                            setStatusFilter('all');
                            // filterData(filterText, filterDate, statusFilter);
                        }}
                        style={{ color: 'black' }}
                    >
                        <Picker.Item label="Name" value="name" />
                        <Picker.Item label="Address" value="address" />
                        <Picker.Item label="Order Number" value="invoice_number" />
                        <Picker.Item label="Delivery Date" value="delivery_date" />
                        <Picker.Item label="Status" value="status" />
                    </Picker>
                </View>

                {filterOption === 'delivery_date' ? (
                    <View style={{ marginTop: 10 }}>
                        <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
                        {filterDate && (
                            <Text style={{ marginTop: 10, color: 'gray' }}>
                                Selected Date: {filterDate.toDateString()}
                            </Text>
                        )}
                        <DatePicker
                            modal
                            open={showDatePicker}
                            date={filterDate || new Date()}
                            mode="date"
                            onConfirm={(date) => {
                                setShowDatePicker(false);
                                setFilterDate(date);
                                filterData(filterText, date, statusFilter);
                            }}
                            onCancel={() => setShowDatePicker(false)}
                        />
                    </View>
                ) : filterOption === 'status' ? (
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={statusFilter}
                            onValueChange={(itemValue) => {
                                setStatusFilter(itemValue);
                                filterData(filterText, filterDate, itemValue);
                            }}
                            style={{ color: 'black' }}
                        >
                            <Picker.Item label="All" value="all" />
                            <Picker.Item label="Pending" value="pending" />
                            <Picker.Item label="Ongoing" value="ongoing" />
                            <Picker.Item label="Completed" value="completed" />
                            <Picker.Item label="Delivered" value="delivered" />
                        </Picker>
                    </View>
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder={
                            filterOption !== 'invoice_number' ? `Enter ${filterOption}` : `Enter order number`
                        }
                        value={filterText}
                        onChangeText={handleTextChange}
                        placeholderTextColor={'gray'}
                    />
                )}
            </View>
            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />

            {activityStatus && (
                <View style={styles.activityOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    picker: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
        marginTop: 5,
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 10,
        backgroundColor: '#ffffff',
        color: "#333",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        color: 'black',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: "#ffffff",
        marginVertical: 5,
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
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
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    boldText: {
        color: "#555",
        fontSize: 16,
        fontWeight: "700",
    },
    amountText: {
        color: "#333",
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,

    },
    boldMobileText: {
        color: "#555",
        fontSize: 16,
        fontWeight: "500",
    },
    reciptStatus: {
        color: "#555",
        fontSize: 12,
        fontWeight: "700",
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "black",
        padding: 5
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
    activityOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

});


export default ListAllOrder;
