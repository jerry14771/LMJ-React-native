import {
  View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback,
  FlatList, TextInput, Image, Animated, Dimensions, StyleSheet,
  ScrollView, StatusBar, Platform,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import Header from '../Common/Header';
import LottieView from 'lottie-react-native';
import config from '../../config';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_H } = Dimensions.get('window');
const PANEL_H = SCREEN_H * 0.88;

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

  statusRakhti: { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623' },
  statusChukti: { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968' },
  statusDefault:{ bg: '#F5F5F5', text: '#555555', dot: '#AAAAAA' },
};

const BOOKS    = ['B*A', 'B*K*J', 'Bina Purza', 'B*K'];
const STATUSES = ['Rakhti', 'Chukti'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusStyle = (s) => {
  if (!s) return C.statusDefault;
  if (s === 'Rakhti') return C.statusRakhti;
  if (s === 'Chukti') return C.statusChukti;
  return C.statusDefault;
};

const fmtAmount = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionIconBox}>
      <Text style={s.sectionIconText}>{icon}</Text>
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

// ─── Field with clear button ──────────────────────────────────────────────────
const FilterField = ({ label, icon, value, onChangeText, onClear, placeholder, keyboardType }) => (
  <View style={s.fieldWrap}>
    {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
    <View style={s.fieldRow}>
      <View style={s.fieldBox}>
        {icon ? <Text style={s.fieldIcon}>{icon}</Text> : null}
        <TextInput
          style={s.fieldInput}
          placeholder={placeholder || label}
          placeholderTextColor={C.textMuted}
          value={value || ''}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
        />
      </View>
      {(value && value.length > 0) ? (
        <TouchableOpacity style={s.clearBtn} onPress={onClear} activeOpacity={0.8}>
          <Text style={s.clearBtnText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

// ─── Bandhak Result Card ──────────────────────────────────────────────────────
const BandhakCard = ({ item, onPress }) => {
  const st        = getStatusStyle(item.status);
  const hasGold   = parseFloat(item.gold_weight   || 0) > 0;
  const hasSilver = parseFloat(item.silver_weight || 0) > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={card.wrap}>
      <View style={card.bookTag}>
        <Text style={card.bookTagText}>{item.book_name || 'N/A'}</Text>
      </View>
      <View style={card.purjaTag}>
        <Text style={card.purjaTagText}>#{item.purja_no}</Text>
      </View>

      <View style={card.row}>
        <View style={card.avatar}>
          <Text style={card.avatarLetter}>{(item.name?.[0] || '?').toUpperCase()}</Text>
        </View>
        <View style={card.info}>
          <Text style={card.name} numberOfLines={1}>{item.name}</Text>
          {item.address ? <Text style={card.address} numberOfLines={1}>📍 {item.address}</Text> : null}

          {(hasGold || hasSilver) && (
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
          )}

          <View style={card.amtRow}>
            <View style={card.amtCell}>
              <Text style={card.amtLabel}>Amount Given</Text>
              <Text style={card.amtValue}>{fmtAmount(item.amount_given)}</Text>
            </View>
            {item.englishDate ? (
              <>
                <View style={card.amtDivider} />
                <View style={card.amtCell}>
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

          <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[card.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[card.statusText, { color: st.text }]}>{item.status || 'Rakhti'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const card = StyleSheet.create({
  wrap: {
    backgroundColor: C.white, borderRadius: 16,
    marginHorizontal: 16, marginVertical: 5,
    padding: 16, paddingTop: 22,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  bookTag: {
    position: 'absolute', top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16, borderBottomRightRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  bookTagText:  { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.4 },
  purjaTag:     { position: 'absolute', top: 6, right: 12 },
  purjaTagText: { fontSize: 11, fontWeight: '700', color: C.textMuted },
  row:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  avatarLetter: { fontSize: 17, fontWeight: '700', color: C.primary },
  info:         { flex: 1 },
  name:         { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  address:      { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  metalRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metalBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  metalText:    { fontSize: 11, fontWeight: '700' },
  amtRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 10,
    padding: 8, marginBottom: 8, gap: 4,
  },
  amtCell:    { flex: 1, alignItems: 'center' },
  amtLabel:   { fontSize: 10, color: C.textMuted, fontWeight: '500', marginBottom: 2, letterSpacing: 0.3 },
  amtValue:   { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  amtDivider: { width: 1, height: 26, backgroundColor: C.border },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5,
  },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AdvanceFilter = () => {
  const navigation = useNavigation();
  const GoldLogo   = require('../../assets/gold_bar_shie.png');
  const SilverLogo = require('../../assets/silver_compressed.png');

  // Filter state
  const [selectedBook,    setSelectedBook]    = useState(null);
  const [name,            setName]            = useState('');
  const [fatherName,      setFatherName]      = useState('');
  const [address,         setAddress]         = useState('');
  const [minamount,       setMinAmount]       = useState('');
  const [maxamount,       setMaxAmount]       = useState('');
  const [status,          setStatus]          = useState(null);
  const [isGoldSelected,  setIsGoldSelected]  = useState(false);
  const [isSilverSelected,setIsSilverSelected]= useState(false);
  const [goldMinWeight,   setGoldMinWeight]   = useState('');
  const [goldMaxWeight,   setGoldMaxWeight]   = useState('');
  const [silverMinWeight, setSilverMinWeight] = useState('');
  const [silverMaxWeight, setSilverMaxWeight] = useState('');

  // UI state
  const [data,          setData]          = useState(null);
  const [busy,          setBusy]          = useState(false);
  const [panelOpen,     setPanelOpen]     = useState(true);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [modalType,     setModalType]     = useState('');
  const [searched,      setSearched]      = useState(false);

  // Animation
  const heightAnim  = useRef(new Animated.Value(PANEL_H)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim   = useRef(new Animated.Value(0)).current;

  const togglePanel = (forceClose = false) => {
    const closing = forceClose || panelOpen;
    setPanelOpen(!closing);
    Animated.parallel([
      Animated.timing(heightAnim,  { toValue: closing ? 0 : PANEL_H,  duration: 320, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: closing ? 0 : 1,        duration: 280, useNativeDriver: false }),
      Animated.timing(arrowAnim,   { toValue: closing ? 1 : 0,        duration: 300, useNativeDriver: true  }),
    ]).start();
  };

  const arrowRotate = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const openModal = (type) => { setModalType(type); setModalVisible(true); };
  const selectValue = (val) => {
    if (modalType === 'books')  setSelectedBook(val);
    if (modalType === 'status') setStatus(val);
    setModalVisible(false);
  };

  useFocusEffect(
  useCallback(() => {
    if (searched) {
      handleSearch();   // re-run search when coming back
    }
  }, [searched])
);

  const handleSearch = async () => {
    togglePanel(true);
    setBusy(true);
    setSearched(true);
    try {
      const res    = await fetch(`${config.BASE_URL}advanceSearchBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedBook, name, fatherName, address,
          minamount, maxamount,
          goldMinWeight, goldMaxWeight,
          silverMinWeight, silverMaxWeight,
          isGoldSelected, isSilverSelected,
          status,
        }),
      });
      const result = await res.json();
      setData(result.status === 'success' ? result.data : []);
    } catch (e) { console.warn(e); setData([]); }
    finally { setBusy(false); }
  };

  const resetAll = () => {
    setSelectedBook(null); setName(''); setFatherName(''); setAddress('');
    setMinAmount(''); setMaxAmount(''); setStatus(null);
    setIsGoldSelected(false); setIsSilverSelected(false);
    setGoldMinWeight(''); setGoldMaxWeight('');
    setSilverMinWeight(''); setSilverMaxWeight('');
    setData(null); setSearched(false);
  };

  const activeFilterCount = [
    selectedBook, name, fatherName, address,
    minamount || maxamount, status,
    isGoldSelected, isSilverSelected,
  ].filter(Boolean).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <View>
          <Text style={s.topTitle}>Advanced Filter</Text>
          <Text style={s.topSub}>
            {searched && data !== null
              ? `${data.length} result${data.length !== 1 ? 's' : ''} found`
              : 'Set filters and search'}
          </Text>
        </View>
        <View style={s.topRight}>
          {activeFilterCount > 0 && (
            <TouchableOpacity style={s.resetBtn} onPress={resetAll} activeOpacity={0.8}>
              <Text style={s.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.toggleBtn} onPress={() => togglePanel()} activeOpacity={0.85}>
            {activeFilterCount > 0 && !panelOpen && (
              <View style={s.filterCountBadge}>
                <Text style={s.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
            <Animated.Text style={[s.toggleArrow, { transform: [{ rotate: arrowRotate }] }]}>⌃</Animated.Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter Panel (animated collapse) ── */}
      <Animated.View style={[s.panelWrap, { height: heightAnim, opacity: opacityAnim }]}>
        <ScrollView
          contentContainerStyle={s.panelScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Book & Status */}
          <View style={s.card}>
            <SectionHeader icon="📚" title="Book & Status" />

            <Text style={s.fieldLabel}>Book</Text>
            <View style={s.fieldRow}>
              <TouchableOpacity
                style={[s.fieldBox, s.selectBox]}
                onPress={() => openModal('books')}
                activeOpacity={0.85}
              >
                <Text style={s.selectIcon}>📖</Text>
                <Text style={[s.selectText, !selectedBook && { color: C.textMuted }]}>
                  {selectedBook || 'Choose Book'}
                </Text>
                <Text style={s.selectChevron}>›</Text>
              </TouchableOpacity>
              {selectedBook && (
                <TouchableOpacity style={s.clearBtn} onPress={() => setSelectedBook(null)} activeOpacity={0.8}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[s.fieldLabel, { marginTop: 10 }]}>Status</Text>
            <View style={s.fieldRow}>
              <View style={s.statusChipRow}>
                {['Rakhti', 'Chukti'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.statusChip, status === opt && s.statusChipActive]}
                    onPress={() => setStatus(status === opt ? null : opt)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.statusChipDot, {
                      backgroundColor: opt === 'Rakhti' ? '#F5A623' : '#25A968'
                    }]} />
                    <Text style={[s.statusChipLabel, status === opt && s.statusChipLabelActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Client Info */}
          <View style={s.card}>
            <SectionHeader icon="👤" title="Client Info" />
            <FilterField
              label="Name" icon="✎"
              value={name} onChangeText={setName}
              onClear={() => setName('')}
              placeholder="Search by name"
            />
            <FilterField
              label="Father / Husband Name" icon="👨‍👦"
              value={fatherName} onChangeText={setFatherName}
              onClear={() => setFatherName('')}
              placeholder="Father or husband's name"
            />
            <FilterField
              label="Address" icon="📍"
              value={address} onChangeText={setAddress}
              onClear={() => setAddress('')}
              placeholder="Search by address"
            />
          </View>

          {/* Amount Range */}
          <View style={s.card}>
            <SectionHeader icon="💳" title="Amount Range" />
            <View style={s.rangeRow}>
              <View style={[s.fieldBox, { flex: 1 }]}>
                <Text style={s.fieldIcon}>₹</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="Min amount"
                  placeholderTextColor={C.textMuted}
                  value={minamount || ''}
                  onChangeText={setMinAmount}
                  keyboardType="numeric"
                />
              </View>
              <Text style={s.rangeDash}>—</Text>
              <View style={[s.fieldBox, { flex: 1 }]}>
                <Text style={s.fieldIcon}>₹</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="Max amount"
                  placeholderTextColor={C.textMuted}
                  value={maxamount || ''}
                  onChangeText={setMaxAmount}
                  keyboardType="numeric"
                />
              </View>
              {(minamount || maxamount) ? (
                <TouchableOpacity style={s.clearBtn} onPress={() => { setMinAmount(''); setMaxAmount(''); }} activeOpacity={0.8}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Metal */}
          <View style={s.card}>
            <SectionHeader icon="💎" title="Metal Type" />
            <View style={s.metalToggleRow}>
              <TouchableOpacity
                style={[s.metalToggle, isGoldSelected && s.metalToggleGold]}
                onPress={() => {
                  setIsGoldSelected(p => !p);
                  if (isGoldSelected) { setGoldMinWeight(''); setGoldMaxWeight(''); }
                }}
                activeOpacity={0.8}
              >
                <Image source={GoldLogo} style={s.metalImg} />
                <Text style={[s.metalToggleLabel, isGoldSelected && { color: '#9A6D00', fontWeight: '700' }]}>
                  Gold
                </Text>
                {isGoldSelected && <View style={s.metalCheckDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.metalToggle, isSilverSelected && s.metalToggleSilver]}
                onPress={() => {
                  setIsSilverSelected(p => !p);
                  if (isSilverSelected) { setSilverMinWeight(''); setSilverMaxWeight(''); }
                }}
                activeOpacity={0.8}
              >
                <Image source={SilverLogo} style={s.metalImg} />
                <Text style={[s.metalToggleLabel, isSilverSelected && { color: '#4A5A65', fontWeight: '700' }]}>
                  Silver
                </Text>
                {isSilverSelected && <View style={[s.metalCheckDot, { backgroundColor: C.silver }]} />}
              </TouchableOpacity>
            </View>

            {isGoldSelected && (
              <View style={[s.rangeRow, { marginTop: 12 }]}>
                <View style={[s.fieldBox, { flex: 1 }]}>
                  <Text style={s.fieldIcon}>🟡</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="Min gold (g)"
                    placeholderTextColor={C.textMuted}
                    value={goldMinWeight}
                    onChangeText={setGoldMinWeight}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={s.rangeDash}>—</Text>
                <View style={[s.fieldBox, { flex: 1 }]}>
                  <Text style={s.fieldIcon}>🟡</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="Max gold (g)"
                    placeholderTextColor={C.textMuted}
                    value={goldMaxWeight}
                    onChangeText={setGoldMaxWeight}
                    keyboardType="numeric"
                  />
                </View>
                {(goldMinWeight || goldMaxWeight) ? (
                  <TouchableOpacity style={s.clearBtn} onPress={() => { setGoldMinWeight(''); setGoldMaxWeight(''); }} activeOpacity={0.8}>
                    <Text style={s.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {isSilverSelected && (
              <View style={[s.rangeRow, { marginTop: isGoldSelected ? 8 : 12 }]}>
                <View style={[s.fieldBox, { flex: 1 }]}>
                  <Text style={s.fieldIcon}>⚪</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="Min silver (g)"
                    placeholderTextColor={C.textMuted}
                    value={silverMinWeight}
                    onChangeText={setSilverMinWeight}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={s.rangeDash}>—</Text>
                <View style={[s.fieldBox, { flex: 1 }]}>
                  <Text style={s.fieldIcon}>⚪</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="Max silver (g)"
                    placeholderTextColor={C.textMuted}
                    value={silverMaxWeight}
                    onChangeText={setSilverMaxWeight}
                    keyboardType="numeric"
                  />
                </View>
                {(silverMinWeight || silverMaxWeight) ? (
                  <TouchableOpacity style={s.clearBtn} onPress={() => { setSilverMinWeight(''); setSilverMaxWeight(''); }} activeOpacity={0.8}>
                    <Text style={s.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.9}>
            <Text style={s.searchBtnText}>Search Bandhak  →</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {/* ── Results ── */}
      {busy ? (
        <View style={s.loaderWrap}>
          <LottieView
                                style={{ flex: 1 }}
                                source={require('../../assets/Coin purse.json')}
                                autoPlay loop
                              />
          <Text style={s.loaderText}>Searching...</Text>
        </View>
      ) : searched && data !== null && data.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={{ height: 200, aspectRatio: 1 }}>
            <LottieView
              style={{ flex: 1 }}
              source={require('../../assets/Coin purse.json')}
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
            <BandhakCard
              item={item}
              onPress={() => navigation.navigate('BandhakDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      ) : null}

      {/* ── Picker Modal (bottom sheet) ── */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={m.backdrop}>
            <TouchableWithoutFeedback>
              <View style={m.sheet}>
                <View style={m.handle} />
                <View style={m.header}>
                  <Text style={m.title}>{modalType === 'books' ? 'Select Book' : 'Select Status'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={m.closeBtn}>
                    <Text style={{ fontSize: 16, color: C.textSub }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={modalType === 'books' ? BOOKS : STATUSES}
                  keyExtractor={item => item}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={m.item} onPress={() => selectValue(item)} activeOpacity={0.7}>
                      <Text style={m.itemText}>{item}</Text>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EDF4F3',
  },
  topTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  topSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resetBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: C.accentPale, borderWidth: 1, borderColor: '#FFCDC6',
  },
  resetBtnText: { fontSize: 12, fontWeight: '700', color: C.accent },
  toggleBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleArrow:     { fontSize: 18, fontWeight: '700', color: C.primary },
  filterCountBadge:{
    position: 'absolute', top: -5, right: -5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  filterCountText: { fontSize: 9, fontWeight: '800', color: C.white },

  // Panel
  panelWrap:   { overflow: 'hidden' },
  panelScroll: { padding: 16, paddingTop: 12 },

  // Card
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: 'rgba(26,158,143,0.1)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },

  // Section header
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconBox:  { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center' },
  sectionIconText: { fontSize: 16 },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: C.textPrimary },

  // Fields
  fieldWrap:  { marginBottom: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.2 },
  fieldRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, minHeight: 48,
  },
  fieldIcon:  { fontSize: 14, marginRight: 8, color: C.primary },
  fieldInput: {
    flex: 1, color: C.textPrimary, fontSize: 14, fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },

  // Select box
  selectBox:    { flex: 1 },
  selectIcon:   { fontSize: 16, marginRight: 8 },
  selectText:   { flex: 1, fontSize: 14, fontWeight: '500', color: C.textPrimary },
  selectChevron:{ color: C.primary, fontSize: 20 },

  // Clear button
  clearBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.accentPale, borderWidth: 1, borderColor: '#FFCDC6',
    justifyContent: 'center', alignItems: 'center',
  },
  clearBtnText: { fontSize: 11, fontWeight: '800', color: C.accent },

  // Status chips (inline)
  statusChipRow: { flexDirection: 'row', gap: 10, flex: 1 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.inputBg,
  },
  statusChipActive:      { borderColor: C.primary, backgroundColor: C.primaryPale },
  statusChipDot:         { width: 8, height: 8, borderRadius: 4 },
  statusChipLabel:       { fontSize: 13, fontWeight: '600', color: C.textMuted },
  statusChipLabelActive: { color: C.primary, fontWeight: '700' },

  // Range row
  rangeRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeDash: { fontSize: 16, color: C.textMuted, fontWeight: '500' },

  // Metal toggles
  metalToggleRow: { flexDirection: 'row', gap: 12 },
  metalToggle: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.inputBg, position: 'relative',
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
  metalImg:         { width: 26, height: 26 },
  metalToggleLabel: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  metalCheckDot: {
    position: 'absolute', top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#D4AF37',
  },

  // Search button
  searchBtn: {
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  searchBtnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  // Loader
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { fontSize: 14, fontWeight: '600', color: C.textMuted },

  // Empty
  emptyWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  emptySub:   { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center' },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '60%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:  { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F2F8F7',
  },
  itemText: { fontSize: 15, fontWeight: '500', color: C.textPrimary },
});

export default AdvanceFilter;
