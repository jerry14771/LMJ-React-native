import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, FlatList,
  StyleSheet, ScrollView, TouchableWithoutFeedback, Image,
  StatusBar, Platform, Dimensions,
} from 'react-native';
import Header from '../Common/Header';
import config from '../../config';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import C from '../../colorConfig';
import LottieView from 'lottie-react-native';


// ─── Data ─────────────────────────────────────────────────────────────────────
const hindiMonths = ['सावन','भादों','आश्विन','कार्तिक','अगहन','पौष','माघ','फाल्गुन','चैत्र','वैशाख','ज्येष्ठ','आषाढ़'];
const hindiYears  = ['१४२८','१४२९','१४३०','१४३१','१४३२','१४३३','१४३४','१४३५','१४३६','१४३७','१४३८','१४३९','१४४०','१४४१','१४४२','१४४३','१४४४','१४४५'];
const hindiDates  = ['१','२','३','४','५','६','७','८','९','१०','११','१२','१३','१४','१५','१६','१७','१८','१९','२०','२१','२२','२३','२४','२५','२६','२७','२८','२९','३०','३१'];
const books       = ['B*A', 'B*K*J', 'Bina Purza', 'B*K'];


// ─── Helpers ──────────────────────────────────────────────────────────────────
const hindiToEnglish = (s = '') => {
  const map = { '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9' };
  return s.split('').map(c => map[c] || c).join('');
};

const getValidDate = (ds) => { const d = new Date(ds); return isNaN(d) ? new Date() : d; };

// ─── Reusable Sub-components ─────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionIconBox}>
      <Text style={s.sectionIconText}>{icon}</Text>
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

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
const AddBandhak = () => {
  const calanderLogo = require('../../assets/calendar.png');
  const navigation   = useNavigation();
  const route        = useRoute();
  const data         = route.params?.data;
  const id           = data?.id ?? null;

  // State
  const [selectedBook,   setSelectedBook]   = useState(data?.book_name ?? null);
  const [goldSelected,   setGoldSelected]   = useState(!!data?.gold_weight);
  const [silverSelected, setSilverSelected] = useState(!!data?.silver_weight);
  const [goldWeight,     setGoldWeight]     = useState(data?.gold_weight ?? '');
  const [silverWeight,   setSilverWeight]   = useState(data?.silver_weight ?? '');
  const [amountGiven,    setAmountGiven]    = useState(data?.amount_given ?? '');
  const [selectedDate,   setSelectedDate]   = useState(data?.hindi_date ?? '');
  const [selectedMonth,  setSelectedMonth]  = useState(data?.hindi_month ?? '');
  const [selectedYear,   setSelectedYear]   = useState(data?.hindi_year ?? '');
  const [fatherName,     setFatherName]     = useState(data?.father_name ?? '');
  const [mobile,         setMobile]         = useState(data?.mobile_no ?? '');
  const [reciptNumber,   setReciptNumber]   = useState(data?.purja_no ?? '');
  const [name,           setName]           = useState(data?.name ?? '');
  const [description,    setDescription]    = useState(data?.description ?? '');
  const [address,        setAddress]        = useState(data?.address ?? '');
  const [englishDate,    setEnglishDate]    = useState(getValidDate(data?.englishDate));
  const [isDateOpen,     setDateOpen]       = useState(false);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [modalType,      setModalType]      = useState('');
  const [activity,       setActivity]       = useState(false);

  const openModal = (type) => { setModalType(type); setModalVisible(true); };

  const selectValue = (value) => {
    if (modalType === 'date')   setSelectedDate(value);
    if (modalType === 'month')  setSelectedMonth(value);
    if (modalType === 'year')   setSelectedYear(value);
    if (modalType === 'books')  setSelectedBook(value);
    setModalVisible(false);
  };

  const submitData = async () => {
    setActivity(true);
    try {
      const body = {
        id, book_name: selectedBook, name, address,
        father_name: fatherName, mobile_no: mobile,
        purja_no: reciptNumber, description,
        amount_given: amountGiven,
        hindi_date: selectedDate, hindi_month: selectedMonth, hindi_year: selectedYear,
        englishDate,
        ...(goldSelected   && { gold_weight: goldWeight }),
        ...(silverSelected && { silver_weight: silverWeight }),
      };
      const res    = await fetch(`${config.BASE_URL}InsertBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.status === 'success') {
        navigation.navigate('BandhakHome');
        Toast.show({ type: 'success', text1: 'Success 🎉', text2: 'Bandhak saved successfully 👍' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: result.error || 'Failed to save bandhak' });
      }
    } catch (e) { console.warn(e); }
    finally { setActivity(false); }
  };

  const fmtDate = d => d?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Modal list data
  const getModalData = () => {
    if (modalType === 'books')  return books;
    if (modalType === 'date')   return hindiDates;
    if (modalType === 'month')  return hindiMonths;
    if (modalType === 'year')   return hindiYears;
    return [];
  };

  const getModalDisplayValue = (item) =>
    (modalType === 'date' || modalType === 'year') ? hindiToEnglish(item) : item;

  const getModalTitle = () => {
    if (modalType === 'books')  return 'Select Book';
    if (modalType === 'date')   return 'तारीख चुनें';
    if (modalType === 'month')  return 'महीना चुनें';
    if (modalType === 'year')   return 'वर्ष चुनें';
    return 'Select';
  };

  // Derive active label for book button
  const bookLabel = selectedBook || 'Choose Book';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* Top Banner */}
      <View style={s.topBanner}>
        <View>
          <Text style={s.bannerTitle}>{id ? 'Edit Bandhak' : 'New Bandhak'}</Text>
          <Text style={s.bannerSub}>Fill in the pledge details below</Text>
        </View>
        <View style={s.bannerPill}>
          <View style={s.bannerDot} />
          <Text style={s.bannerPillText}>{id ? 'Editing' : 'Draft'}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Book & Receipt ── */}
          <View style={s.card}>
            <SectionHeader icon="📚" title="Book & Receipt" />

            {/* Book Selector */}
            <Text style={s.fieldLabel}>Book Name</Text>
            <TouchableOpacity style={s.selectBox} onPress={() => openModal('books')} activeOpacity={0.85}>
              <Text style={s.selectIcon}>📖</Text>
              <Text style={[s.selectText, !selectedBook && { color: C.textMuted }]}>{bookLabel}</Text>
              <Text style={s.selectChevron}>›</Text>
            </TouchableOpacity>

            <Field
              label="Receipt / Purja Number"
              icon="🔢"
              placeholder="e.g. 1042"
              value={reciptNumber}
              onChangeText={setReciptNumber}
              keyboardType="numeric"
              style={{ marginTop: 4 }}
            />
          </View>

          {/* ── Client Information ── */}
          <View style={s.card}>
            <SectionHeader icon="👤" title="Client Information" />
            <Field label="Full Name" icon="✎" placeholder="Client full name"
              value={name} onChangeText={setName} />
            <Field label="Father / Husband Name" icon="👨‍👦" placeholder="Father or husband's name"
              value={fatherName} onChangeText={setFatherName} />
            <Field label="Mobile Number" icon="📱" placeholder="Enter mobile number"
              value={mobile} onChangeText={setMobile} keyboardType="number-pad" maxLength={15} />
            <Field label="Address" icon="📍" placeholder="Full address"
              value={address} onChangeText={setAddress} multiline
              inputStyle={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }} />
          </View>

          {/* ── Metal Selection ── */}
          <View style={s.card}>
            <SectionHeader icon="💎" title="Metal Type" />
            <View style={s.metalToggleRow}>
              {/* Gold Toggle */}
              <TouchableOpacity
                style={[s.metalToggle, goldSelected && s.metalToggleGold]}
                onPress={() => setGoldSelected(p => !p)}
                activeOpacity={0.8}
              >
                <Text style={s.metalToggleEmoji}>🟡</Text>
                <Text style={[s.metalToggleLabel, goldSelected && { color: C.gold, fontWeight: '700' }]}>Gold</Text>
                {goldSelected && <View style={s.metalCheckDot} />}
              </TouchableOpacity>

              {/* Silver Toggle */}
              <TouchableOpacity
                style={[s.metalToggle, silverSelected && s.metalToggleSilver]}
                onPress={() => setSilverSelected(p => !p)}
                activeOpacity={0.8}
              >
                <Text style={s.metalToggleEmoji}>⚪</Text>
                <Text style={[s.metalToggleLabel, silverSelected && { color: C.silver, fontWeight: '700' }]}>Silver</Text>
                {silverSelected && <View style={[s.metalCheckDot, { backgroundColor: C.silver }]} />}
              </TouchableOpacity>
            </View>

            {goldSelected && (
              <Field label="Gold Weight (grams)" icon="🟡" placeholder="e.g. 10.5"
                value={goldWeight} onChangeText={setGoldWeight} keyboardType="numeric"
                style={{ marginTop: 14 }} />
            )}
            {silverSelected && (
              <Field label="Silver Weight (grams)" icon="⚪" placeholder="e.g. 25.0"
                value={silverWeight} onChangeText={setSilverWeight} keyboardType="numeric"
                style={{ marginTop: goldSelected ? 0 : 14 }} />
            )}
          </View>

          {/* ── Payment ── */}
          <View style={s.card}>
            <SectionHeader icon="💳" title="Amount Given" />
            <Field label="Amount Given ₹" icon="₹" placeholder="0.00"
              value={amountGiven} onChangeText={setAmountGiven} keyboardType="numeric" />
          </View>

          {/* ── Description ── */}
          <View style={s.card}>
            <SectionHeader icon="📝" title="Item Description" />
            <Field label="Description (optional)" icon="✎" placeholder="Describe the pledged items..."
              value={description} onChangeText={setDescription} multiline
              inputStyle={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 10 }} />
          </View>

          {/* ── Dates ── */}
          <View style={s.card}>
            <SectionHeader icon="📅" title="Date of Bandhak" />

            {/* English Date */}
            <Text style={s.fieldLabel}>English Date</Text>
            <TouchableOpacity style={s.dateCard} onPress={() => setDateOpen(true)} activeOpacity={0.85}>
              <View style={s.dateCardRow}>
                <Image source={calanderLogo} style={s.calIcon} />
                <Text style={[s.dateCardValue, !englishDate && s.datePlaceholder]}>
                  {fmtDate(englishDate) || 'Select date'}
                </Text>
              </View>
            </TouchableOpacity>

            <DatePicker modal title="Select Date" theme="light" mode="date"
              open={isDateOpen} date={englishDate || new Date()}
              onConfirm={d => { setDateOpen(false); setEnglishDate(d); }}
              onCancel={() => setDateOpen(false)} />

            {/* Hindi Date */}
            <Text style={[s.fieldLabel, { marginTop: 14 }]}>हिंदी तारीख (Hindu Calendar)</Text>
            <View style={s.hindiDateRow}>
              {[
                { key: 'date',  label: selectedDate  ? hindiToEnglish(selectedDate)  : 'तारीख',  modal: 'date'  },
                { key: 'month', label: selectedMonth || 'महीना', modal: 'month' },
                { key: 'year',  label: selectedYear  ? hindiToEnglish(selectedYear)  : 'वर्ष',   modal: 'year'  },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[s.hindiDateBox, item.key === 'month' && { flex: 1.4 }]}
                  onPress={() => openModal(item.modal)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.hindiDateText, !selectedDate && item.key === 'date' && { color: C.textMuted }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity style={s.submitBtn} onPress={submitData} activeOpacity={0.9}>
            <Text style={s.submitText}>{id ? 'Update Bandhak  →' : 'Save Bandhak  →'}</Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>

        {activity && (
         <View style={s.overlay}>
                   <View style={s.loaderBox}>
                      <LottieView
                                                     style={{ height:150, width:150 }}
                                                     source={require('../../assets/Coin purse.json')}
                                                     autoPlay loop
                                                   />
                     <Text style={s.loaderText}>Loading records...</Text>
                   </View>
                 </View>
        )}
      </View>

      {/* ── Picker Modal ── */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={s.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={s.modalSheet}>
                <View style={s.sheetHandle} />
                <View style={s.sheetHeader}>
                  <View>
                    <Text style={s.sheetTitle}>{getModalTitle()}</Text>
                    <Text style={s.sheetSub}>{getModalData().length} options</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={s.sheetClose}>
                    <Text style={{ fontSize: 18, color: C.textSub }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={getModalData()}
                  keyExtractor={item => item.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.modalItem} onPress={() => selectValue(item)} activeOpacity={0.7}>
                      <Text style={s.modalItemText}>{getModalDisplayValue(item)}</Text>
                      <Text style={{ color: C.primary, fontSize: 20 }}>›</Text>
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
  bannerSub:   { fontSize: 13, color: C.textMuted, marginTop: 2 },
  bannerPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, gap: 6,
  },
  bannerDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  bannerPillText: { color: C.primary, fontSize: 12, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: C.cardShadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },

  // Section Header
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconBox:  { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center' },
  sectionIconText: { fontSize: 16 },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: C.textPrimary },

  // Fields
  fieldWrap:  { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, minHeight: 50,
  },
  fieldIcon:  { fontSize: 15, marginRight: 8, color: C.primary },
  fieldInput: {
    flex: 1, color: C.textPrimary, fontSize: 15, fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },

  // Select Box (for Book)
  selectBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14,
    minHeight: 50, marginBottom: 12,
  },
  selectIcon:    { fontSize: 16, marginRight: 8 },
  selectText:    { flex: 1, fontSize: 15, fontWeight: '500', color: C.textPrimary },
  selectChevron: { color: C.primary, fontSize: 22 },

  // Metal Toggles
  metalToggleRow: { flexDirection: 'row', gap: 12 },
  metalToggle: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg, position: 'relative',
  },
  metalToggleGold: {
    borderColor: '#D4AF37', backgroundColor: '#FDF8E7',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  metalToggleSilver: {
    borderColor: '#A8B8C0', backgroundColor: '#F0F5F7',
    shadowColor: '#A8B8C0', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  metalToggleEmoji: { fontSize: 18 },
  metalToggleLabel:  { fontSize: 14, fontWeight: '600', color: C.textMuted },
  metalCheckDot: {
    position: 'absolute', top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold,
  },

  // Date Picker Card
  dateCard: {
    backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1.5,
    borderColor: C.border, padding: 14, marginBottom: 4,
  },
  dateCardRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calIcon:        { width: 16, height: 16, tintColor: C.primary },
  dateCardValue:  { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  datePlaceholder:{ color: C.textMuted, fontWeight: '400' },

  // Hindi Date Row
  hindiDateRow:  { flexDirection: 'row', gap: 10 },
  hindiDateBox: {
    flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 10, backgroundColor: C.inputBg,
    alignItems: 'center',
  },
  hindiDateText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },

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

  // Modal Sheet
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '75%',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle:  { fontSize: 20, fontWeight: '700', color: C.textPrimary },
  sheetSub:    { fontSize: 12, color: C.textMuted, marginTop: 2 },
  sheetClose:  { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },

  // Modal Items
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F2F8F7',
  },
  modalItemText: { fontSize: 15, fontWeight: '500', color: C.textPrimary },
});

export default AddBandhak;
