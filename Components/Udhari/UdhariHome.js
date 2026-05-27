import {
  View, Text, Image, TouchableOpacity, StatusBar,
  FlatList, StyleSheet, Linking,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';

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
  cardShadow:   'rgba(26,158,143,0.08)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (ds) => {
  if (!ds) return '—';
  const d = new Date(ds);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtAmount = (v) =>
  `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

// ─── Udhari Card ──────────────────────────────────────────────────────────────
const UdhariCard = ({ item, onPress }) => {
  const total     = parseFloat(item.totalAmount  || 0);
  const paid      = parseFloat(item.amountGiven  || 0);
  const remaining = total - paid;
  const isCleared = remaining <= 0;

  const st = isCleared
    ? { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968', label: 'Cleared' }
    : { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623', label: 'Pending' };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={card.wrap}>

      {/* Date tag — top left */}
      <View style={card.dateTag}>
        <Text style={card.dateTagText}>{fmtDate(item.udharDate)}</Text>
      </View>

      {/* Avatar + Info row */}
      <View style={card.row}>

        {/* Avatar */}
        <View style={card.avatar}>
          <Text style={card.avatarLetter}>
            {(item.name?.[0] || '?').toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={card.info}>

          {/* Name */}
          <Text style={card.name} numberOfLines={1}>{item.name}</Text>

          {/* Mobile */}
          {item.mobile ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${item.mobile}`)}
              activeOpacity={0.7}
              style={card.mobileRow}
            >
              <Text style={card.mobileIcon}>📱</Text>
              <Text style={card.mobileText}>{item.mobile}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Address */}
          {item.address ? (
            <Text style={card.address} numberOfLines={1}>📍 {item.address}</Text>
          ) : null}

          {/* Amounts panel */}
          <View style={card.amtRow}>
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Billed</Text>
              <Text style={card.amtValue}>{fmtAmount(item.totalAmount)}</Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Paid</Text>
              <Text style={[card.amtValue, { color: C.primary }]}>
                {fmtAmount(item.amountGiven)}
              </Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Remaining</Text>
              <Text style={[card.amtValue, { color: isCleared ? C.primary : C.accent }]}>
                {fmtAmount(Math.abs(remaining))}
              </Text>
            </View>
          </View>

          {/* Status badge */}
          <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[card.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[card.statusText, { color: st.text }]}>{st.label}</Text>
          </View>

          {/* Description */}
          {item.description ? (
            <View style={card.descBox}>
              <Text style={card.descText} numberOfLines={2}>
                📝 {item.description}
              </Text>
            </View>
          ) : null}

        </View>
      </View>
    </TouchableOpacity>
  );
};

const card = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    paddingTop: 20,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  dateTag: {
    position: 'absolute',
    top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateTagText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 4 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primaryPale,
    borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: C.primary },
  info:         { flex: 1 },
  name:         { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  mobileRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  mobileIcon:   { fontSize: 12 },
  mobileText:   { fontSize: 13, color: C.primary, fontWeight: '600' },
  address:      { fontSize: 12, color: C.textMuted, marginBottom: 10 },
  amtRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 10,
    padding: 10, marginBottom: 10, gap: 4,
  },
  amtBlock:   { flex: 1, alignItems: 'center' },
  amtLabel:   { fontSize: 10, color: C.textMuted, fontWeight: '500', marginBottom: 2, letterSpacing: 0.3 },
  amtValue:   { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  amtDivider: { width: 1, height: 28, backgroundColor: C.border },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5,
    marginBottom: 8,
  },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  descBox: {
    backgroundColor: C.bg, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    borderLeftWidth: 3, borderLeftColor: C.border,
  },
  descText: { fontSize: 12, color: C.textSub, lineHeight: 18 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={empty.wrap}>
    <View style={{ height: 220, aspectRatio: 1 }}>
      <LottieView
        style={{ flex: 1 }}
        source={require('../../assets/Coin purse.json')}
        autoPlay loop
      />
    </View>
    <Text style={empty.title}>No Udhaar Today</Text>
    <Text style={empty.sub}>Nothing to show yet — check back later</Text>
  </View>
);
const empty = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingTop: 20, paddingHorizontal: 32 },
  title: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  sub:   { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const UdhariHome = () => {
  const navigation = useNavigation();
  const borrowImg  = require('../../assets/borrow.png');
  const bookImg    = require('../../assets/book.png');

  const [data, setData] = useState(null);

  const fetchTodaysUdhari = async () => {
    try {
      const res    = await fetch(`${config.BASE_URL}fetchTodaysUdhari.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await res.json();
      setData(result.status === 'success' ? result.data : []);
    } catch (e) { console.warn(e); }
  };

  useFocusEffect(useCallback(() => { fetchTodaysUdhari(); }, []));

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Quick Actions ── */}
      <View style={s.actionRow}>
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('AddUdhari')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={borrowImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>Add Udhaar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('ListAllUdhaar')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={bookImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>All Udhaar</Text>
        </TouchableOpacity>
      </View>

      {/* ── Section Title ── */}
      <View style={s.sectionTitleRow}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>Today's Udhaar</Text>
        {data !== null && (
          <View style={s.countPill}>
            <Text style={s.countText}>{data.length}</Text>
          </View>
        )}
      </View>

      {/* ── List / Empty ── */}
      {data === null ? null : data.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <UdhariCard
              item={item}
              onPress={() => navigation.navigate('UdhariDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  actionIcon:  { width: 28, height: 28, tintColor: C.primary },
  actionLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary, textAlign: 'center' },

  // Section title
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 6, gap: 8,
  },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: C.primary },
  sectionTitle:  { flex: 1, fontSize: 15, fontWeight: '700', color: C.textPrimary, letterSpacing: 0.1 },
  countPill: {
    backgroundColor: C.primaryLight, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { fontSize: 12, fontWeight: '700', color: C.primary },
});

export default UdhariHome;
