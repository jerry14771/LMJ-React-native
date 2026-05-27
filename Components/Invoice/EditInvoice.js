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
import C from '../../colorConfig';
import LottieView from 'lottie-react-native';

const { width: W } = Dimensions.get('window');
const IMG_SIZE = (W - 72) / 3;

// ─── Color System ─────────────────────────────────────────────────────────────


// ─── Reusable: Section Label ──────────────────────────────────────────────────
const SectionLabel = ({ text, hint }) => (
  <View style={sl.wrap}>
    <Text style={sl.text}>{text}</Text>
    {hint ? <Text style={sl.hint}>{hint}</Text> : null}
  </View>
);
const sl = StyleSheet.create({
  wrap: { marginBottom: 16 },
  text: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.4, textTransform: 'uppercase' },
  hint: { fontSize: 12, color: C.textMuted, marginTop: 3 },
});

// ─── Reusable: Labeled Field ──────────────────────────────────────────────────
const Field = ({ label, style, inputStyle, ...props }) => (
  <View style={[fd.wrap, style]}>
    {label ? <Text style={fd.label}>{label}</Text> : null}
    <View style={fd.box}>
      <TextInput
        style={[fd.input, inputStyle]}
        placeholderTextColor={C.textMuted}
        {...props}
      />
    </View>
  </View>
);
const fd = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  box: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  input: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
});

// ─── Reusable: Card Block ─────────────────────────────────────────────────────
const Block = ({ children, style }) => <View style={[bk.card, style]}>{children}</View>;
const bk = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 2,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const EditInvoice = ({ route }) => {
  const { invoice, source } = route.params;
  const navigation = useNavigation();

  const getFullPath = (p) => `${config.BASE_URL}${p.replace(/\\/g, '')}`;

  // Images — preserve existing flag
  const [receiptImages, setReceiptImages] = useState(
    invoice.receiptImages
      ? JSON.parse(invoice.receiptImages).map(img => ({ uri: getFullPath(img), isExisting: true }))
      : []
  );
  const [designImages, setDesignImages] = useState(
    invoice.designImages
      ? JSON.parse(invoice.designImages).map(img => ({ uri: getFullPath(img), isExisting: true }))
      : []
  );
  const [removedReceipt, setRemovedReceipt] = useState([]);
  const [removedDesign, setRemovedDesign] = useState([]);

  const [busy, setBusy] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState(invoice.invoice_number || '');
  const [name, setName] = useState(invoice.name || '');
  const [mobile, setMobile] = useState(invoice.mobile || '');
  const [address, setAddress] = useState(invoice.address || '');
  const [description, setDesc] = useState(invoice.description || '');
  const [totalAmount, setTotal] = useState(invoice.totalAmount?.toString() || '');
  const [amountGiven, setGiven] = useState(invoice.initial_payment?.toString() || '');
  const [metal, setMetal] = useState(invoice.metal || '');
  const [goldGrams, setGoldG] = useState(invoice.gold_grams?.toString() || '');
  const [silverGrams, setSilverG] = useState(invoice.silver_grams?.toString() || '');
  const [orderDate, setOrderDate] = useState(new Date(invoice.orderDate));
  const [deliveryDate, setDelivery] = useState(new Date(invoice.deliveryDate));
  const [orderOpen, setOrderOpen] = useState(false);
  const [deliveryOpen, setDelOpen] = useState(false);

  // Contacts
  const [contModal, setContModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingPB, setLoadingPB] = useState(false);

  const calImg = require('../../assets/calendar.png');
  const closeImg = require('../../assets/close.png');
  const pbImg = require('../../assets/phonebook.png');

  useEffect(() => {
    setFiltered(
      search
        ? contacts.filter(c => c.displayName?.toLowerCase().includes(search.toLowerCase()))
        : contacts
    );
  }, [search, contacts]);

  // ── Image Handlers ──────────────────────────────────────────────────────────
  const imgPrompt = (setter) =>
    Alert.alert('Attach Image', '', [
      { text: 'Take Photo', onPress: () => snapImg(setter) },
      { text: 'Choose from Library', onPress: () => pickImgs(setter) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const pickImgs = (setter) =>
    ImagePicker.openPicker({ multiple: true, cropping: true })
      .then(imgs => setter(p => [...p, ...imgs.map(i => ({ uri: i.path, isExisting: false }))]))
      .catch(() => { });

  const snapImg = (setter) =>
    ImagePicker.openCamera({ cropping: true })
      .then(img => setter(p => [...p, { uri: img.path, isExisting: false }]))
      .catch(() => { });

  const removeImg = (type, index) => {
    if (type === 'receipt') {
      const img = receiptImages[index];
      if (img.isExisting) setRemovedReceipt(p => [...p, img.uri]);
      setReceiptImages(p => p.filter((_, i) => i !== index));
    } else {
      const img = designImages[index];
      if (img.isExisting) setRemovedDesign(p => [...p, img.uri]);
      setDesignImages(p => p.filter((_, i) => i !== index));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setBusy(true);
    const stripBase = (uri) => uri.replace(config.BASE_URL, '');

    const fd = new FormData();
    fd.append('id', invoice.id);
    fd.append('name', name);
    fd.append('mobile', mobile);
    fd.append('address', address);
    fd.append('metal', metal);
    fd.append('silvergrams', metal === 'Gold' ? '0' : silverGrams);
    fd.append('goldgrams', metal === 'Silver' ? '0' : goldGrams);
    fd.append('description', description);
    fd.append('totalAmount', totalAmount);
    fd.append('amountGiven', amountGiven);
    fd.append('invoice_number', invoiceNo);
    fd.append('orderDate', orderDate.toISOString());
    fd.append('deliveryDate', deliveryDate.toISOString());

    const keptR = receiptImages.filter(i => i.isExisting).map(i => stripBase(i.uri));
    const keptD = designImages.filter(i => i.isExisting).map(i => stripBase(i.uri));
    const remR = removedReceipt.map(stripBase);
    const remD = removedDesign.map(stripBase);

    if (keptR.length) fd.append('keptReceiptImages', JSON.stringify(keptR));
    if (remR.length) fd.append('removedReceiptImages', JSON.stringify(remR));
    if (keptD.length) fd.append('keptDesignImages', JSON.stringify(keptD));
    if (remD.length) fd.append('removedDesignImages', JSON.stringify(remD));

    receiptImages.filter(i => !i.isExisting).forEach((img, i) =>
      fd.append('receiptImages[]', { uri: img.uri, type: 'image/jpeg', name: `receipt_${Date.now()}_${i}.jpg` })
    );
    designImages.filter(i => !i.isExisting).forEach((img, i) =>
      fd.append('designImages[]', { uri: img.uri, type: 'image/jpeg', name: `design_${Date.now()}_${i}.jpg` })
    );

    try {
      const res = await fetch(config.BASE_URL + 'updateInvoice.php', {
        method: 'POST', headers: { 'Content-Type': 'multipart/form-data' }, body: fd,
      });
      const result = await res.json();
      if (result.status === 'success') {
        Toast.show({ type: 'success', text1: 'Invoice updated', text2: 'All changes saved successfully' });
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update invoice');
    } finally {
      setBusy(false);
    }
  };

  // ── Contacts ────────────────────────────────────────────────────────────────
  const openPB = async () => {
    setLoadingPB(true);
    const perm = await Contacts.requestPermission();
    if (perm === 'authorized') {
      Contacts.getAll()
        .then(list => {
          const v = list
            .filter(c => c.phoneNumbers?.length)
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
          if (!v.length) { Alert.alert('No contacts found'); return; }
          setContacts(v); setFiltered(v); setContModal(true);
        })
        .catch(console.warn)
        .finally(() => setLoadingPB(false));
    } else {
      Alert.alert('Permission Denied'); setLoadingPB(false);
    }
  };

  const pickContact = (c) => {
    setMobile(c.phoneNumbers[0].number.replace(/[^0-9+]/g, ''));
    setContModal(false);
  };

  const renderContact = ({ item }) => {
    const label = item.displayName || `${item.givenName || ''} ${item.familyName || ''}`.trim() || 'Unknown';
    return item.phoneNumbers.length ? (
      <TouchableOpacity onPress={() => pickContact(item)} style={cm.row} activeOpacity={0.65}>
        <View style={cm.ava}><Text style={cm.avaT}>{label[0].toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={cm.cname}>{label}</Text>
          <Text style={cm.cnum}>{item.phoneNumbers[0].number}</Text>
        </View>
      </TouchableOpacity>
    ) : null;
  };

  const metals = ['Gold', 'Silver', 'Mix'];
  const fmt = d => d?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const balance = parseFloat(totalAmount || 0) - parseFloat(amountGiven || 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      {/* <Header /> */}

      {/* Page title */}
      <View style={s.pageHead}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.pageTitle}>Edit Invoice</Text>
          <Text style={s.pageSub}>#{invoiceNo || '—'}</Text>
        </View>
        <View style={s.editChip}>
          <Text style={s.editChipText}>Editing</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Invoice ── */}
          <Block>
            <SectionLabel text="Invoice" />
            <Field label="Invoice Number" placeholder="e.g. INV-001" value={invoiceNo} onChangeText={setInvoiceNo} style={{ marginBottom: 0 }} />
          </Block>

          {/* ── Client ── */}
          <Block>
            <SectionLabel text="Client" />
            <Field label="Full Name" placeholder="Client name" value={name} onChangeText={setName} />

            {/* Mobile + phonebook */}
            <Text style={fd.label}>Mobile Number</Text>
            <View style={s.mobileRow}>
              <View style={s.mobileBox}>
                <TextInput
                  placeholder="Enter number"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="number-pad"
                  maxLength={15}
                  placeholderTextColor={C.textMuted}
                  style={[fd.input, { flex: 1 }]}
                />
              </View>
              <TouchableOpacity style={s.pbBtn} onPress={openPB} activeOpacity={0.85}>
                <Image source={pbImg} style={{ height: 20, width: 20, tintColor: C.white }} />
              </TouchableOpacity>
            </View>

            <Field
              label="Address"
              placeholder="Full address"
              value={address}
              onChangeText={setAddress}
              multiline
              inputStyle={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }}
              style={{ marginBottom: 0 }}
            />
          </Block>

          {/* ── Payment ── */}
          <Block>
            <SectionLabel text="Payment" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field
                label="Total Amount ₹"
                placeholder="0.00"
                value={totalAmount}
                onChangeText={setTotal}
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
              <Field
                label="Amount Given ₹"
                placeholder="0.00"
                value={amountGiven}
                onChangeText={setGiven}
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
            </View>

            {(totalAmount !== '' || amountGiven !== '') && (
              <View style={[s.balPill, { borderColor: balance > 0 ? C.accent : C.primary, backgroundColor: balance > 0 ? C.accentPale : C.primaryPale }]}>
                <Text style={[s.balLabel, { color: balance > 0 ? C.accent : C.primary }]}>
                  {balance > 0 ? 'Balance Due' : balance < 0 ? 'Overpaid' : 'Fully Paid'}
                </Text>
                <Text style={[s.balAmt, { color: balance > 0 ? C.accent : C.primary }]}>
                  ₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
          </Block>

          {/* ── Schedule ── */}
          <Block>
            <SectionLabel text="Schedule" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.dateTile, { flex: 1 }]} onPress={() => setOrderOpen(true)} activeOpacity={0.85}>
                <Text style={s.dateTileLabel}>Order Date</Text>
                <View style={s.dateTileRow}>
                  <Image source={calImg} style={s.calIco} />
                  <Text style={s.dateTileVal}>{fmt(orderDate)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[s.dateTile, { flex: 1 }]} onPress={() => setDelOpen(true)} activeOpacity={0.85}>
                <Text style={s.dateTileLabel}>Delivery Date</Text>
                <View style={s.dateTileRow}>
                  <Image source={calImg} style={s.calIco} />
                  <Text style={s.dateTileVal}>{fmt(deliveryDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Block>

          <DatePicker modal mode="date" theme="light" title="Order Date"
            open={orderOpen} date={orderDate || new Date()}
            onConfirm={d => { setOrderOpen(false); setOrderDate(d); }}
            onCancel={() => setOrderOpen(false)} />
          <DatePicker modal mode="date" theme="light" title="Delivery Date"
            open={deliveryOpen} date={deliveryDate || new Date()}
            onConfirm={d => { setDelOpen(false); setDelivery(d); }}
            onCancel={() => setDelOpen(false)} />

          {/* ── Metal ── */}
          <Block>
            <SectionLabel text="Metal" hint="Select material type" />
            <View style={s.metalRow}>
              {metals.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMetal(m)}
                  style={[s.metalChip, metal === m && s.metalChipOn]}
                  activeOpacity={0.75}
                >
                  <View style={[s.metalDot, metal === m && s.metalDotOn]} />
                  <Text style={[s.metalLabel, metal === m && s.metalLabelOn]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(metal === 'Gold' || metal === 'Mix') && (
              <Field label="Gold — grams" placeholder="e.g. 10.5"
                value={goldGrams} onChangeText={setGoldG} keyboardType="numeric"
                style={{ marginTop: 14, marginBottom: metal === 'Mix' ? 14 : 0 }} />
            )}
            {(metal === 'Silver' || metal === 'Mix') && (
              <Field label="Silver — grams" placeholder="e.g. 25.0"
                value={silverGrams} onChangeText={setSilverG} keyboardType="numeric"
                style={{ marginBottom: 0 }} />
            )}
          </Block>

          {/* ── Notes ── */}
          <Block>
            <SectionLabel text="Notes" hint="Optional — special instructions or remarks" />
            <Field
              label="Description"
              placeholder="Any special instructions..."
              value={description}
              onChangeText={setDesc}
              multiline
              inputStyle={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 10 }}
              style={{ marginBottom: 0 }}
            />
          </Block>

          {/* ── Attachments ── */}
          <Block>
            <SectionLabel text="Attachments" />

            {/* Receipt */}
            <View style={s.attachRow}>
              <View style={s.attachMeta}>
                <Text style={s.attachTitle}>Receipt Images</Text>
                <Text style={s.attachSub}>
                  {receiptImages.length ? `${receiptImages.length} attached` : 'None attached'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => imgPrompt(setReceiptImages)} style={s.attachBtn} activeOpacity={0.8}>
                <Text style={s.attachBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {receiptImages.length > 0 && (
              <View style={s.imgStrip}>
                {receiptImages.map((img, i) => (
                  <View key={i} style={s.imgFrame}>
                    <Image source={{ uri: img.uri }} style={s.imgThumb} />
                    {img.isExisting && (
                      <View style={s.existingBadge}><Text style={s.existingBadgeText}>Saved</Text></View>
                    )}
                    <TouchableOpacity style={s.imgRemove} onPress={() => removeImg('receipt', i)}>
                      <Text style={s.imgRemoveX}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={s.divider} />

            {/* Design */}
            <View style={s.attachRow}>
              <View style={s.attachMeta}>
                <Text style={s.attachTitle}>Design Images</Text>
                <Text style={s.attachSub}>
                  {designImages.length ? `${designImages.length} attached` : 'None attached'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => imgPrompt(setDesignImages)} style={s.attachBtn} activeOpacity={0.8}>
                <Text style={s.attachBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {designImages.length > 0 && (
              <View style={s.imgStrip}>
                {designImages.map((img, i) => (
                  <View key={i} style={s.imgFrame}>
                    <Image source={{ uri: img.uri }} style={s.imgThumb} />
                    {img.isExisting && (
                      <View style={s.existingBadge}><Text style={s.existingBadgeText}>Saved</Text></View>
                    )}
                    <TouchableOpacity style={s.imgRemove} onPress={() => removeImg('design', i)}>
                      <Text style={s.imgRemoveX}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Block>

          {/* ── Save Button ── */}
          <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} activeOpacity={0.9}>
            <Text style={s.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {busy && (
          <View style={s.overlay}>
              <LottieView
              style={{ height:150,width:150
               }}
                source={require('../../assets/Coin purse.json')}
                autoPlay loop
              />
              <Text style={s.loaderText}>Saving changes...</Text>
          </View>
        )}
      </View>

      {/* ── Contacts Bottom Sheet ── */}
      <Modal visible={contModal} animationType="slide" transparent onRequestClose={() => setContModal(false)}>
        <View style={cm.backdrop}>
          <View style={cm.sheet}>
            <View style={cm.pill} />
            <View style={cm.header}>
              <Text style={cm.title}>Select Contact</Text>
              <TouchableOpacity onPress={() => setContModal(false)} style={cm.closeBtn}>
                <Image source={closeImg} style={{ width: 14, height: 14, tintColor: C.textSub }} />
              </TouchableOpacity>
            </View>
            <View style={cm.searchBox}>
              <TextInput
                placeholder="Search by name"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={C.textMuted}
                style={cm.searchInput}
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={i => i.recordID}
              renderItem={renderContact}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          </View>
        </View>
      </Modal>

      {loadingPB && (
        <View style={s.overlay}>
          <View style={s.loaderBox}>
            <LottieView
              style={{ flex: 1 }}
              source={require('../../assets/Coin purse.json')}
              autoPlay loop
            />
            <Text style={s.loaderText}>Loading contacts...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Page header
  pageHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: C.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: C.textPrimary, lineHeight: 26 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  pageSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  editChip: {
    marginLeft: 'auto',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FFF4E5',
    borderWidth: 1, borderColor: '#F5D76E',
  },
  editChipText: { fontSize: 11, fontWeight: '700', color: '#A05C00', letterSpacing: 0.4 },

  scroll: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: C.bg },

  // Mobile input
  mobileRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  mobileBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, minHeight: 50,
  },
  pbBtn: {
    width: 50, height: 50, backgroundColor: C.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  // Balance pill
  balPill: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1,
  },
  balLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  balAmt: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  // Date tiles
  dateTile: {
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, padding: 14,
  },
  dateTileLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  },
  dateTileRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  calIco: { width: 14, height: 14, tintColor: C.primary },
  dateTileVal: { fontSize: 14, fontWeight: '600', color: C.textPrimary },

  // Metal selector
  metalRow: { flexDirection: 'row', gap: 10 },
  metalChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg, gap: 7,
  },
  metalChipOn: { borderColor: C.primary, backgroundColor: C.primaryPale },
  metalDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  metalDotOn: { borderColor: C.primary, backgroundColor: C.primary },
  metalLabel: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  metalLabelOn: { color: C.primary },

  // Attachments
  attachRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 6,
  },
  attachMeta: { flex: 1 },
  attachTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  attachSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  attachBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1.5, borderColor: C.primary,
    backgroundColor: C.primaryPale,
  },
  attachBtnText: { fontSize: 13, fontWeight: '700', color: C.primary },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  // Image strip
  imgStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  imgFrame: { position: 'relative' },
  imgThumb: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: 12, backgroundColor: C.bg },
  existingBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(26,158,143,0.85)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  existingBadgeText: { color: C.white, fontSize: 9, fontWeight: '700' },
  imgRemove: {
    position: 'absolute', top: -7, right: -7,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },
  imgRemoveX: { color: C.white, fontSize: 9, fontWeight: '900' },

  // Save button
  saveBtn: {
    height: 56, borderRadius: 16, backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center', marginTop: 6,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.3 },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,46,53,0.45)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  loaderBox: {
    backgroundColor: C.white, borderRadius: 20,
    paddingHorizontal: 36, paddingVertical: 28,
    alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  loaderText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
});

// ─── Contacts Modal ───────────────────────────────────────────────────────────
const cm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,46,53,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, maxHeight: '84%',
  },
  pill: { width: 32, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 19, fontWeight: '700', color: C.textPrimary },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center',
  },
  searchBox: {
    backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 6, marginBottom: 14,
  },
  searchInput: { fontSize: 15, color: C.textPrimary, fontWeight: '500' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.bg, gap: 12,
  },
  ava: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  avaT: { fontSize: 16, fontWeight: '700', color: C.primary },
  cname: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  cnum: { fontSize: 13, color: C.textMuted, marginTop: 1 },
});

export default EditInvoice;
