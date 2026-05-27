import { View, Text, Image, TouchableOpacity, StatusBar, FlatList, StyleSheet } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';

// ─── Same color system ────────────────────────────────────────────────────────
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

  // Status colors
  statusCompleted: { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968' },
  statusPending:   { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623' },
  statusOngoing:   { bg: '#E8F3FF', text: '#1A4FA0', dot: '#3B82F6' },
  statusDefault:   { bg: '#F5F5F5', text: '#555555', dot: '#AAAAAA' },

  // Metal colors
  metalGold:   { bg: '#FFF8E1', text: '#9A6D00', border: '#F5D76E' },
  metalSilver: { bg: '#F0F0F0', text: '#5A5A6A', border: '#C0C0C0' },
  metalMix:    { bg: '#F0EEFF', text: '#5B3FA0', border: '#B39DDB' },
  metalUnknown:{ bg: '#E8F5F3', text: '#1A9E8F',  border: '#C8E8E4' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = (status) => {
  if (status === 'Completed') return C.statusCompleted;
  if (status === 'Pending')   return C.statusPending;
  if (status === 'Ongoing')   return C.statusOngoing;
  return C.statusDefault;
};

const metalStyle = (metal) => {
  if (metal === 'Gold')   return C.metalGold;
  if (metal === 'Silver') return C.metalSilver;
  if (metal === 'Mix')    return C.metalMix;
  return C.metalUnknown;
};

const metalLabel = (metal) => {
  if (metal === 'Gold')   return 'Gold';
  if (metal === 'Silver') return 'Silver';
  if (metal === 'Mix')    return 'Mix';
  return metal || '—';
};

// ─── Invoice Card ─────────────────────────────────────────────────────────────
const InvoiceCard = ({ item, onPress }) => {
  const st  = statusStyle(item.status);
  const mt  = metalStyle(item.metal);
  const bal = (parseFloat(item.totalAmount || 0) - parseFloat(item.amountGiven || 0));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={card.wrap}>

      {/* Invoice number tag — top left */}
      <View style={card.invTag}>
        <Text style={card.invTagText}>#{item.invoice_number}</Text>
      </View>

      {/* Staff access dot — top right */}
      {item.staffAccess === 'yes' && <View style={card.staffDot} />}

      {/* Row: avatar + info */}
      <View style={card.row}>

        {/* Avatar */}
        <View style={card.avatar}>
          <Text style={card.avatarLetter}>
            {(item.name?.[0] || '?').toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={card.info}>

          {/* Name + metal */}
          <View style={card.nameRow}>
            <Text style={card.name} numberOfLines={1}>{item.name}</Text>
            <View style={[card.metalBadge, { backgroundColor: mt.bg, borderColor: mt.border }]}>
              <Text style={[card.metalText, { color: mt.text }]}>{metalLabel(item.metal)}</Text>
            </View>
          </View>

          {/* Amounts */}
          <View style={card.amtRow}>
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Billed</Text>
              <Text style={card.amtValue}>₹{parseFloat(item.totalAmount || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Paid</Text>
              <Text style={[card.amtValue, { color: C.primary }]}>₹{parseFloat(item.amountGiven || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Due</Text>
              <Text style={[card.amtValue, { color: bal > 0 ? C.accent : C.primary }]}>
                ₹{Math.abs(bal).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[card.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[card.statusText, { color: st.text }]}>{item.status}</Text>
          </View>

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
  invTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  invTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.4,
  },
  staffDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    marginTop: 2,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: C.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700', color: C.textPrimary, flex: 1, marginRight: 8 },
  metalBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  metalText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  amtRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 10,
    padding: 10, marginBottom: 10, gap: 4,
  },
  amtBlock: { flex: 1, alignItems: 'center' },
  amtLabel: { fontSize: 10, color: C.textMuted, fontWeight: '500', marginBottom: 2, letterSpacing: 0.3 },
  amtValue: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  amtDivider: { width: 1, height: 28, backgroundColor: C.border },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ label }) => (
  <View style={empty.wrap}>
    <View style={{ height: 220, aspectRatio: 1 }}>
      <LottieView style={{ flex: 1 }} source={require('../../assets/Animation - 1739937488069.json')} autoPlay loop />
    </View>
    <Text style={empty.title}>No {label} today</Text>
    <Text style={empty.sub}>Nothing to show yet — check back later</Text>
  </View>
);
const empty = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 32 },
  title: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  sub: { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const InvoiceHome = () => {
  const navigation  = useNavigation();
  const invoiceImg  = require('../../assets/invoice.png');
  const listImg     = require('../../assets/driving_license.png');
  const valueRef    = useRef('order');
  const [data, setData]   = useState(null);
  const [activeTab, setActiveTab] = useState('order');

  const fetchTodaysOrder = async () => {
    valueRef.current = 'order';
    setActiveTab('order');
    try {
      const res = await fetch(`${config.BASE_URL}fetchTodaysInvoice.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(),
      });
      const result = await res.json();
      if (result.status === 'success') setData(result.data);
    } catch (e) { console.warn(e); }
  };

  const fetchTodaysDelivery = async () => {
    valueRef.current = 'delivery';
    setActiveTab('delivery');
    try {
      const res = await fetch(`${config.BASE_URL}fetchTodaysDelivery.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(),
      });
      const result = await res.json();
      if (result.status === 'success') setData(result.data);
    } catch (e) { console.warn(e); }
  };

  useFocusEffect(
    useCallback(() => {
      valueRef.current === 'delivery' ? fetchTodaysDelivery() : fetchTodaysOrder();
    }, [])
  );

  const renderItem = ({ item }) => (
    <InvoiceCard
      item={item}
      onPress={() => navigation.navigate('InvoiceDetail', { invoiceid: item.id, source: 'InvoiceHome' })}
    />
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Quick Actions ── */}
      <View style={s.actionRow}>
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('AddInvoice')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={invoiceImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>Create Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('ListAllOrder')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={listImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>All Orders</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Bar ── */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'order' && s.tabActive]}
          onPress={fetchTodaysOrder}
          activeOpacity={0.8}
        >
          <Text style={[s.tabLabel, activeTab === 'order' && s.tabLabelActive]}>Today's Orders</Text>
          {activeTab === 'order' && <View style={s.tabUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === 'delivery' && s.tabActive]}
          onPress={fetchTodaysDelivery}
          activeOpacity={0.8}
        >
          <Text style={[s.tabLabel, activeTab === 'delivery' && s.tabLabelActive]}>Today's Delivery</Text>
          {activeTab === 'delivery' && <View style={s.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      {data && data.length === 0 ? (
        <EmptyState label={activeTab === 'delivery' ? 'deliveries' : 'orders'} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Quick actions
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
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: { width: 28, height: 28, tintColor: C.primary },
  actionLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary, textAlign: 'center' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: C.primaryPale,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: C.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
});

export default InvoiceHome;
