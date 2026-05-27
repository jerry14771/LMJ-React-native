import React, { useState, useEffect } from 'react';
import {
  FlatList, Modal, View, TextInput, Text, TouchableOpacity,
  Image, StyleSheet, Alert, ScrollView, Dimensions, StatusBar, Platform
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
import Header from '../Common/Header';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';
import Contacts from 'react-native-contacts';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import C from '../../colorConfig'

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 75) / 3;


// ─── Section Header Component ────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionIconBox}>
      <Text style={s.sectionIconText}>{icon}</Text>
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

// ─── Labeled Input Component ─────────────────────────────────────────────────
const Field = ({ label, icon, style, inputStyle, ...props }) => (
  <View style={[s.fieldWrap, style]}>
    {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
    <View style={s.fieldBox}>
      {icon ? <Text style={s.fieldIcon}>{icon}</Text> : null}
      <TextInput
        style={[s.fieldInput, icon ? { paddingLeft: 4 } : null, inputStyle]}
        placeholderTextColor={C.textMuted}
        {...props}
      />
    </View>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AddInvoice = () => {
  const calanderLogo = require('../../assets/calendar.png');
  const closeLogo = require('../../assets/close.png');
  const phoneBook = require('../../assets/phonebook.png');
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImages, setReceiptImages] = useState([]);
  const [designImages, setDesignImages] = useState([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [amountGiven, setAmountGiven] = useState('');
  const [invoice_number, setinvoice_number] = useState('');
  const [orderDate, setOrderDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [isOrderDateOpen, setOrderDateOpen] = useState(false);
  const [isDeliveryDateOpen, setDeliveryDateOpen] = useState(false);
  const [activity, setActivity] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [metal, setMetal] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');

  useEffect(() => {
    setFilteredContacts(
      search
        ? contacts.filter(c => c.displayName?.toLowerCase().includes(search.toLowerCase()))
        : contacts
    );
  }, [search, contacts]);

  const handleReceiptImageSelection = () =>
    Alert.alert('Upload Receipt', '', [
      { text: 'Camera', onPress: openReceiptCamera },
      { text: 'Gallery', onPress: pickReceiptImage },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const pickReceiptImage = () =>
    ImagePicker.openPicker({ multiple: true, cropping: true })
      .then(imgs => setReceiptImages(p => [...p, ...imgs])).catch(() => { });

  const openReceiptCamera = () =>
    ImagePicker.openCamera({ cropping: true })
      .then(img => setReceiptImages(p => [...p, img])).catch(() => { });

  const handleDesignImageSelection = () =>
    Alert.alert('Upload Design', '', [
      { text: 'Camera', onPress: openDesignCamera },
      { text: 'Gallery', onPress: pickDesignImage },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const pickDesignImage = () =>
    ImagePicker.openPicker({ multiple: true, cropping: true })
      .then(imgs => setDesignImages(p => [...p, ...imgs])).catch(() => { });

  const openDesignCamera = () =>
    ImagePicker.openCamera({ cropping: true })
      .then(img => setDesignImages(p => [...p, img])).catch(() => { });

  const handleRemoveImage = (setter, index) =>
    setter(p => p.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setActivity(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('address', address);
    formData.append('metal', metal);
    formData.append('silvergrams', silverGrams);
    formData.append('goldgrams', goldGrams);
    formData.append('description', description);
    formData.append('totalAmount', totalAmount);
    formData.append('amountGiven', amountGiven);
    formData.append('invoice_number', invoice_number);
    formData.append('orderDate', orderDate?.toISOString() || null);
    formData.append('deliveryDate', deliveryDate?.toISOString() || null);
    receiptImages.forEach((img, i) =>
      formData.append('receiptImages[]', { uri: img.path, type: img.mime, name: `receipt_${Date.now()}_${i}.jpg` })
    );
    designImages.forEach((img, i) =>
      formData.append('designImages[]', { uri: img.path, type: img.mime, name: `design_${Date.now()}_${i}.jpg` })
    );
    try {
      const response = await fetch(config.BASE_URL + 'insertInvoice.php', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const result = await response.json();
      if (result.status === 'success') {
        setName(''); setAddress(''); setMobile(''); setDescription('');
        setAmountGiven(''); setMetal(''); setSilverGrams(''); setGoldGrams('');
        setTotalAmount(''); setDesignImages([]); setReceiptImages([]);
        navigation.navigate('InvoiceHome');
        Toast.show({ type: 'success', text1: 'Invoice Created!', text2: 'Submitted successfully' });
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (e) { console.log(e); }
    finally { setActivity(false); }
  };

  const openPhoneBook = async () => {
    setLoadingContacts(true);
    const permission = await Contacts.requestPermission();
    if (permission === 'authorized') {
      Contacts.getAll()
        .then(list => {
          const valid = list.filter(c => c.phoneNumbers?.length > 0)
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
          if (!valid.length) { Alert.alert('No Contacts', 'No contacts with phone numbers.'); return; }
          setContacts(valid); setFilteredContacts(valid); setModalVisible(true);
        })
        .catch(e => console.warn(e))
        .finally(() => setLoadingContacts(false));
    } else {
      Alert.alert('Permission Denied', 'Cannot access contacts.'); setLoadingContacts(false);
    }
  };

  const selectContact = (contact) => {
    setMobile(contact.phoneNumbers[0].number.replace(/[^0-9+]/g, ''));
    setModalVisible(false);
  };

  const renderContactItem = ({ item }) => {
    const dname = item.displayName || `${item.givenName || ''} ${item.familyName || ''}`.trim();
    return item.phoneNumbers.length > 0 ? (
      <TouchableOpacity onPress={() => selectContact(item)} style={s.contactRow} activeOpacity={0.7}>
        <View style={s.contactAvatar}>
          <Text style={s.contactAvatarLetter}>{(dname[0] || '?').toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.contactName}>{dname || 'Unnamed'}</Text>
          <Text style={s.contactNum}>{item.phoneNumbers[0]?.number}</Text>
        </View>
        <Text style={{ color: C.primary, fontSize: 22 }}>›</Text>
      </TouchableOpacity>
    ) : null;
  };

  const metalOptions = [
    { label: 'Gold', image: require('../../assets/gold_bar_shie.png') },
    { label: 'Silver', image: require('../../assets/silver_compressed.png') },
    { label: 'Mix', image: require('../../assets/mix.png') },
  ];

  const fmtDate = d => d?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const balance = (parseFloat(totalAmount || 0) - parseFloat(amountGiven || 0)).toFixed(2);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* Top Banner */}
      <View style={s.topBanner}>
        <View>
          <Text style={s.bannerTitle}>New Invoice</Text>
          <Text style={s.bannerSub}>Fill in the order details below</Text>
        </View>
        <View style={s.bannerPill}>
          <View style={s.bannerDot} />
          <Text style={s.bannerPillText}>Draft</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <View style={s.card}>
            <SectionHeader icon="🧾" title="Invoice Details" />
            <Field label="Invoice Number" icon="#" placeholder="e.g. INV-001"
              value={invoice_number} onChangeText={setinvoice_number} />
          </View>

          <View style={s.card}>
            <SectionHeader icon="👤" title="Client Information" />
            <Field label="Full Name" icon="✎" placeholder="Client full name"
              value={name} onChangeText={setName} />

            <Text style={s.fieldLabel}>Mobile Number</Text>
            <View style={s.mobileRow}>
              <View style={s.mobileBox}>
                <Text style={s.fieldIcon}>📱</Text>
                <TextInput
                  placeholder="Enter mobile number"
                  value={mobile} onChangeText={setMobile}
                  keyboardType="number-pad" maxLength={15}
                  placeholderTextColor={C.textMuted}
                  style={[s.fieldInput, { flex: 1, paddingLeft: 4 }]}
                />
              </View>
              <TouchableOpacity style={s.pbBtn} onPress={openPhoneBook} activeOpacity={0.85}>
                <Image source={phoneBook} style={{ height: 20, width: 20, tintColor: C.white }} />
              </TouchableOpacity>
            </View>

            <Field label="Address" icon="📍" placeholder="Full address"
              value={address} onChangeText={setAddress} multiline
              inputStyle={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }} />
          </View>

          <View style={s.card}>
            <SectionHeader icon="💳" title="Payment Details" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field label="Total Amount ₹" icon="₹" placeholder="0.00"
                value={totalAmount} onChangeText={setTotalAmount}
                keyboardType="numeric" style={{ flex: 1 }} />
              <Field label="Amount Given ₹" icon="₹" placeholder="0.00"
                value={amountGiven} onChangeText={setAmountGiven}
                keyboardType="numeric" style={{ flex: 1 }} />
            </View>
            {(totalAmount || amountGiven) ? (
              <View style={s.balanceCard}>
                <Text style={s.balanceLabel}>Balance Due</Text>
                <Text style={[s.balanceAmount, { color: parseFloat(balance) > 0 ? C.accent : C.primary }]}>
                  ₹ {balance}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.card}>
            <SectionHeader icon="📝" title="Order Description" />
            <Field label="Notes (optional)" icon="✎" placeholder="Any special instructions..."
              value={description} onChangeText={setDescription} multiline
              inputStyle={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 10 }} />
          </View>

          <View style={s.card}>
            <SectionHeader icon="📅" title="Schedule" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.dateCard, { flex: 1 }]} onPress={() => setOrderDateOpen(true)} activeOpacity={0.85}>
                <Text style={s.dateCardLabel}>Order Date</Text>
                <View style={s.dateCardRow}>
                  <Image source={calanderLogo} style={s.calIcon} />
                  <Text style={[s.dateCardValue, !orderDate && s.datePlaceholder]}>
                    {fmtDate(orderDate) || 'Select'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[s.dateCard, { flex: 1 }]} onPress={() => setDeliveryDateOpen(true)} activeOpacity={0.85}>
                <Text style={s.dateCardLabel}>Delivery Date</Text>
                <View style={s.dateCardRow}>
                  <Image source={calanderLogo} style={s.calIcon} />
                  <Text style={[s.dateCardValue, !deliveryDate && s.datePlaceholder]}>
                    {fmtDate(deliveryDate) || 'Select'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <DatePicker modal title="Select Order Date" theme="light" mode="date"
            open={isOrderDateOpen} date={orderDate || new Date()}
            onConfirm={d => { setOrderDateOpen(false); setOrderDate(d); }}
            onCancel={() => setOrderDateOpen(false)} />
          <DatePicker modal title="Select Delivery Date" theme="light" mode="date"
            open={isDeliveryDateOpen} date={deliveryDate || new Date()}
            onConfirm={d => { setDeliveryDateOpen(false); setDeliveryDate(d); }}
            onCancel={() => setDeliveryDateOpen(false)} />

          <View style={s.card}>
            <SectionHeader icon="💎" title="Metal Type" />
            <View style={s.metalGrid}>
              {metalOptions.map(opt => (
                <TouchableOpacity key={opt.label} onPress={() => setMetal(opt.label)}
                  style={[s.metalCard, metal === opt.label && s.metalCardActive]} activeOpacity={0.8}>
                  <Image source={opt.image} style={s.metalImg} />
                  <Text style={[s.metalLabel, metal === opt.label && s.metalLabelActive]}>{opt.label}</Text>
                  {metal === opt.label && (
                    <View style={s.metalCheckRing}><View style={s.metalCheckFill} /></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {(metal === 'Gold' || metal === 'Mix') && (
              <Field label="Gold Weight (grams)" icon="🟡" placeholder="e.g. 10.5"
                value={goldGrams} onChangeText={setGoldGrams} keyboardType="numeric" style={{ marginTop: 12 }} />
            )}
            {(metal === 'Silver' || metal === 'Mix') && (
              <Field label="Silver Weight (grams)" icon="⚪" placeholder="e.g. 25.0"
                value={silverGrams} onChangeText={setSilverGrams} keyboardType="numeric"
                style={{ marginTop: metal === 'Mix' ? 0 : 12 }} />
            )}
          </View>

          <View style={s.card}>
            <SectionHeader icon="🖼" title="Attachments" />

            <TouchableOpacity style={s.uploadBtn} onPress={handleReceiptImageSelection} activeOpacity={0.85}>
              <View style={s.uploadIconBox}><Text style={{ fontSize: 18 }}>🧾</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.uploadTitle}>Receipt Images</Text>
                <Text style={s.uploadSub}>
                  {receiptImages.length > 0 ? `${receiptImages.length} image(s) selected` : 'Tap to upload from camera or gallery'}
                </Text>
              </View>
              <Text style={s.uploadPlus}>＋</Text>
            </TouchableOpacity>
            {receiptImages.length > 0 && (
              <View style={s.imgGrid}>
                {receiptImages.map((img, i) => (
                  <View key={i} style={s.imgThumb}>
                    <Image source={{ uri: img.path }} style={s.thumbImg} />
                    <TouchableOpacity style={s.thumbDel} onPress={() => handleRemoveImage(setReceiptImages, i)}>
                      <Text style={s.thumbDelText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={s.divider} />

            <TouchableOpacity style={s.uploadBtn} onPress={handleDesignImageSelection} activeOpacity={0.85}>
              <View style={[s.uploadIconBox, { backgroundColor: '#ECF0FF' }]}><Text style={{ fontSize: 18 }}>💎</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.uploadTitle}>Design Images</Text>
                <Text style={s.uploadSub}>
                  {designImages.length > 0 ? `${designImages.length} image(s) selected` : 'Tap to upload from camera or gallery'}
                </Text>
              </View>
              <Text style={s.uploadPlus}>＋</Text>
            </TouchableOpacity>
            {designImages.length > 0 && (
              <View style={s.imgGrid}>
                {designImages.map((img, i) => (
                  <View key={i} style={s.imgThumb}>
                    <Image source={{ uri: img.path }} style={s.thumbImg} />
                    <TouchableOpacity style={s.thumbDel} onPress={() => handleRemoveImage(setDesignImages, i)}>
                      <Text style={s.thumbDelText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.9}>
            <Text style={s.submitText}>Create Invoice  →</Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>

        {activity && (
          <View style={s.overlay}>
            <LottieView
              style={{ width: 200, height: 200 }}
              source={require('../../assets/Coin purse.json')}
              autoPlay loop
            />
            <Text style={s.loaderText}>Submitting...</Text>
          </View>
        )}
      </View>

      {/* Contacts Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <View>
                <Text style={s.sheetTitle}>Select Contact</Text>
                <Text style={s.sheetSub}>{filteredContacts.length} contacts found</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={s.sheetClose}>
                <Image source={closeLogo} style={{ width: 16, height: 16, tintColor: C.textSub }} />
              </TouchableOpacity>
            </View>
            <View style={s.searchWrap}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput placeholder="Search by name..." value={search} onChangeText={setSearch}
                placeholderTextColor={C.textMuted} style={s.searchInput} />
            </View>
            <FlatList data={filteredContacts} keyExtractor={item => item.recordID}
              renderItem={renderContactItem} showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }} />
          </View>
        </View>
      </Modal>

      {loadingContacts && (
        <View style={s.loaderCard}>
          <LottieView
            style={{width: 200, height: 200 }}
            source={require('../../assets/Coin purse.json')}
            autoPlay loop
          />
          <Text style={s.loaderText}>Loading contacts...</Text>
        </View>
      )}
    </View>
  );
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { padding: 16, paddingTop: 12, backgroundColor: C.bg },

  // Banner
  topBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EDF4F3',
  },
  bannerTitle: { fontSize: 22, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  bannerSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  bannerPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, gap: 6,
  },
  bannerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  bannerPillText: { color: C.primary, fontSize: 12, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: C.cardShadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },

  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconBox: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionIconText: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },

  // Fields
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, minHeight: 50,
  },
  fieldIcon: { fontSize: 15, marginRight: 8, color: C.primary },
  fieldInput: {
    flex: 1, color: C.textPrimary, fontSize: 15, fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },

  // Mobile row
  mobileRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  mobileBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, minHeight: 50,
  },
  pbBtn: {
    width: 50, height: 50, backgroundColor: C.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  // Balance
  balanceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.primaryPale, borderRadius: 12, padding: 14, marginTop: 6,
    borderWidth: 1, borderColor: C.border,
  },
  balanceLabel: { fontSize: 13, fontWeight: '600', color: C.textSub },
  balanceAmount: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },

  // Dates
  dateCard: {
    backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14,
  },
  dateCardLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 0.6,
    textTransform: 'uppercase', marginBottom: 8,
  },
  dateCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calIcon: { width: 16, height: 16, tintColor: C.primary },
  dateCardValue: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  datePlaceholder: { color: C.textMuted, fontWeight: '400' },

  // Metal
  metalGrid: { flexDirection: 'row', gap: 10 },
  metalCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg, position: 'relative',
  },
  metalCardActive: {
    borderColor: C.primary, backgroundColor: C.primaryPale,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 3,
  },
  metalImg: { width: 34, height: 34, marginBottom: 6 },
  metalLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  metalLabelActive: { color: C.primary, fontWeight: '700' },
  metalCheckRing: {
    position: 'absolute', top: 7, right: 7, width: 16, height: 16,
    borderRadius: 8, borderWidth: 2, borderColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  metalCheckFill: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },

  // Upload
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryPale,
    borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed', gap: 12,
  },
  uploadIconBox: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  uploadSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  uploadPlus: { fontSize: 26, fontWeight: '300', color: C.primary },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  // Image grid
  imgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  imgThumb: { position: 'relative' },
  thumbImg: { width: imageSize, height: imageSize, borderRadius: 12, borderWidth: 2, borderColor: C.border },
  thumbDel: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22,
    borderRadius: 11, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },
  thumbDelText: { color: C.white, fontSize: 9, fontWeight: '800' },

  // Submit
  submitBtn: {
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', marginTop: 6,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  submitText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  // Overlay
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  loaderCard: {
    backgroundColor: C.white, borderRadius: 18, paddingVertical: 28,
    paddingHorizontal: 40, alignItems: 'center', gap: 12,
  },
  loaderText: { color: C.textPrimary, fontSize: 14, fontWeight: '600' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '82%',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary },
  sheetSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  sheetClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, marginBottom: 14, minHeight: 46,
  },
  searchInput: { flex: 1, color: C.textPrimary, fontSize: 15, paddingVertical: 8 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F2F8F7', gap: 12,
  },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center' },
  contactAvatarLetter: { color: C.primary, fontSize: 17, fontWeight: '700' },
  contactName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  contactNum: { fontSize: 13, color: C.textMuted, marginTop: 2 },
});

export default AddInvoice;
