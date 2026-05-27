import {
  View, Text, Image, Modal, TouchableOpacity, StyleSheet,
  ScrollView, Linking, StatusBar, Platform, Dimensions,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  runOnJS, interpolateColor,
} from 'react-native-reanimated';
import Header from '../Common/Header';
import config from '../../config';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.3;

// ─── Color System ─────────────────────────────────────────────────────────────
const C = {
  primary:      '#1A9E8F',
  primaryLight: '#D6F5F1',
  primaryPale:  '#EEF9F8',
  accent:       '#FF7058',
  accentPale:   '#FEF1EE',
  bg:           '#F4FAF9',
  white:        '#FFFFFF',
  textPrimary:  '#1A2E35',
  textSub:      '#5A7A82',
  textMuted:    '#8FAAB0',
  border:       '#C8E8E4',
  inputBg:      '#FAFFFE',
  gold:         '#D4AF37',
  goldLight:    '#FFF8E1',
  goldBorder:   '#F5D76E',
  silver:       '#8A9BA8',
  silverLight:  '#F0F4F6',
  silverBorder: '#C0C8CE',
};

const statuses    = ['Rakhti', 'Chukti'];
const swipeColors = { Rakhti: '#F5A623', Chukti: '#25A968' };

const statusTheme = (s) => {
  if (s === 'Rakhti') return { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623' };
  if (s === 'Chukti') return { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968' };
  return { bg: C.bg, text: C.textMuted, dot: C.textMuted };
};

// ─── Reusable Sub-components ──────────────────────────────────────────────────
const InfoRow = ({ label, value, valueStyle, last }) => (
  <View style={[ir.row, last && { borderBottomWidth: 0 }]}>
    <Text style={ir.label}>{label}</Text>
    <Text style={[ir.value, valueStyle]} numberOfLines={3}>{value || '—'}</Text>
  </View>
);
const ir = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  label: { fontSize: 13, color: C.textSub, fontWeight: '500', flex: 0.9 },
  value: { fontSize: 14, color: C.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1.1, marginLeft: 16 },
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
  t: {
    fontSize: 11, fontWeight: '700', color: C.primary,
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14,
  },
});

// ─── Confirm Modal ────────────────────────────────────────────────────────────
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
          <TouchableOpacity
            style={[cf.confirmBtn, danger && { backgroundColor: C.accent, shadowColor: C.accent }]}
            onPress={onConfirm} activeOpacity={0.85}
          >
            <Text style={cf.confirmLabel}>{confirmLabel || 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
const cf = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(26,46,53,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  card: {
    width: '100%', backgroundColor: C.white, borderRadius: 22, padding: 24,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 10,
  },
  title:        { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  msg:          { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  row:          { flexDirection: 'row', width: '100%', gap: 12 },
  cancelBtn:    { flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
  cancelLabel:  { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  confirmBtn:   { flex: 1, height: 46, borderRadius: 12, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmLabel: { fontSize: 14, fontWeight: '700', color: C.white },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const BandhakDetail = () => {
  const route      = useRoute();
  const navigation = useNavigation();
  const { id }     = route.params;

  const phoneLogo  = require('../../assets/phone_call.png');
  const binLogo    = require('../../assets/delete.png');
  const editLogo   = require('../../assets/pen.png');

  const [data,               setData]               = useState(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [deleteModal,        setDeleteModal]         = useState(false);

  const translateX = useSharedValue(0);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDetail = async () => {
    try {
      const res    = await fetch(`${config.BASE_URL}fetchBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        const d = result.data[0];
        setData(d);
        setCurrentStatusIndex(d.status === 'Chukti' ? 1 : 0);
      }
    } catch (e) { console.warn(e); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  // ── Date Formatters ───────────────────────────────────────────────────────
  const fmtDate = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds);
    if (isNaN(d)) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  };

  const fmtTimestamp = (ts) => {
    if (!ts || typeof ts !== 'string') return '—';
    const [datePart, timePart] = ts.split(' ');
    if (!datePart || !timePart) return '—';
    const [year, month, day] = datePart.split('-');
    let [hour, minute] = timePart.split(':');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    hour = parseInt(hour, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = (hour % 12) || 12;
    return `${day} ${months[parseInt(month,10)-1]} ${year}  ${String(hour).padStart(2,'0')}:${minute} ${period}`;
  };

  // ── Status swipe ──────────────────────────────────────────────────────────
  const callStatusAPI = async (newStatus) => {
    try {
      const res    = await fetch(`${config.BASE_URL}updateBandhakStatus.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentStatus: newStatus }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        const d = result.data[0];
        setData(d);
        setCurrentStatusIndex(d.status === 'Chukti' ? 1 : 0);
        Toast.show({ type: 'success', text1: 'Status updated', text2: newStatus });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to update status' });
      }
    } catch (e) { console.warn(e); }
  };

  const updateStatus = (dir) => {
    setCurrentStatusIndex(prev => {
      const next = Math.min(Math.max(prev + dir, 0), statuses.length - 1);
      if (next !== prev) callStatusAPI(statuses[next]);
      return next;
    });
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate(e => { translateX.value = e.translationX; })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD && currentStatusIndex > 0)
        runOnJS(updateStatus)(-1);
      else if (translateX.value > SWIPE_THRESHOLD && currentStatusIndex < statuses.length - 1)
        runOnJS(updateStatus)(1);
      translateX.value = withSpring(0);
    });

  const animStyle   = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const bgAnimStyle = useAnimatedStyle(() => {
    const ni = translateX.value < 0
      ? Math.min(currentStatusIndex + 1, statuses.length - 1)
      : Math.max(currentStatusIndex - 1, 0);
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
        [
          swipeColors[statuses[ni]],
          swipeColors[statuses[currentStatusIndex]],
          swipeColors[statuses[ni]],
        ]
      ),
    };
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const res    = await fetch(`${config.BASE_URL}deleteBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      setDeleteModal(false);
      if (result.status === 'success') {
        Toast.show({ type: 'success', text1: 'Deleted', text2: 'Bandhak deleted successfully' });
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Failed to delete' });
      }
    } catch (e) { console.warn(e); }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <LottieView
          source={require('../../assets/Coin purse.json')}
          autoPlay loop
          style={{ width: 140, height: 140 }}
        />
        <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Loading bandhak...</Text>
      </View>
    );
  }

  const st       = statusTheme(statuses[currentStatusIndex]);
  const hasGold  = parseFloat(data.gold_weight   || 0) > 0;
  const hasSilv  = parseFloat(data.silver_weight || 0) > 0;
  const hindiDate = [data.hindi_date, data.hindi_month, data.hindi_year].filter(Boolean).join(' ') || '—';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <Header />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero Card ── */}
          <Block>
            <View style={s.heroRow}>
              {/* Avatar */}
              <View style={s.heroAvatar}>
                <Text style={s.heroAvatarLetter}>
                  {(data.name?.[0] || '?').toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.heroName}>{data.name}</Text>
                {data.father_name ? (
                  <Text style={s.fatherName}>S/O · W/O  {data.father_name}</Text>
                ) : null}
                {data.mobile_no ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${data.mobile_no}`)}
                    style={s.mobileRow} activeOpacity={0.75}
                  >
                    <Image source={phoneLogo} style={s.phoneIcon} />
                    <Text style={s.mobileText}>{data.mobile_no}</Text>
                  </TouchableOpacity>
                ) : null}
                {data.address ? (
                  <Text style={s.addressText} numberOfLines={2}>📍 {data.address}</Text>
                ) : null}
              </View>
            </View>

            {/* Status + Book row */}
            <View style={s.heroBadgeRow}>
              <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                <Text style={[s.statusText, { color: st.text }]}>{statuses[currentStatusIndex]}</Text>
              </View>
              {data.book_name ? (
                <View style={s.bookBadge}>
                  <Text style={s.bookBadgeText}>📖 {data.book_name}</Text>
                </View>
              ) : null}
              <View style={s.purjaBadge}>
                <Text style={s.purjaBadgeText}>Purja #{data.purja_no}</Text>
              </View>
            </View>
          </Block>

          {/* ── Metal & Amount ── */}
          <Block>
            <SectionLabel text="Pledge Details" />

            {/* Amount */}
            <View style={s.amtGrid}>
              <View style={s.amtCell}>
                <Text style={s.amtCellLabel}>Amount Given</Text>
                <Text style={s.amtCellValue}>
                  ₹{parseFloat(data.amount_given || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              {(hasGold || hasSilv) && <View style={s.amtDivider} />}
              {hasGold && (
                <View style={s.amtCell}>
                  <Text style={s.amtCellLabel}>Gold</Text>
                  <Text style={[s.amtCellValue, { color: '#9A6D00' }]}>
                    {parseFloat(data.gold_weight).toFixed(3)}g
                  </Text>
                </View>
              )}
              {hasGold && hasSilv && <View style={s.amtDivider} />}
              {hasSilv && (
                <View style={s.amtCell}>
                  <Text style={s.amtCellLabel}>Silver</Text>
                  <Text style={[s.amtCellValue, { color: '#4A5A65' }]}>
                    {parseFloat(data.silver_weight).toFixed(3)}g
                  </Text>
                </View>
              )}
            </View>

            {/* Metal pills */}
            {(hasGold || hasSilv) && (
              <View style={s.metalRow}>
                {hasGold && (
                  <View style={[s.metalPill, { backgroundColor: C.goldLight, borderColor: C.goldBorder }]}>
                    <Text style={[s.metalPillText, { color: '#9A6D00' }]}>🟡 Gold</Text>
                  </View>
                )}
                {hasSilv && (
                  <View style={[s.metalPill, { backgroundColor: C.silverLight, borderColor: C.silverBorder }]}>
                    <Text style={[s.metalPillText, { color: '#4A5A65' }]}>⚪ Silver</Text>
                  </View>
                )}
              </View>
            )}
          </Block>

          {/* ── Bandhak Info ── */}
          <Block>
            <SectionLabel text="Bandhak Info" />
            <InfoRow label="Book"         value={data.book_name} />
            <InfoRow label="Purja No."    value={data.purja_no} />
            <InfoRow label="Hindi Date"   value={hindiDate} />
            <InfoRow label="English Date" value={fmtDate(data.englishDate)} />
            {data.description ? (
              <View style={s.descBox}>
                <Text style={s.descLabel}>Description</Text>
                <Text style={s.descText}>{data.description}</Text>
              </View>
            ) : null}
            <InfoRow label="Created At" value={fmtTimestamp(data.created_at)} last
              valueStyle={{ color: C.textMuted, fontSize: 12 }} />
          </Block>

          {/* ── Status Swiper ── */}
          <Block style={{ padding: 16 }}>
            <SectionLabel text="Update Status" />
            <Text style={s.swipeHint}>Swipe right → Chukti  ·  Swipe left → Rakhti</Text>
            <Animated.View style={[s.swipeBg, bgAnimStyle]}>
              <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[s.swipeChip, animStyle]}>
                  <Text style={s.swipeChipText}>{statuses[currentStatusIndex]}</Text>
                </Animated.View>
              </GestureDetector>
              <View style={s.swipeTrack}>
                {statuses.map((st, i) => (
                  <View key={st} style={[s.swipeDot, i <= currentStatusIndex && s.swipeDotFilled]} />
                ))}
              </View>
            </Animated.View>
          </Block>

          {/* ── Action Buttons ── */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => navigation.navigate('AddBandhak', { data })}
              activeOpacity={0.8}
            >
              <Image source={editLogo} style={[s.actionIcon, { tintColor: C.primary }]} />
              <Text style={[s.actionLabel, { color: C.primary }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnDanger]}
              onPress={() => setDeleteModal(true)}
              activeOpacity={0.8}
            >
              <Image source={binLogo} style={[s.actionIcon, { tintColor: C.accent }]} />
              <Text style={[s.actionLabel, { color: C.accent }]}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* ── Delete Confirm Modal ── */}
        <ConfirmModal
          visible={deleteModal}
          title="Delete Bandhak"
          message="This will permanently delete this bandhak record. Are you sure?"
          onCancel={() => setDeleteModal(false)}
          onConfirm={handleDelete}
          confirmLabel="Delete"
          danger
        />
      </View>
    </GestureHandlerRootView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

  // Hero
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  heroAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.primaryLight, borderWidth: 2, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  heroAvatarLetter: { fontSize: 20, fontWeight: '700', color: C.primary },
  heroName:   { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 3 },
  fatherName: { fontSize: 13, color: C.textMuted, marginBottom: 4 },
  mobileRow:  { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  phoneIcon:  { width: 15, height: 15, tintColor: C.primary },
  mobileText: { fontSize: 14, color: C.primary, fontWeight: '600' },
  addressText:{ fontSize: 13, color: C.textMuted, lineHeight: 18 },

  heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 6,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  bookBadge: {
    backgroundColor: C.primaryPale, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.border,
  },
  bookBadgeText: { fontSize: 12, fontWeight: '700', color: C.primary },
  purjaBadge: {
    backgroundColor: C.bg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.border,
  },
  purjaBadgeText: { fontSize: 12, fontWeight: '600', color: C.textSub },

  // Pledge / Amount grid
  amtGrid: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 14, padding: 14, marginBottom: 14,
  },
  amtCell:      { flex: 1, alignItems: 'center' },
  amtCellLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 4, letterSpacing: 0.4 },
  amtCellValue: { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  amtDivider:   { width: 1, height: 36, backgroundColor: C.border },

  // Metal pills
  metalRow:      { flexDirection: 'row', gap: 10 },
  metalPill:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  metalPillText: { fontSize: 13, fontWeight: '700' },

  // Description
  descBox:   { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  descLabel: { fontSize: 13, color: C.textSub, fontWeight: '500', marginBottom: 4 },
  descText:  { fontSize: 14, color: C.textPrimary, lineHeight: 20 },

  // Status swiper
  swipeHint: { fontSize: 12, color: C.textMuted, marginBottom: 12, textAlign: 'center' },
  swipeBg: {
    borderRadius: 14, height: 56,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  swipeChip: {
    width: '32%', height: 44, backgroundColor: C.white, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  swipeChipText: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  swipeTrack: { position: 'absolute', bottom: 6, flexDirection: 'row', gap: 6 },
  swipeDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  swipeDotFilled: { backgroundColor: C.white },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.primaryLight,
    shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  actionBtnDanger: { borderColor: C.accentPale },
  actionIcon:  { width: 22, height: 22 },
  actionLabel: { fontSize: 12, fontWeight: '700' },
});

export default BandhakDetail;
