import {
  View, Text, Image, TouchableOpacity, StatusBar,
  StyleSheet, FlatList,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';
import C from '../../colorConfig';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  if (status === 'Released') return C.statusReleased;
  if (status === 'Pending')  return C.statusPending;
  if (status === 'Active')   return C.statusActive;
  return C.statusDefault;
};

const fmtAmount = (val) =>
  parseFloat(val || 0).toLocaleString('en-IN');

// ─── Bandhak Card ─────────────────────────────────────────────────────────────
const BandhakCard = ({ item, onPress }) => {
  const st         = getStatusStyle(item.status);
  const hasGold    = !!item.gold_weight;
  const hasSilver  = !!item.silver_weight;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={card.wrap}>

      {/* Book tag — top left */}
      <View style={card.bookTag}>
        <Text style={card.bookTagText}>{item.book_name || 'N/A'}</Text>
      </View>

      {/* Purja number — top right */}
      <View style={card.purjaTag}>
        <Text style={card.purjaTagText}>#{item.purja_no}</Text>
      </View>

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

          {/* Name */}
          <Text style={card.name} numberOfLines={1}>{item.name}</Text>
          {item.address ? (
            <Text style={card.address} numberOfLines={1}>📍 {item.address}</Text>
          ) : null}

          {/* Metal Badges */}
          <View style={card.metalRow}>
            {hasGold && (
              <View style={[card.metalBadge, { backgroundColor: C.goldLight, borderColor: C.goldBorder }]}>
                <Text style={[card.metalText, { color: '#9A6D00' }]}>🟡 Gold — {item.gold_weight}g</Text>
              </View>
            )}
            {hasSilver && (
              <View style={[card.metalBadge, { backgroundColor: C.silverLight, borderColor: C.silverBorder }]}>
                <Text style={[card.metalText, { color: '#4A5A65' }]}>⚪ Silver — {item.silver_weight}g</Text>
              </View>
            )}
          </View>

          {/* Amount + Date row */}
          <View style={card.amtRow}>
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Amount Given</Text>
              <Text style={card.amtValue}>₹{fmtAmount(item.amount_given)}</Text>
            </View>
            {item.englishDate ? (
              <>
                <View style={card.amtDivider} />
                <View style={card.amtBlock}>
                  <Text style={card.amtLabel}>Date</Text>
                  <Text style={card.amtValue}>
                    {new Date(item.englishDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Status Badge */}
          <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[card.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[card.statusText, { color: st.text }]}>{item.status || 'Active'}</Text>
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
    paddingTop: 22,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  bookTag: {
    position: 'absolute',
    top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bookTagText: {
    fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.4,
  },
  purjaTag: {
    position: 'absolute',
    top: 5, right: 12,
  },
  purjaTagText: {
    fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 0.3,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primaryPale,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
    marginTop: 2,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: C.primary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  address: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  metalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metalBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  metalText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
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
const EmptyState = () => (
  <View style={empty.wrap}>
    <View style={{ height: 220, aspectRatio: 1 }}>
      <LottieView
        style={{ flex: 1 }}
        source={require('../../assets/Animation - 1739937488069.json')}
        autoPlay loop
      />
    </View>
    <Text style={empty.title}>No Bandhak Today</Text>
    <Text style={empty.sub}>Nothing to show yet — check back later</Text>
  </View>
);
const empty = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 32 },
  title: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  sub: { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BandhakHome = () => {
  const navigation       = useNavigation();
  const goldloanImg      = require('../../assets/goldloan.png');
  const documentImg      = require('../../assets/document.png');
  const advanceSearchImg = require('../../assets/advanced-search.png');

  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res    = await fetch(`${config.BASE_URL}getTodaysBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await res.json();
      setData(result.status === 'success' ? result.data : []);
    } catch (e) {
      console.warn(e);
      setData([]);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchData(); }, [])
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Quick Actions ── */}
      <View style={s.actionRow}>
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('AddBandhak', { data: null })}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={goldloanImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>Create Bandhak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('ListAllBandak')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={documentImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>All Bandhak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('AdvanceFilter')}
          activeOpacity={0.82}
        >
          <View style={s.actionIconWrap}>
            <Image source={advanceSearchImg} style={s.actionIcon} />
          </View>
          <Text style={s.actionLabel}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Section Title ── */}
      <View style={s.sectionTitleRow}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>Today's Bandhak</Text>
        {data !== null && (
          <View style={s.countPill}>
            <Text style={s.countText}>{data.length}</Text>
          </View>
        )}
      </View>

      {/* ── List ── */}
      {data === null ? null : data.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <BandhakCard
              item={item}
              onPress={() => navigation.navigate('BandhakDetail', { id: item.id })}
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

  // Action Row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: { width: 26, height: 26, tintColor: C.primary },
  actionLabel: {
    fontSize: 12, fontWeight: '700', color: C.textPrimary,
    textAlign: 'center', letterSpacing: 0.1,
  },

  // Section title
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 6, gap: 8,
  },
  sectionAccent: {
    width: 4, height: 18, borderRadius: 2, backgroundColor: C.primary,
  },
  sectionTitle: {
    flex: 1, fontSize: 15, fontWeight: '700',
    color: C.textPrimary, letterSpacing: 0.1,
  },
  countPill: {
    backgroundColor: C.primaryLight, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { fontSize: 12, fontWeight: '700', color: C.primary },
});

export default BandhakHome;
