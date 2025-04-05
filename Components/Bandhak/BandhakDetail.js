import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolateColor } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from '../Common/Header';
import config from '../../config';
import Toast from 'react-native-toast-message';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;


const BandhakDetail = () => {
  const route = useRoute();
  const id = route.params.id;
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const statuses = ['Rakhti', 'Chutti'];
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const translateX = useSharedValue(0);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);


  const fetchBandhakDetail = async () => {
    const url = `${config.BASE_URL}fetchBandhak.php`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (result.status === "success") {
      setData(result.data[0]);
      setCurrentStatusIndex(result.data[0].status == "Rakhti" ? 0 : 1)
    }
  }

  useEffect(() => {
    fetchBandhakDetail();
  }, [])

  const statusColors = {
    Rakhti: '#FFA500', Chutti: '#32CD32'
  };

  const callStatusChangeAPI = async (newStatus, id) => {
    const url = `${config.BASE_URL}updateBandhakStatus.php`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, currentStatus: newStatus }),
    });
    const result = await response.json();
    if (result.status === "success") {
      setData(result.data[0]);
      setCurrentStatusIndex(result.data[0].status == "Rakhti" ? 0 : 1)
    }
  }

  const updateStatus = (direction) => {
    setCurrentStatusIndex((prevIndex) => {
      const newIndex = Math.min(Math.max(prevIndex + direction, 0), statuses.length - 1);
      if (newIndex !== prevIndex) {
        const newStatus = statuses[newIndex];
        callStatusChangeAPI(newStatus, id);
      }
      return newIndex;
    });
  };


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

  const deleteCompleteRecord = () => {
    setDeleteConfirmationVisible(true);
  };


  const handleDelete = async () => {
    const url = `${config.BASE_URL}deleteBandhak.php`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (result.status === "success") {
      setDeleteConfirmationVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success 🎉',
        text2: `Deleted Bandhak successfully 👍`,
      });
      navigation.navigate('ListAllBandak');
    } else {
      setDeleteConfirmationVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Error ❌',
        text2: result.message || 'Failed to delete Bandhak',
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp !== "string") return "";

    const [datePart, timePart] = timestamp.split(" ");
    if (!datePart || !timePart) return "";

    const [year, month, day] = datePart.split("-");
    let [hour, minute] = timePart.split(":");

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[parseInt(month, 10) - 1];

    hour = parseInt(hour, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const formattedHour = hour.toString().padStart(2, "0");

    return `${day} ${monthName} ${year} (${formattedHour}:${minute} ${period})`;
  };

  const handleEdit = () => {
    navigation.navigate('AddBandhak', { data });
  };

  if (!data) {
  }
  else {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Header />
        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.title}>📜 Bandhak Details</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Book:</Text>
              <Text style={styles.value}>{data.book_name ?? ""}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{data.name ?? ""} ({data.father_name ?? ""})</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Mobile:</Text>
              <Text style={styles.value}>{data.mobile_no ?? ""}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Purja No:</Text>
              <Text style={styles.value}>{data.purja_no ?? ""}</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.description}>{data.address ?? ""}</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.description}>{data.description ?? ""}</Text>
            </View>
            <View style={styles.rowContainer}>
              <View style={styles.sectionHalf}>
                <Text style={styles.label}>🥇 Gold:</Text>
                <Text style={styles.value}>{data.gold_weight ? data.gold_weight + ' g' : "NA"}</Text>
              </View>
              <View style={styles.sectionHalf}>
                <Text style={styles.label}>🥈 Silver:</Text>
                <Text style={styles.value}>{data.silver_weight ? data.silver_weight + ' g' : "NA"}</Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>💰 Amount Given:</Text>
              <Text style={styles.value}>₹{data.amount_given ?? ""}</Text>
            </View>
            <View style={styles.rowContainer}>
              <View style={styles.sectionHalf}>
                <Text style={styles.label}>📆 Hindi Date:</Text>
                <Text style={styles.value}>{data.hindi_date ?? ""} {data.hindi_month ?? ""} {data.hindi_year ?? ""}</Text>
              </View>
              <View style={styles.sectionHalf}>
                <Text style={styles.label}>📅 English Date:</Text>
                <Text style={styles.value}>{data.englishDate ? formatDate(data.englishDate) : ""}</Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>🕒 Created At:</Text>
              <Text style={styles.value}>{data.created_at ? formatTimestamp(data.created_at) : ""}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.buttonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={deleteCompleteRecord}>
                <Text style={styles.buttonText}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.swipeableContainer, animatedStyle2]}>
              <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[styles.statusItem, animatedStyle]}>
                  <Text style={styles.currentStatus}>{statuses[currentStatusIndex]}</Text>
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </View>
        </ScrollView>
        <Modal transparent={true} visible={deleteConfirmationVisible} animationType="slide" onRequestClose={() => setDeleteConfirmationVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete this invoice?</Text>
              <View style={styles.modalButtonContainer}>
                <Button title="Cancel" onPress={() => setDeleteConfirmationVisible(false)} color="#d4af37" />
                <Button title="Yes" onPress={handleDelete} color="#d4af37" />
              </View>
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHalf: {
    width: '48%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 14,
  },
  value: {
    color: '#222',
    fontSize: 16,
  },
  descriptionBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  description: {
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#eef',
    borderRadius: 10,
    marginVertical: 10,
  },
  statusChangeButton: {
    backgroundColor: '#ffcc00',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  statusChangeText: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeableContainer: {
    width: SCREEN_WIDTH * 0.95,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 10
  },
  statusItem: {
    width: '30%',
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
});

export default BandhakDetail;
