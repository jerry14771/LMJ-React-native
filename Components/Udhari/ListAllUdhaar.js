import { View, Text, FlatList, TouchableOpacity, Image, Modal, Pressable, Linking } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import Header from '../Common/Header'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import config from '../../config'
import { TextInput } from 'react-native-gesture-handler'
import LottieView from 'lottie-react-native';
import ImageView from 'react-native-image-viewing';
import Share from 'react-native-share';


const ListAllUdhaar = () => {
  const [data, setData] = useState(null);
  const [visible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);



  const deletelogo = require("../../assets/delete2.png");
  const editlogo = require("../../assets/pen.png");
  const sharelogo = require("../../assets/share.png");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const navigation = useNavigation();

  const fetchTodaysUdhari = async () => {
    const url = `${config.BASE_URL}fetchAllUdhari.php`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(),
    });
    const result = await response.json();
    if (result.status == "success") {
      setData(result.data);
      setFilteredData(result.data);
    }
  };
  //   const handleShare = async (item) => {
  //     try {
  //       const message = `
  // 🧾 *Udhaar Details*

  // 👤 Name: ${item.name}
  // 📞 Mobile: ${item.mobile}
  // 🏠 Address: ${item.address}
  // 🧾 Billing Amount: ₹${item.totalAmount}
  // ✅ Paid Amount: ₹${item.amountGiven}
  // 💰 Remaining: ₹${item.totalAmount - item.amountGiven}
  // 📅 Udhar Date: ${new Date(item.udharDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
  // 📅 Chukti Date: ${new Date(item.chuktiDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
  // 📝 Description: ${item.description || 'N/A'}
  //     `;

  //       await Share.share({
  //         message,
  //       });
  //     } catch (error) {
  //       console.log('Sharing failed:', error.message);
  //     }
  //   };


  const handleShare = async (item) => {

    let imagesPath = (selectedImages.map(img => img.uri).join('\n\n'))


    try {
      const message = `
🧾 Udhaar Details
👤 Name: ${item.name}
📞 Mobile: ${item.mobile}
🏠 Address: ${item.address}
🧾 Billing Amount: ₹${item.totalAmount}
✅ Paid Amount: ₹${item.amountGiven}
💰 Remaining: ₹${item.totalAmount - item.amountGiven}
📅 Udhar Date: ${new Date(item.udharDate).toLocaleDateString('en-GB')}
📅 Chukti Date: ${new Date(item.chuktiDate).toLocaleDateString('en-GB')}
📝 Description: ${item.description || 'N/A'}
${imagesPath}

`;

      const shareOptions = {
        title: 'Share Udhaar Details',
        message,
        social: Share.Social.WHATSAPP, // optional (remove if sharing everywhere)
      };

      await Share.open(shareOptions);

    } catch (error) {
      if (error?.message !== 'User did not share') {
        console.log('Share error:', error);
      }
    }
  };


  const confirmDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}deleteUdhaar.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedIdToDelete }),
      });

      const result = await response.json();
      if (result.status === "success") {
        const updated = filteredData.filter(item => item.id !== selectedIdToDelete);
        setFilteredData(updated);
        setData(prev => prev.filter(item => item.id !== selectedIdToDelete));
      } else {
        Alert.alert("Error", "Failed to delete the record.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setShowDeleteModal(false);
      setSelectedIdToDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        marginVertical: 6,
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {/* Top Section: Name & Date */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: '#6c757d' }}>
          {new Date(item.udharDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Billing Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: "#dfe3e8", borderRadius: 5 }}>

        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 4 }}>
            Billing Amount: <Text style={{ fontWeight: '700', color: '#e76f51' }}>₹{item.totalAmount}</Text>
          </Text>
          <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 4 }}>
            Paid Amount: <Text style={{ fontWeight: '700', color: '#2a9d8f' }}>₹{item.amountGiven}</Text>
          </Text>
          <Text style={{ fontSize: 14, color: '#6c757d' }}>
            Remaining: <Text style={{ fontWeight: '700', color: '#f4a261' }}>₹{item.totalAmount - item.amountGiven}</Text>
          </Text>
        </View>
        <View style={{ height: 80, width: 80 }}>
          {item.receiptImages && JSON.parse(item.receiptImages).length > 0 && (
            <TouchableOpacity
              onPress={() => {
                const imagesArray = JSON.parse(item.receiptImages).map(img => ({
                  uri: `${config.BASE_URL}/${img}`
                }));

                setSelectedImages(imagesArray);
                setShowGalleryModal(true);   // 👈 open gallery modal
              }}
            >
              <Image
                source={{
                  uri: `${config.BASE_URL}/${JSON.parse(item.receiptImages)[0]}`
                }}
                style={{ height: 80, width: 80, borderRadius: 8 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contact Details */}
      <View style={{ marginBottom: 8 }}>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.mobile}`)} style={{ marginBottom: 2 }}>
          <Text style={{ fontSize: 13, color: '#495057', }}> 📞 Mobile: <Text style={{ fontWeight: '600', color: '#1a1a1a' }}>{item.mobile}</Text></Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 13, color: '#495057', marginBottom: 2 }}>
          🏠 Address: <Text style={{ fontWeight: '600', color: '#1a1a1a' }}>{item.address}</Text>
        </Text>
        <Text style={{ fontSize: 13, color: '#495057', marginBottom: 2 }}>
          📅 Chukti Date: <Text style={{ fontWeight: '600', color: '#1a1a1a' }}> {new Date(item.chuktiDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
        </Text>
      </View>

      {/* Description */}
      {item.description ? (
        <View style={{ paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e9ecef', marginTop: 8, borderBottomWidth: 1, borderBottomColor: '#e9ecef' }}>
          <Text style={{ fontSize: 13, color: '#6c757d', paddingBottom: 5 }}>
            📝 Description: <Text style={{ fontWeight: '500', color: '#1a1a1a' }}>{item.description}</Text>
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", marginTop: 7, }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddUdhari', { udhariData: item })}
          style={{ borderRightWidth: 1, borderTopColor: '#e9ecef', width: "33%", alignItems: "center" }}
        >
          <Image source={editlogo} style={{ height: 20, width: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity style={{ borderRightWidth: 1, borderTopColor: '#e9ecef', width: "33%", alignItems: "center" }} onPress={() => confirmDelete(item.id)}>
          <Image source={deletelogo} style={{ height: 20, width: 20 }} />
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: "center", width: "33%" }} onPress={() => handleShare(item)}>
          <Image source={sharelogo} style={{ height: 20, width: 20 }} />
        </TouchableOpacity>
      </View>


    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchTodaysUdhari();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerText = text.toLowerCase();
    const filtered = data.filter(item =>
      item.name?.toLowerCase().includes(lowerText) ||
      item.address?.toLowerCase().includes(lowerText)
    );
    setFilteredData(filtered);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Header />
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <TextInput
          placeholder='Search'
          value={searchQuery}
          onChangeText={handleSearch}
          selectionColor={"red"}
          placeholderTextColor={'gray'}
          style={{
            color: "black",
            backgroundColor: "#f8f9fa",
            borderRadius: 10,
            paddingLeft: 15,
            borderColor: "gray",
            borderWidth: 1
          }}
        />

      </View>
      {
        data && data.length == 0 ? (<View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={{ height: 400, aspectRatio: 1 }}>
            <LottieView style={{ flex: 1 }} source={require('../../assets/Animation - 1739937488069.json')} autoPlay loop />
          </View>
        </View>) :
          (<FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
          )

      }

      <ImageView
        images={selectedImages}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />

      <Modal
        visible={showDeleteModal}
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 25,
            borderRadius: 15,
            width: '80%',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 15, color: '#555', marginBottom: 20 }}>Are you sure you want to delete this record?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#333' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={performDelete}
                style={{
                  backgroundColor: '#e63946',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGalleryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGalleryModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'   // blur-like dark overlay
        }}>
          <View style={{
            width: '90%',
            height: '50%',
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 15
          }}>

            <FlatList
              data={selectedImages}
              numColumns={3}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentIndex(index);
                    setIsVisible(true);
                  }}
                  style={{ flex: 1 / 3, padding: 5 }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ height: 90, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />

            <Pressable
              onPress={() => setShowGalleryModal(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 15
              }}
            >
              <Text style={{ fontSize: 16 }}>Close</Text>
            </Pressable>

          </View>
        </View>
      </Modal>


    </View>
  )
}

export default ListAllUdhaar