import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, ScrollView, TouchableWithoutFeedback } from "react-native";
import Header from "../Common/Header";

const hindiMonths = ["सावन", "भादों", "आश्विन", "कार्तिक", "अग्रहायण", "पौष", "माघ", "फाल्गुन", "चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़"];
const hindiYears = ["१४३०", "१४३१", "१४३२", "१४३३", "१४३४", "१४३५", "१४३६", "१४३७", "१४३८", "१४३९", "१४४०"];
const hindiDates = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२", "१३", "१४", "१५", "१६", "१७", "१८", "१९", "२०", "२१", "२२", "२३", "२४", "२५", "२६", "२७", "२८", "२९", "३०", "३१"];
const books = ["B*A", "B*K*J", "बिना पुरज़ा"];

const AddBandhak = () => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [goldSelected, setGoldSelected] = useState(false);
    const [silverSelected, setSilverSelected] = useState(false);
    const [goldWeight, setGoldWeight] = useState("");
    const [silverWeight, setSilverWeight] = useState("");
    const [amountGiven, setAmountGiven] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const selectValue = (value) => {
        if (modalType === "date") setSelectedDate(value);
        if (modalType === "month") setSelectedMonth(value);
        if (modalType === "year") setSelectedYear(value);
        if (modalType === "books") setSelectedBook(value);
        setModalVisible(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <View style={{ flex: 1 }}>
                <ScrollView style={{ padding:15 }}>
                    <TouchableOpacity style={[styles.input, { justifyContent: "center" }]} onPress={() => openModal("books")}>
                        <Text style={{ color: selectedBook === null ? "gray" : "black" }}>{selectedBook || "किताब का चयन करें"}</Text>
                    </TouchableOpacity>

                    <TextInput style={styles.input} placeholder="नाम दर्ज करें" placeholderTextColor="gray" />

                    <TextInput style={styles.input} placeholder="पुरज़ी नंबर दर्ज करें" placeholderTextColor="gray" keyboardType="numeric" />

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity style={[styles.checkbox, goldSelected && styles.ifselected]} onPress={() => setGoldSelected(!goldSelected)}>
                            <Text style={[styles.checkboxText, goldSelected && styles.selectedCheckbox]}>सोना</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.checkbox, , silverSelected && styles.ifselected]} onPress={() => setSilverSelected(!silverSelected)}>
                            <Text style={[styles.checkboxText, silverSelected && styles.selectedCheckbox]}>चाँदी</Text>
                        </TouchableOpacity>
                    </View>

                    {goldSelected && (
                        <TextInput
                            style={styles.input}
                            placeholder="सोने का वज़न"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            value={goldWeight}
                            onChangeText={setGoldWeight}
                        />
                    )}
                    {silverSelected && (
                        <TextInput
                            style={styles.input}
                            placeholder="चाँदी का वज़न"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            value={silverWeight}
                            onChangeText={setSilverWeight}
                        />
                    )}

                    <TextInput style={[styles.input,styles.textArea]} placeholder="विवरण दर्ज करें" placeholderTextColor="gray" multiline />


                    <TextInput
                        style={styles.input}
                        placeholder="राशि दर्ज करें"
                        placeholderTextColor="gray"
                        keyboardType="numeric"
                        value={amountGiven}
                        onChangeText={setAmountGiven}
                    />

                    <View style={styles.dateContainer}>
                        <TouchableOpacity style={styles.dateBox} onPress={() => openModal("date")}>
                            <Text style={{ color: selectedDate === null ? "gray" : "black" }}>{selectedDate || "तारीख"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dateBox} onPress={() => openModal("month")}>
                            <Text style={{ color: selectedMonth === null ? "gray" : "black" }}>{selectedMonth || "महीना"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dateBox} onPress={() => openModal("year")}>
                            <Text style={{ color: selectedYear === null ? "gray" : "black" }}>{selectedYear || "वर्ष"}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitText}>Save</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <Modal visible={modalVisible} transparent >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <FlatList
                                    data={modalType == "books" ? books :
                                        modalType === "date"
                                            ? hindiDates
                                            : modalType === "month"
                                                ? hindiMonths
                                                : hindiYears
                                    }
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
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, },
    label: { fontSize: 16, color: "#000", marginTop: 10 },
    checkboxContainer: { flexDirection: "row", marginBottom: 10, width: "100%", justifyContent: "space-between" },
    checkbox: { padding: 10, borderWidth: 1, borderColor: "#d4af37", borderRadius: 10, marginRight: 10, width: "48%" },
    checkboxText: { color: "gray" },
    selectedCheckbox: { color: "white" },
    dateContainer: { flexDirection: "row", justifyContent: "space-between", width:"100%" },
    dateBox: { borderWidth: 1, borderColor: "#d4af37", borderRadius: 10, padding: 10, width:"30%" },
    submitButton: { backgroundColor: "#d4af37", padding: 15, borderRadius: 10, marginTop: 20, alignItems: "center" },
    submitText: { color: "#fff", fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", maxHeight: "60%" },
    modalItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#d4af37" },
    input: {
        height: 50,
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
        color: '#333',
    },
    ifselected: {
        backgroundColor: "#d4af37",
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
      },
});

export default AddBandhak;
