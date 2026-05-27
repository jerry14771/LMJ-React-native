import {
  View, Text, Image, Modal, TouchableOpacity, StyleSheet,
  ScrollView, Linking, TextInput, StatusBar, Platform, Dimensions
} from 'react-native';
import React, { useState, useCallback } from 'react';
import ImageView from 'react-native-image-viewing';
import config from '../../config';
import Header from '../Common/Header';
import { useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  runOnJS, interpolateColor
} from 'react-native-reanimated';
import ToggleSwitch from 'toggle-switch-react-native';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import DatePicker from 'react-native-date-picker';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.3;

// ─── Color System ─────────────────────────────────────────────────────────────
const C = {
  primary: '#1A9E8F',
  primaryLight: '#D6F5F1',
  primaryPale: '#EEF9F8',
  accent: '#FF7058',
  accentPale: '#FEF1EE',
  bg: '#F4FAF9',
  white: '#FFFFFF',
  textPrimary: '#1A2E35',
  textSub: '#5A7A82',
  textMuted: '#8FAAB0',
  border: '#C8E8E4',
  inputBg: '#FAFFFE',
  // status
  pendingBg: '#FFF4E5', pendingText: '#A05C00', pendingDot: '#F5A623',
  ongoingBg: '#E8F3FF', ongoingText: '#1A4FA0', ongoingDot: '#3B82F6',
  completedBg: '#E6F9F0', completedText: '#1A7A4A', completedDot: '#25A968',
  deliveredBg: '#F5F0FF', deliveredText: '#5B3FA0', deliveredDot: '#8B5CF6',
};

const statuses = ['Pending', 'Ongoing', 'Completed', 'Delivered'];
const swipeColors = {
  Pending: '#F5A623', Ongoing: '#3B82F6', Completed: '#25A968', Delivered: '#8B5CF6',
};
const statusTheme = (s) => {
  if (s === 'Pending') return { bg: C.pendingBg, text: C.pendingText, dot: C.pendingDot };
  if (s === 'Ongoing') return { bg: C.ongoingBg, text: C.ongoingText, dot: C.ongoingDot };
  if (s === 'Completed') return { bg: C.completedBg, text: C.completedText, dot: C.completedDot };
  if (s === 'Delivered') return { bg: C.deliveredBg, text: C.deliveredText, dot: C.deliveredDot };
  return { bg: C.bg, text: C.textMuted, dot: C.textMuted };
};

// ─── Small reusables ─────────────────────────────────────────────────────────
const InfoRow = ({ label, value, valueStyle }) => (
  <View style={ir.row}>
    <Text style={ir.label}>{label}</Text>
    <Text style={[ir.value, valueStyle]}>{value}</Text>
  </View>
);
const ir = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  label: { fontSize: 13, color: C.textSub, fontWeight: '500' },
  value: { fontSize: 14, color: C.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
});

const Block = ({ children, style }) => <View style={[bk.card, style]}>{children}</View>;
const bk = StyleSheet.create({
  card: {
    backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 12,
    shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.055, shadowRadius: 12, elevation: 2,
  },
});

const SectionLabel = ({ text }) => <Text style={sl.t}>{text}</Text>;
const sl = StyleSheet.create({
  t: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const InvoiceDetail = ({ route }) => {
  const { invoiceid, source } = route.params;
  const navigation = useNavigation();

  const phoneLogo = require('../../assets/phone_call.png');
  const binLogo = require('../../assets/delete.png');
  const shareLogo = require('../../assets/share.png');
  const editLogo = require('../../assets/pen.png');

  const [invoice, setInvoice] = useState(null);
  const [designImages, setDesignImages] = useState([]);
  const [receiptImages, setReceiptImages] = useState([]);
  const [visible, setIsVisible] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [isOn, setIsOn] = useState(false);

  // modals
  const [imgDeleteModal, setImgDeleteModal] = useState(false);
  const [recDeleteModal, setRecDeleteModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [relativePath, setRelativePath] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);


  // payment form
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [note, setNote] = useState('');

  const translateX = useSharedValue(0);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchInvoice = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}getSingleInvoice.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceid }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        const d = result.data;
        setInvoice(d);
        setDesignImages(d.designImages ? JSON.parse(d.designImages).map(i => ({ uri: `${config.BASE_URL}${i}` })) : []);
        setReceiptImages(d.receiptImages ? JSON.parse(d.receiptImages).map(i => ({ uri: `${config.BASE_URL}${i}` })) : []);
        setCurrentStatus(d.status === 'Pending' ? 0 : d.status === 'Ongoing' ? 1 : d.status === 'Completed' ? 2 : 3);
        setIsOn(d.staffAccess === 'yes');
      }
    } catch (e) { console.log(e); }
  };

  useFocusEffect(useCallback(() => { fetchInvoice(); }, [invoiceid]));

  // ── Dates ───────────────────────────────────────────────────────────────────
  const fmtDate = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };
  const fmtDateTime = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return '—';
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)}  ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
  };

  // ── Status swipe ────────────────────────────────────────────────────────────
  const updateStatus = (dir) => {
    setCurrentStatus(prev => {
      const next = Math.min(Math.max(prev + dir, 0), statuses.length - 1);
      if (next !== prev) callStatusAPI(statuses[next]);
      return next;
    });
  };
  const callStatusAPI = async (status) => {
    const res = await fetch(`${config.BASE_URL}updateOrderStatus.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptID: invoiceid, currentStatus: status }),
    });
    const result = await res.json();
    Toast.show(result.message === 'Order status updated successfully'
      ? { type: 'success', text1: 'Status updated', text2: status }
      : { type: 'error', text1: 'Failed to update' }
    );
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate(e => { translateX.value = e.translationX; })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD && currentStatus > 0) runOnJS(updateStatus)(-1);
      else if (translateX.value > SWIPE_THRESHOLD && currentStatus < statuses.length - 1) runOnJS(updateStatus)(1);
      translateX.value = withSpring(0);
    });

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const bgAnimStyle = useAnimatedStyle(() => {
    const ni = translateX.value < 0
      ? Math.min(currentStatus + 1, statuses.length - 1)
      : Math.max(currentStatus - 1, 0);
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
        [swipeColors[statuses[ni]], swipeColors[statuses[currentStatus]], swipeColors[statuses[ni]]]
      ),
    };
  });

  // ── Image delete ────────────────────────────────────────────────────────────
  const promptDeleteImg = (img) => {
    setRelativePath(img.uri.replace(config.BASE_URL, ''));
    setImgDeleteModal(true);
  };
  const confirmDeleteImg = async () => {
    setImgDeleteModal(false);
    const fd = new FormData();
    fd.append('imagePath', relativePath); fd.append('id', invoiceid);
    const res = await fetch(config.BASE_URL + 'deleteSingleImage_Order.php', { method: 'POST', body: fd });
    const r = await res.json();
    if (r.status === 'success') {
      const full = `${config.BASE_URL}${relativePath}`;
      if (relativePath.startsWith('uploads/designs/')) setDesignImages(p => p.filter(i => i.uri !== full));
      else setReceiptImages(p => p.filter(i => i.uri !== full));
    }
  };

  // ── Record delete ───────────────────────────────────────────────────────────
  const confirmDeleteRecord = async () => {
    setRecDeleteModal(false);
    const fd = new FormData();
    fd.append('id', invoiceid);
    const res = await fetch(config.BASE_URL + 'deleteCompleteInvoice.php', { method: 'POST', body: fd });
    const r = await res.json();
    if (r.status === 'success') navigation.navigate('InvoiceHome');
  };

  // ── Staff toggle ─────────────────────────────────────────────────────────
  const toggleStaff = async (val) => {
    setIsOn(val);
    await fetch(config.BASE_URL + 'toggleReciptStatus.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: val ? 'yes' : 'no', id: invoiceid }),
    });
  };

  // ── Payment ──────────────────────────────────────────────────────────────
  const handleAddPayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid amount', text2: 'Enter a valid payment amount' });
      return;
    }
    try {
      const res = await fetch(`${config.BASE_URL}addInvoicePayment.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceid, amount: Number(amount), payment_mode: mode, note,paymentDate: paymentDate.toISOString() }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        Toast.show({ type: 'success', text1: 'Payment added' });
        setAmount(''); setNote(''); setMode('Cash');
        setPaymentDate(new Date());
        setPaymentModal(false);
        fetchInvoice();
      } else {
        Toast.show({ type: 'error', text1: result.message || 'Failed to add payment' });
      }
    } catch (e) { console.log(e); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const editDetails = () => {
    navigation.navigate(source === 'StatusHome' ? 'EditInvoiceFilter' : 'EditInvoice', { invoice, source });
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const runShare = async () => {
    try {
      const msg = `Invoice #${invoice.invoice_number}\nName: ${invoice.name}\nOrder: ${fmtDate(invoice.orderDate)}\nDelivery: ${fmtDate(invoice.deliveryDate)}\nMobile: ${invoice.mobile}\nTotal: ₹${parseInt(invoice.totalAmount)}\nPaid: ₹${parseInt(invoice.amountGiven)}\nDue: ₹${parseInt(invoice.totalAmount) - parseInt(invoice.amountGiven)}\n\nDesign:\n${designImages.map(i => i.uri).join('\n')}\n\nReceipt:\n${receiptImages.map(i => i.uri).join('\n')}`;
      await Share.open({ title: 'Share Invoice', message: msg, urls: [...designImages, ...receiptImages].map(i => i.uri), social: Share.Social.WHATSAPP });
    } catch { }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!invoice) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <LottieView source={require('../../assets/Coin purse.json')} autoPlay loop style={{ width: 140, height: 140 }} />
        <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Loading invoice...</Text>
      </View>
    );
  }

  const bal = parseInt(invoice.totalAmount || 0) - parseInt(invoice.amountGiven || 0);
  const st = statusTheme(statuses[currentStatus]);
  const hasGold = invoice.gold_grams && parseFloat(invoice.gold_grams) > 0 ? true : false;
  const hasSilv = invoice.silver_grams && parseFloat(invoice.silver_grams) > 0 ? true : false;
  const gold_gram = invoice.gold_grams ?? 0;
  const silver_gram = invoice.silver_grams ?? 0;


  const goToPaymentHistory = () => {
    navigation.navigate('PaymentHistory', { invoiceid })
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <Header id={invoice.invoice_number} />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero Card ── */}
          <Block>
            <View style={s.heroRow}>
              {/* Avatar */}
              <View style={s.heroAvatar}>
                <Text style={s.heroAvatarLetter}>{(invoice.name?.[0] || '?').toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.heroName}>{invoice.name}</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${invoice.mobile}`)}
                  style={s.mobileRow}
                  activeOpacity={0.75}
                >
                  <Image source={phoneLogo} style={s.phoneIcon} />
                  <Text style={s.mobileText}>{invoice.mobile}</Text>
                </TouchableOpacity>
                {invoice.address ? <Text style={s.addressText} numberOfLines={2}>{invoice.address}</Text> : null}
              </View>
              {/* Staff toggle */}
              <View style={s.toggleWrap}>
                <Text style={s.toggleLabel}>Staff</Text>
                <ToggleSwitch
                  isOn={isOn}
                  onColor={C.primary}
                  offColor={C.border}
                  size="small"
                  onToggle={toggleStaff}
                />
              </View>
            </View>

            {/* Status badge */}
            <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
              <View style={[s.statusDot, { backgroundColor: st.dot }]} />
              <Text style={[s.statusText, { color: st.text }]}>{statuses[currentStatus]}</Text>
            </View>
          </Block>

          {/* ── Payment Summary ── */}
          <Block>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

              <SectionLabel text="Payment Summary" />
              <TouchableOpacity onPress={goToPaymentHistory}>
                <SectionLabel text="History" />
              </TouchableOpacity>
            </View>

            <View style={s.amtGrid}>
              <View style={s.amtCell}>
                <Text style={s.amtCellLabel}>Billed</Text>
                <Text style={s.amtCellValue}>₹{parseInt(invoice.totalAmount || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={s.amtDivider} />
              <View style={s.amtCell}>
                <Text style={s.amtCellLabel}>Paid</Text>
                <Text style={[s.amtCellValue, { color: C.primary }]}>₹{parseInt(invoice.amountGiven || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={s.amtDivider} />
              <View style={s.amtCell}>
                <Text style={s.amtCellLabel}>Due</Text>
                <Text style={[s.amtCellValue, { color: bal > 0 ? C.accent : C.primary }]}>₹{Math.abs(bal).toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Add payment */}
            <TouchableOpacity style={s.addPayBtn} onPress={() => setPaymentModal(true)} activeOpacity={0.85}>
              <Text style={s.addPayText}>+ Add Payment</Text>
            </TouchableOpacity>

            {(hasGold || hasSilv) && (
              <View style={s.metalRow}>
                {hasGold ? (
                  <View style={[s.metalPill, { backgroundColor: '#FFF8E1', borderColor: '#F5D76E' }]}>
                    <Text style={[s.metalPillText, { color: '#9A6D00' }]}>{`Gold  ${parseFloat(gold_gram).toFixed(3)}g`}</Text>
                  </View>
                ) : (<View></View>)}
                {hasSilv ? (
                  <View style={[s.metalPill, { backgroundColor: '#F0F0F0', borderColor: '#C0C0C0' }]}>
                    <Text style={[s.metalPillText, { color: '#5A5A6A' }]}>{`Silver  ${parseFloat(silver_gram).toFixed(3)}g`}</Text>
                  </View>
                ) : (<View></View>)}
              </View>
            )}
          </Block>

          {/* ── Order Info ── */}
          <Block>
            <SectionLabel text="Order Info" />
            <View>
              <InfoRow label="Order Date" value={fmtDate(invoice.orderDate)} />
              <InfoRow label="Delivery Date" value={fmtDate(invoice.deliveryDate)} />
              {invoice.description ? (
                <View style={{ paddingVertical: 10 }}>
                  <Text style={[ir.label, { marginBottom: 4 }]}>Notes</Text>
                  <Text style={{ fontSize: 14, color: C.textPrimary, lineHeight: 20 }}>{invoice.description}</Text>
                </View>
              ) : null}
              <View style={[ir.row, { borderBottomWidth: 0 }]}>
                <Text style={ir.label}>Created</Text>
                <Text style={[ir.value, { color: C.textMuted, fontSize: 12 }]}>{fmtDateTime(invoice.createdAt)}</Text>
              </View>
            </View>
          </Block>

          {/* ── Images ── */}
          {(receiptImages.length > 0 || designImages.length > 0) && (
            <Block>
              <SectionLabel text="Attachments" />

              {receiptImages.length > 0 && (
                <>
                  <Text style={s.imgSectionLabel}>Receipt Images</Text>
                  <View style={s.imgGrid}>
                    {receiptImages.map((img, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => { setSelectedIdx(designImages.length + i); setIsVisible(true); }}
                        onLongPress={() => promptDeleteImg(img)}
                        activeOpacity={0.85}
                        style={s.imgThumbWrap}
                      >
                        <Image source={{ uri: img.uri }} style={s.imgThumb} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {designImages.length > 0 && (
                <>
                  <Text style={[s.imgSectionLabel, receiptImages.length > 0 ? { marginTop: 14 } : null]}>Design Images</Text>
                  <View style={s.imgGrid}>
                    {designImages.map((img, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => { setSelectedIdx(i); setIsVisible(true); }}
                        onLongPress={() => promptDeleteImg(img)}
                        activeOpacity={0.85}
                        style={s.imgThumbWrap}
                      >
                        <Image source={{ uri: img.uri }} style={s.imgThumb} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              <Text style={s.imgHint}>Long press an image to remove it</Text>
            </Block>
          )}

          {/* ── Status Swiper ── */}
          <Block style={{ padding: 16 }}>
            <SectionLabel text="Update Status" />
            <Text style={s.swipeHint}>Swipe left to go back  ·  Swipe right to advance</Text>
            <Animated.View style={[s.swipeBg, bgAnimStyle]}>
              <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[s.swipeChip, animStyle]}>
                  <Text style={s.swipeChipText}>{statuses[currentStatus]}</Text>
                </Animated.View>
              </GestureDetector>
              <View style={s.swipeTrack}>
                {statuses.map((st, i) => (
                  <View key={st} style={[s.swipeDot, i <= currentStatus ? s.swipeDotFilled : null]} />
                ))}
              </View>
            </Animated.View>
          </Block>

          {/* ── Action Buttons ── */}
          <View style={s.actionRow}>
            <TouchableOpacity style={s.actionBtn} onPress={editDetails} activeOpacity={0.8}>
              <Image source={editLogo} style={[s.actionIcon, { tintColor: C.primary }]} />
              <Text style={[s.actionLabel, { color: C.primary }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.actionBtn, s.actionBtnDanger]} onPress={() => setRecDeleteModal(true)} activeOpacity={0.8}>
              <Image source={binLogo} style={[s.actionIcon, { tintColor: C.accent }]} />
              <Text style={[s.actionLabel, { color: C.accent }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.actionBtn, { borderColor: C.border }]} onPress={runShare} activeOpacity={0.8}>
              <Image source={shareLogo} style={[s.actionIcon, { tintColor: C.textSub }]} />
              <Text style={[s.actionLabel, { color: C.textSub }]}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        <ImageView
          images={[...designImages, ...receiptImages]}
          imageIndex={selectedIdx}
          visible={visible}
          onRequestClose={() => setIsVisible(false)}
        />

        {/* ── Delete Image Modal ── */}
        <ConfirmModal
          visible={imgDeleteModal}
          title="Remove Image"
          message="Are you sure you want to delete this image? This cannot be undone."
          onCancel={() => setImgDeleteModal(false)}
          onConfirm={confirmDeleteImg}
          confirmLabel="Delete"
          danger
        />

        {/* ── Delete Invoice Modal ── */}
        <ConfirmModal
          visible={recDeleteModal}
          title="Delete Invoice"
          message="This will permanently delete the invoice and all its data. Are you sure?"
          onCancel={() => setRecDeleteModal(false)}
          onConfirm={confirmDeleteRecord}
          confirmLabel="Delete Invoice"
          danger
        />

        {/* ── Payment Modal ── */}
        <Modal visible={paymentModal} transparent animationType="slide" onRequestClose={() => setPaymentModal(false)}>
          <View style={pm.backdrop}>
            <View style={pm.sheet}>
              <View style={pm.handle} />
              <Text style={pm.title}>Add Payment</Text>

              <Text style={pm.fieldLabel}>Amount (₹)</Text>
              <View style={pm.inputBox}>
                <TextInput
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor={C.textMuted}
                  style={pm.input}
                />
              </View>

              <Text style={pm.fieldLabel}>Payment Date</Text>
<TouchableOpacity
  style={pm.inputBox}
  onPress={() => setShowDatePicker(true)}
  activeOpacity={0.8}
>
  <Text style={{ fontSize: 15, color: C.textPrimary, fontWeight: '500' }}>
    📅  {paymentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
  </Text>
</TouchableOpacity>

<DatePicker
  modal
  open={showDatePicker}
  date={paymentDate}
  mode="date"
  maximumDate={new Date()}
  onConfirm={(date) => {
    setShowDatePicker(false);
    setPaymentDate(date);
  }}
  onCancel={() => setShowDatePicker(false)}
/>

              <Text style={pm.fieldLabel}>Payment Mode</Text>
              <View style={pm.modeRow}>
                {['Cash', 'UPI', 'Bank'].map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMode(m)}
                    style={[pm.modeChip, mode === m && pm.modeChipOn]}
                    activeOpacity={0.8}
                  >
                    <Text style={[pm.modeLabel, mode === m && pm.modeLabelOn]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={pm.fieldLabel}>Note (optional)</Text>
              <View style={[pm.inputBox, { minHeight: 80 }]}>
                <TextInput
                  placeholder="Any remarks..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                  placeholderTextColor={C.textMuted}
                  style={[pm.input, { textAlignVertical: 'top', paddingTop: 10 }]}
                />
              </View>

              <View style={pm.btnRow}>
                <TouchableOpacity style={pm.cancelBtn} onPress={() => setPaymentModal(false)} activeOpacity={0.8}>
                  <Text style={pm.cancelLabel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={pm.confirmBtn} onPress={handleAddPayment} activeOpacity={0.85}>
                  <Text style={pm.confirmLabel}>Add Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

// ─── Confirm Modal Component ──────────────────────────────────────────────────
const ConfirmModal = ({ visible, title, message, onCancel, onConfirm, confirmLabel, danger }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
    <View style={cf.backdrop}>
      <View style={cf.card}>
        <Text style={cf.title}>{title}</Text>
        <Text style={cf.msg}>{message}</Text>
        <View style={cf.row}>
          <TouchableOpacity style={cf.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={cf.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[cf.confirmBtn, danger ? { backgroundColor: C.accent, shadowColor: C.accent } : null]} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={cf.confirmLabel}>{confirmLabel || 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
const cf = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,46,53,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  card: { width: '100%', backgroundColor: C.white, borderRadius: 22, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 10 },
  title: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  msg: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  row: { flexDirection: 'row', width: '100%', gap: 12 },
  cancelBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
  cancelLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  confirmBtn: { flex: 1, height: 46, borderRadius: 12, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmLabel: { fontSize: 14, fontWeight: '700', color: C.white },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

  // Hero
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  heroAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primaryLight, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  heroAvatarLetter: { fontSize: 20, fontWeight: '700', color: C.primary },
  heroName: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 5 },
  mobileRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  phoneIcon: { width: 16, height: 16, tintColor: C.primary },
  mobileText: { fontSize: 14, color: C.primary, fontWeight: '600' },
  addressText: { fontSize: 13, color: C.textMuted, lineHeight: 18 },
  toggleWrap: { alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 10, fontWeight: '600', color: C.textMuted, letterSpacing: 0.5 },

  // Status badge
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },

  // Payment summary
  amtGrid: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 14, padding: 14, marginBottom: 14 },
  amtCell: { flex: 1, alignItems: 'center' },
  amtCellLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 4, letterSpacing: 0.4 },
  amtCellValue: { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  amtDivider: { width: 1, height: 36, backgroundColor: C.border },
  addPayBtn: {
    borderRadius: 12, borderWidth: 1.5, borderColor: C.primary,
    backgroundColor: C.primaryPale, paddingVertical: 10,
    alignItems: 'center', marginBottom: 12,
  },
  addPayText: { fontSize: 14, fontWeight: '700', color: C.primary },
  metalRow: { flexDirection: 'row', gap: 10 },
  metalPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  metalPillText: { fontSize: 13, fontWeight: '700' },

  // Images
  imgSectionLabel: { fontSize: 12, fontWeight: '700', color: C.textSub, marginBottom: 10, letterSpacing: 0.4 },
  imgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imgThumbWrap: { borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: C.border },
  imgThumb: { width: (W - 80) / 3, height: (W - 80) / 3 },
  imgHint: { fontSize: 11, color: C.textMuted, marginTop: 10, textAlign: 'center' },

  // Status swiper
  swipeHint: { fontSize: 12, color: C.textMuted, marginBottom: 12, textAlign: 'center' },
  swipeBg: { borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  swipeChip: { width: '32%', height: 44, backgroundColor: C.white, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  swipeChipText: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  swipeTrack: { position: 'absolute', bottom: 6, flexDirection: 'row', gap: 6 },
  swipeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  swipeDotFilled: { backgroundColor: C.white },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.primaryLight,
    shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  actionBtnDanger: { borderColor: C.accentPale },
  actionIcon: { width: 22, height: 22 },
  actionLabel: { fontSize: 12, fontWeight: '700' },
});

// ─── Payment Modal Styles ─────────────────────────────────────────────────────
const pm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,46,53,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 20, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  inputBox: { backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, minHeight: 50, justifyContent: 'center', marginBottom: 16 },
  input: { fontSize: 15, color: C.textPrimary, fontWeight: '500', paddingVertical: Platform.OS === 'ios' ? 12 : 6 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg, alignItems: 'center' },
  modeChipOn: { borderColor: C.primary, backgroundColor: C.primaryPale },
  modeLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  modeLabelOn: { color: C.primary },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
  cancelLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  confirmBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmLabel: { fontSize: 14, fontWeight: '700', color: C.white },
});

export default InvoiceDetail;
