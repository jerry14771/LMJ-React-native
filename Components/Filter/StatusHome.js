import {
  View, Text, TextInput, ScrollView, Animated, Dimensions,
  Image, TouchableOpacity, FlatList, StyleSheet, Modal,
  TouchableWithoutFeedback, StatusBar, Platform,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import Header from '../Common/Header';
import DatePicker from 'react-native-date-picker';
import config from '../../config';
import LottieView from 'lottie-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import C from '../../colorConfig'

const { height: SCREEN_H } = Dimensions.get('window');
const PANEL_H = SCREEN_H * 0.88;

// ─── Status themes ────────────────────────────────────────────────────────────
const STATUS_THEME = {
  Pending: { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623' },
  Ongoing: { bg: '#E8F3FF', text: '#1A4FA0', dot: '#3B82F6' },
  Completed: { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968' },
  Delivered: { bg: '#F5F0FF', text: '#5B3FA0', dot: '#8B5CF6' },
};

const statusTheme = (s) => STATUS_THEME[s] || { bg: C.bg, text: C.textMuted, dot: C.textMuted };

// ─── Metal config ─────────────────────────────────────────────────────────────
const METAL_CONFIG = {
  Gold: { bg: C.goldLight, border: C.goldBorder, text: '#9A6D00', letter: 'G' },
  Silver: { bg: C.silverLight, border: C.silverBorder, text: '#4A5A65', letter: 'S' },
  Mix: { bg: C.mixLight, border: C.mixBorder, text: '#6C3483', letter: 'M' },
};

const STATUS_OPTIONS = ['Pending', 'Ongoing', 'Completed', 'Delivered'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionIconBox}>
      <Text style={s.sectionIconText}>{icon}</Text>
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

// ─── Date Range Row ───────────────────────────────────────────────────────────
const DateRangeRow = ({ label, startDate, endDate, onStartPress, onEndPress, onClear, calIcon }) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={s.rangeRow}>
      <TouchableOpacity style={[s.dateCard, { flex: 1 }]} onPress={onStartPress} activeOpacity={0.85}>
        <Image source={calIcon} style={s.calIcon} />
        <Text style={[s.dateCardText, !startDate && { color: C.textMuted, fontWeight: '400' }]}>
          {fmtDate(startDate) || 'From'}
        </Text>
      </TouchableOpacity>
      <Text style={s.rangeDash}>—</Text>
      <TouchableOpacity style={[s.dateCard, { flex: 1 }]} onPress={onEndPress} activeOpacity={0.85}>
        <Image source={calIcon} style={s.calIcon} />
        <Text style={[s.dateCardText, !endDate && { color: C.textMuted, fontWeight: '400' }]}>
          {fmtDate(endDate) || 'To'}
        </Text>
      </TouchableOpacity>
      {(startDate || endDate) && (
        <TouchableOpacity style={s.clearBtn} onPress={onClear} activeOpacity={0.8}>
          <Text style={s.clearBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── Invoice Card ─────────────────────────────────────────────────────────────
const InvoiceCard = ({ item, onPress }) => {
  const st = statusTheme(item.status);
  const metalConf = METAL_CONFIG[item.metal] || null;
  const bal = parseFloat(item.totalAmount || 0) - parseFloat(item.amountGiven || 0);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={card.wrap}>

      {/* Invoice number — top left ribbon */}
      <View style={card.invoiceTag}>
        <Text style={card.invoiceTagText}>#{item.invoice_number}</Text>
      </View>

      {/* Metal badge — top right */}
      {metalConf && (
        <View style={[card.metalBadge, { backgroundColor: metalConf.bg, borderColor: metalConf.border }]}>
          <Text style={[card.metalBadgeText, { color: metalConf.text }]}>
            {item.metal}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={card.row}>
        {/* Avatar */}
        <View style={card.avatar}>
          <Text style={card.avatarLetter}>{(item.name?.[0] || '?').toUpperCase()}</Text>
        </View>

        <View style={card.info}>
          <Text style={card.name} numberOfLines={1}>{item.name}</Text>

          {/* Amounts panel */}
          <View style={card.amtRow}>
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Billed</Text>
              <Text style={card.amtValue}>
                ₹{parseFloat(item.totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Paid</Text>
              <Text style={[card.amtValue, { color: C.primary }]}>
                ₹{parseFloat(item.amountGiven || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Due</Text>
              <Text style={[card.amtValue, { color: bal > 0 ? C.accent : C.primary }]}>
                ₹{Math.abs(bal).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Status badge */}
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
    paddingTop: 22,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  invoiceTag: {
    position: 'absolute', top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16, borderBottomRightRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  invoiceTagText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.4 },
  metalBadge: {
    position: 'absolute', top: 8, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1,
  },
  metalBadgeText: { fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 4 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: C.primary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 10, marginRight: 52 },
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
  statusText: { fontSize: 11, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StatusHome = () => {
  const navigation = useNavigation();
  const calanderLogo = require('../../assets/calendar.png');
  const GoldLogo = require('../../assets/gold_bar_shie.png');
  const SilverLogo = require('../../assets/silver_compressed.png');
  const MixLogo = require('../../assets/mix.png');

  // Filter state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [amountmin, setAmountmin] = useState('');
  const [amountmax, setAmountmax] = useState('');
  const [metal, setMetal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [deliverDateStart, setDeliverDateStart] = useState(null);
  const [deliverDateEnd, setDeliverDateEnd] = useState(null);
  const [orderDateStart, setOrderDateStart] = useState(null);
  const [orderDateEnd, setOrderDateEnd] = useState(null);

  // Date picker modals
  const [dpDeliverStart, setDpDeliverStart] = useState(false);
  const [dpDeliverEnd, setDpDeliverEnd] = useState(false);
  const [dpOrderStart, setDpOrderStart] = useState(false);
  const [dpOrderEnd, setDpOrderEnd] = useState(false);

  // Results / UI state
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [statusModal, setStatusModal] = useState(false);

  // Panel animation
  const heightAnim = useRef(new Animated.Value(PANEL_H)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  const togglePanel = (forceClose = false) => {
    const closing = forceClose || panelOpen;
    setPanelOpen(!closing);
    Animated.parallel([
      Animated.timing(heightAnim, { toValue: closing ? 0 : PANEL_H, duration: 320, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: closing ? 0 : 1, duration: 280, useNativeDriver: false }),
      Animated.timing(arrowAnim, { toValue: closing ? 1 : 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const arrowRotate = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  // ── API ───────────────────────────────────────────────────────────────────
  const hitSearchAPI = async (pageNumber = 1) => {
    if (loading) return;
    pageNumber === 1 ? setSearchLoading(true) : setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}advanceSearch.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pageNumber, name, address, amountmin, amountmax, metal,
          deliverDateStart, deliverDateEnd, orderDateStart, orderDateEnd,
          selectedStatus,
        }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setData(prev => pageNumber === 1 ? result.data : [...(prev || []), ...result.data]);
        if (result.data.length < 50) setHasMore(false);
      }
    } catch (e) { console.warn(e); }
    setSearchLoading(false); setLoading(false);
  };

  const fetchFilteredData = useCallback(() => {
    setPage(1); setHasMore(true); hitSearchAPI(1);
  }, [name, address, amountmin, amountmax, metal, deliverDateStart, deliverDateEnd, orderDateStart, orderDateEnd, selectedStatus]);

  useFocusEffect(useCallback(() => { fetchFilteredData(); }, [fetchFilteredData]));

  const handleSearch = () => {
    togglePanel(true);
    setTimeout(() => { setPage(1); setHasMore(true); hitSearchAPI(1); }, 300);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const next = page + 1; setPage(next); hitSearchAPI(next);
    }
  };

  // ── Active filter count ───────────────────────────────────────────────────
  const activeCount = [
    name,
    address, amountmin || amountmax, metal,
    selectedStatus.length > 0,
    deliverDateStart || deliverDateEnd,
    orderDateStart || orderDateEnd,
  ].filter(Boolean).length;

  const resetAll = () => {
    setName('');
    setAddress(''); setAmountmin(''); setAmountmax(''); setMetal('');
    setSelectedStatus([]); setDeliverDateStart(null); setDeliverDateEnd(null);
    setOrderDateStart(null); setOrderDateEnd(null);
  };

  // ── Metal toggle ──────────────────────────────────────────────────────────
  const MetalToggle = ({ type, logo }) => {
    const conf = METAL_CONFIG[type];
    const active = metal === type;
    return (
      <TouchableOpacity
        style={[s.metalToggle, active && {
          borderColor: conf.border, backgroundColor: conf.bg,
          shadowColor: conf.border, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
        }]}
        onPress={() => setMetal(active ? '' : type)}
        activeOpacity={0.8}
      >
        <Image source={logo} style={s.metalImg} />
        <Text style={[s.metalLabel, active && { color: conf.text, fontWeight: '700' }]}>{type}</Text>
        {active && <View style={[s.metalDot, { backgroundColor: conf.text }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <View>
          <Text style={s.topTitle}>Invoice Filter</Text>
          <Text style={s.topSub}>
            {data !== null
              ? `${data.length} result${data.length !== 1 ? 's' : ''} found`
              : 'Filter invoices by any criteria'}
          </Text>
        </View>
        <View style={s.topRight}>
          {activeCount > 0 && (
            <TouchableOpacity style={s.resetBtn} onPress={resetAll} activeOpacity={0.8}>
              <Text style={s.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.toggleBtn} onPress={() => togglePanel()} activeOpacity={0.85}>
            {activeCount > 0 && !panelOpen && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeCount}</Text>
              </View>
            )}
            <Animated.Text style={[s.toggleArrow, { transform: [{ rotate: arrowRotate }] }]}>⌃</Animated.Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter Panel ── */}
      <Animated.View style={[s.panelWrap, { height: heightAnim, opacity: opacityAnim }]}>
        <ScrollView
          contentContainerStyle={s.panelScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Name */}
          <View style={s.card}>
            <SectionHeader icon="👤" title="Customer Name" />
            <View style={s.fieldRow}>
              <View style={s.fieldBox}>
                <Text style={s.fieldIcon}>🔤</Text>
                <TextInput
                  placeholder="Search by name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>
              {name.length > 0 && (
                <TouchableOpacity style={s.clearBtn} onPress={() => setName('')} activeOpacity={0.8}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Address */}
          <View style={s.card}>
            <SectionHeader icon="📍" title="Address" />
            <View style={s.fieldRow}>
              <View style={s.fieldBox}>
                <Text style={s.fieldIcon}>🏠</Text>
                <TextInput
                  placeholder="Search by address"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>
              {address.length > 0 && (
                <TouchableOpacity style={s.clearBtn} onPress={() => setAddress('')} activeOpacity={0.8}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Amount Range */}
          <View style={s.card}>
            <SectionHeader icon="💳" title="Billing Amount" />
            <View style={s.rangeRow}>
              <View style={[s.fieldBox, { flex: 1 }]}>
                <Text style={s.fieldIcon}>₹</Text>
                <TextInput
                  placeholder="Min"
                  value={amountmin}
                  onChangeText={setAmountmin}
                  keyboardType="numeric"
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>
              <Text style={s.rangeDash}>—</Text>
              <View style={[s.fieldBox, { flex: 1 }]}>
                <Text style={s.fieldIcon}>₹</Text>
                <TextInput
                  placeholder="Max"
                  value={amountmax}
                  onChangeText={setAmountmax}
                  keyboardType="numeric"
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>
              {(amountmin || amountmax) ? (
                <TouchableOpacity style={s.clearBtn} onPress={() => { setAmountmin(''); setAmountmax(''); }} activeOpacity={0.8}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Metal */}
          <View style={s.card}>
            <SectionHeader icon="💎" title="Metal Type" />
            <View style={s.metalRow}>
              <MetalToggle type="Gold" logo={GoldLogo} />
              <MetalToggle type="Silver" logo={SilverLogo} />
              <MetalToggle type="Mix" logo={MixLogo} />
            </View>
          </View>

          {/* Status */}
          <View style={s.card}>
            <SectionHeader icon="🏷️" title="Order Status" />
            <View style={s.statusChipRow}>
              {STATUS_OPTIONS.map(opt => {
                const theme = statusTheme(opt);
                const selected = selectedStatus.includes(opt);
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[s.statusChip, selected && { borderColor: theme.dot, backgroundColor: theme.bg }]}
                    onPress={() => setSelectedStatus(
                      selected
                        ? selectedStatus.filter(i => i !== opt)
                        : [...selectedStatus, opt]
                    )}
                    activeOpacity={0.8}
                  >
                    <View style={[s.statusChipDot, { backgroundColor: theme.dot }]} />
                    <Text style={[s.statusChipLabel, selected && { color: theme.text, fontWeight: '700' }]}>
                      {opt}
                    </Text>
                    {selected && <Text style={[s.statusCheck, { color: theme.dot }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedStatus.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedStatus([])} style={s.clearStatusBtn}>
                <Text style={s.clearStatusText}>Clear selection</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Delivery Date Range */}
          <View style={s.card}>
            <SectionHeader icon="🚚" title="Delivery Date" />
            <DateRangeRow
              label="" calIcon={calanderLogo}
              startDate={deliverDateStart} endDate={deliverDateEnd}
              onStartPress={() => setDpDeliverStart(true)}
              onEndPress={() => setDpDeliverEnd(true)}
              onClear={() => { setDeliverDateStart(null); setDeliverDateEnd(null); }}
            />
          </View>

          <DatePicker modal title="Delivery Date — From" mode="date" theme="light"
            open={dpDeliverStart} date={deliverDateStart || new Date()}
            onConfirm={d => { setDpDeliverStart(false); setDeliverDateStart(d); }}
            onCancel={() => setDpDeliverStart(false)} />
          <DatePicker modal title="Delivery Date — To" mode="date" theme="light"
            open={dpDeliverEnd} date={deliverDateEnd || new Date()}
            onConfirm={d => { setDpDeliverEnd(false); setDeliverDateEnd(d); }}
            onCancel={() => setDpDeliverEnd(false)} />

          {/* Order Date Range */}
          <View style={s.card}>
            <SectionHeader icon="📋" title="Order Date" />
            <DateRangeRow
              label="" calIcon={calanderLogo}
              startDate={orderDateStart} endDate={orderDateEnd}
              onStartPress={() => setDpOrderStart(true)}
              onEndPress={() => setDpOrderEnd(true)}
              onClear={() => { setOrderDateStart(null); setOrderDateEnd(null); }}
            />
          </View>

          <DatePicker modal title="Order Date — From" mode="date" theme="light"
            open={dpOrderStart} date={orderDateStart || new Date()}
            onConfirm={d => { setDpOrderStart(false); setOrderDateStart(d); }}
            onCancel={() => setDpOrderStart(false)} />
          <DatePicker modal title="Order Date — To" mode="date" theme="light"
            open={dpOrderEnd} date={orderDateEnd || new Date()}
            onConfirm={d => { setDpOrderEnd(false); setOrderDateEnd(d); }}
            onCancel={() => setDpOrderEnd(false)} />

          {/* Search Button */}
          {/* <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.9}>
            <Text style={s.searchBtnText}>Search Invoices  →</Text>
          </TouchableOpacity> */}

          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {/* ── Results ── */}
      {searchLoading ? (
        <View style={s.loaderWrap}>
          <LottieView
            style={{ flex: 1 }}
            source={require('../../assets/Coin purse.json')}
            autoPlay loop
          />
          <Text style={s.loaderText}>Searching...</Text>
        </View>
      ) : data !== null && data.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={{ height: 220, aspectRatio: 1 }}>
            <LottieView
              style={{ flex: 1 }}
              source={require('../../assets/Animation - 1739937488069.json')}
              autoPlay loop
            />
          </View>
          <Text style={s.emptyTitle}>No results found</Text>
          <Text style={s.emptySub}>Try adjusting your filters</Text>
        </View>
      ) : data && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <InvoiceCard
              item={item}
              onPress={() => navigation.navigate('StatusHomeInvoiceDetail', {
                invoiceid: item.id, source: 'StatusHome',
              })}
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <LottieView
                  style={{ flex: 1 }}
                  source={require('../../assets/Coin purse.json')}
                  autoPlay loop
                />
                <Text style={[s.loaderText, { marginTop: 6, fontSize: 12 }]}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EDF4F3',
  },
  topTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  topSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.accentPale, borderWidth: 1, borderColor: '#FFCDC6' },
  resetBtnText: { fontSize: 12, fontWeight: '700', color: C.accent },
  toggleBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  toggleArrow: { fontSize: 18, fontWeight: '700', color: C.primary },
  filterBadge: { position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  filterBadgeText: { fontSize: 9, fontWeight: '800', color: C.white },

  // Panel
  panelWrap: { overflow: 'hidden' },
  panelScroll: { padding: 16, paddingTop: 12 },

  // Card
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: 'rgba(26,158,143,0.1)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  sectionIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center' },
  sectionIconText: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },

  // Fields
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, minHeight: 48,
  },
  fieldIcon: { fontSize: 14, marginRight: 8, color: C.primary },
  fieldInput: { flex: 1, color: C.textPrimary, fontSize: 14, fontWeight: '500', paddingVertical: Platform.OS === 'ios' ? 12 : 6 },

  // Range row
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeDash: { fontSize: 16, color: C.textMuted, fontWeight: '500' },

  // Clear button
  clearBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.accentPale, borderWidth: 1, borderColor: '#FFCDC6', justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { fontSize: 11, fontWeight: '800', color: C.accent },

  // Metal
  metalRow: { flexDirection: 'row', gap: 8 },
  metalToggle: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.inputBg, position: 'relative',
  },
  metalImg: { width: 24, height: 24 },
  metalLabel: { fontSize: 13, fontWeight: '500', color: C.textMuted },
  metalDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4 },

  // Status chips (multi-select inline)
  statusChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg,
  },
  statusChipDot: { width: 8, height: 8, borderRadius: 4 },
  statusChipLabel: { fontSize: 13, fontWeight: '500', color: C.textMuted },
  statusCheck: { fontSize: 12, fontWeight: '700' },
  clearStatusBtn: { marginTop: 10, alignSelf: 'flex-end' },
  clearStatusText: { fontSize: 12, color: C.accent, fontWeight: '600' },

  // Date cards
  dateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  calIcon: { width: 16, height: 16, tintColor: C.primary },
  dateCardText: { fontSize: 13, fontWeight: '600', color: C.textPrimary, flex: 1 },

  // Search button
  searchBtn: {
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  searchBtnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  // Loader / empty
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center' },
});

export default StatusHome;
