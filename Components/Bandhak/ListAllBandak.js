import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  TextInput, StatusBar, Platform,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import Header from '../Common/Header';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import debounce from 'lodash.debounce';
import LottieView from 'lottie-react-native';
import C from '../../colorConfig';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  if (!status) return C.statusDefault;
  const sl = status.toLowerCase();
  if (sl === 'rakhti') return C.statusRakhti;
  if (sl === 'chukti') return C.statusChukti;
  return C.statusDefault;
};

const fmtDate = (d) =>
  d?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtAmount = (val) =>
  `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;

// ─── Filter Config ────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { label: 'Name',      value: 'name' },
  { label: 'Address',   value: 'address' },
  { label: 'Book',      value: 'book_name' },
  { label: 'Date',      value: 'date' },
  { label: 'Status',    value: 'status' },
];

const STATUS_OPTIONS = [
  { label: 'All',    value: 'all' },
  { label: 'Rakhti', value: 'rakhti' },
  { label: 'Chukti', value: 'chukti' },
];

const BOOK_OPTIONS = ['All', 'B*A', 'B*K*J', 'Bina Purza', 'B*K'];

// ─── Bandhak Card ─────────────────────────────────────────────────────────────
const BandhakCard = ({ item, isActive, onPress }) => {
  const st        = getStatusStyle(item.status);
  const hasGold   = parseFloat(item.gold_weight   || 0) > 0;
  const hasSilver = parseFloat(item.silver_weight || 0) > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[card.wrap, isActive && card.wrapActive]}>

      {/* Book tag — top left */}
      <View style={card.bookTag}>
        <Text style={card.bookTagText}>{item.book_name || 'N/A'}</Text>
      </View>

      {/* Purja number — top right */}
      <View style={card.purjaTag}>
        <Text style={card.purjaTagText}>#{item.purja_no}</Text>
      </View>

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

          {/* Metal badges */}
          {(hasGold || hasSilver) && (
            <View style={card.metalRow}>
              {hasGold && (
                <View style={[card.metalBadge,
                  { backgroundColor: C.goldLight, borderColor: C.goldBorder }]}>
                  <Text style={[card.metalText, { color: '#9A6D00' }]}>
                    🟡 {item.gold_weight}g
                  </Text>
                </View>
              )}
              {hasSilver && (
                <View style={[card.metalBadge,
                  { backgroundColor: C.silverLight, borderColor: C.silverBorder }]}>
                  <Text style={[card.metalText, { color: '#4A5A65' }]}>
                    ⚪ {item.silver_weight}g
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Amount + Date */}
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

          {/* Status badge */}
          <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[card.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[card.statusText, { color: st.text }]}>
              {item.status || 'Rakhti'}
            </Text>
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
    marginVertical: 5,
    padding: 16,
    paddingTop: 22,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  wrapActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryPale,
  },
  bookTag: {
    position: 'absolute', top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16, borderBottomRightRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  bookTagText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.4 },
  purjaTag: { position: 'absolute', top: 6, right: 12 },
  purjaTagText: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  avatarLetter: { fontSize: 17, fontWeight: '700', color: C.primary },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  address: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  metalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  metalText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  amtRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 10,
    padding: 8, marginBottom: 8, gap: 4,
  },
  amtCell: { flex: 1, alignItems: 'center' },
  amtLabel: { fontSize: 10, color: C.textMuted, fontWeight: '500', marginBottom: 2, letterSpacing: 0.3 },
  amtValue: { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  amtDivider: { width: 1, height: 26, backgroundColor: C.border },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ListAllBandhak = () => {
  const navigation = useNavigation();
  const [data,           setData]           = useState([]);
  const [filteredData,   setFilteredData]   = useState([]);
  const [filterOption,   setFilterOption]   = useState('name');
  const [filterText,     setFilterText]     = useState('');
  const [filterDate,     setFilterDate]     = useState(null);
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [bookFilter,     setBookFilter]     = useState('All');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busy,           setBusy]           = useState(false);
  const [activeId,       setActiveId]       = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setBusy(true);
    try {
      const res    = await fetch(`${config.BASE_URL}fetchBandhak.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
        setFilteredData(result.data);
      } else {
        setData([]); setFilteredData([]);
      }
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // ── Filter logic ──────────────────────────────────────────────────────────
  const applyFilter = (
    text    = filterText,
    date    = filterDate,
    status  = statusFilter,
    book    = bookFilter,
    option  = filterOption,
  ) => {
    let filtered = data;

    if (text && option !== 'date' && option !== 'status') {
      filtered = filtered.filter(item =>
        (item[option] || '').toString().toLowerCase().includes(text.toLowerCase())
      );
    }
    if (date && option === 'date') {
      const target = date.toISOString().split('T')[0];
      filtered = filtered.filter(item => {
        const d = new Date(item.englishDate).toISOString().split('T')[0];
        return d === target;
      });
    }
    if (status !== 'all') {
      filtered = filtered.filter(item =>
        (item.status || '').toLowerCase() === status
      );
    }
    if (book !== 'All') {
      filtered = filtered.filter(item => item.book_name === book);
    }

    setFilteredData(filtered);
  };

  const debouncedFilter = useCallback(
    debounce((text, date, status, book, option) =>
      applyFilter(text, date, status, book, option), 300),
    [applyFilter]
  );

  const handleTextChange = (text) => {
    setFilterText(text);
    debouncedFilter(text, filterDate, statusFilter, bookFilter, filterOption);
  };

  const handleFilterOptionChange = (val) => {
    setFilterOption(val);
    setFilterText('');
    setFilterDate(null);
    setStatusFilter('all');
    setBookFilter('All');
    setFilteredData(data);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Page Header ── */}
      <View style={s.pageHead}>
        <View>
          <Text style={s.pageTitle}>All Bandhak</Text>
          <Text style={s.pageSub}>
            {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      {/* ── Filter Panel ── */}
      <View style={s.filterPanel}>

        {/* Filter type chips */}
        <View style={s.chipRow}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleFilterOptionChange(opt.value)}
              style={[s.chip, filterOption === opt.value && s.chipActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.chipLabel, filterOption === opt.value && s.chipLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Dynamic Input Area ── */}

        {/* Date picker */}
        {filterOption === 'date' && (
          <TouchableOpacity
            style={s.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <Text style={[s.datePickerBtnText, filterDate && s.datePickerBtnTextFilled]}>
              {filterDate ? fmtDate(filterDate) : 'Select bandhak date'}
            </Text>
            {filterDate ? (
              <TouchableOpacity
                onPress={() => { setFilterDate(null); applyFilter(filterText, null, statusFilter, bookFilter, filterOption); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.dateClear}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.dateChevron}>›</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Status chips */}
        {filterOption === 'status' && (
          <View style={s.statusRow}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setStatusFilter(opt.value);
                  applyFilter(filterText, filterDate, opt.value, bookFilter, filterOption);
                }}
                style={[s.statusChip, statusFilter === opt.value && s.statusChipActive]}
                activeOpacity={0.75}
              >
                <Text style={[s.statusChipLabel, statusFilter === opt.value && s.statusChipLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Book chips */}
        {filterOption === 'book_name' && (
          <View style={s.statusRow}>
            {BOOK_OPTIONS.map(b => (
              <TouchableOpacity
                key={b}
                onPress={() => {
                  setBookFilter(b);
                  applyFilter(filterText, filterDate, statusFilter, b, filterOption);
                }}
                style={[s.statusChip, bookFilter === b && s.statusChipActive]}
                activeOpacity={0.75}
              >
                <Text style={[s.statusChipLabel, bookFilter === b && s.statusChipLabelActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Text search */}
        {(filterOption === 'name' || filterOption === 'address') && (
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              style={s.searchInput}
              placeholder={`Search by ${filterOption}`}
              value={filterText}
              onChangeText={handleTextChange}
              placeholderTextColor={C.textMuted}
            />
            {filterText.length > 0 && (
              <TouchableOpacity onPress={() => { setFilterText(''); setFilteredData(data); }}>
                <Text style={s.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <DatePicker
        modal
        open={showDatePicker}
        date={filterDate || new Date()}
        mode="date"
        theme="light"
        onConfirm={(date) => {
          setShowDatePicker(false);
          setFilterDate(date);
          applyFilter(filterText, date, statusFilter, bookFilter, filterOption);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* ── List ── */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <BandhakCard
            item={item}
            isActive={activeId === item.id}
            onPress={() => {
              setActiveId(item.id);
              navigation.navigate('BandhakDetail', { id: item.id });
            }}
          />
        )}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !busy ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No records found</Text>
              <Text style={s.emptySub}>Try adjusting your filter or search term</Text>
            </View>
          ) : null
        }
      />

      {/* ── Loader ── */}
      {busy && (
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
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Page header
  pageHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  pageSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },

  // Filter panel
  filterPanel: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },

  // Filter type chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  chipActive:      { backgroundColor: C.primaryPale, borderColor: C.primary },
  chipLabel:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  chipLabelActive: { color: C.primary },

  // Search input
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, minHeight: 46, gap: 8,
  },
  searchIcon:  { fontSize: 18, color: C.textMuted },
  searchInput: {
    flex: 1, fontSize: 14, color: C.textPrimary, fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchClear: { fontSize: 14, color: C.textMuted, fontWeight: '600', paddingHorizontal: 4 },

  // Date picker
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  datePickerBtnText:       { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  datePickerBtnTextFilled: { color: C.textPrimary, fontWeight: '600' },
  dateClear:   { fontSize: 13, color: C.accent, fontWeight: '700' },
  dateChevron: { fontSize: 20, color: C.textMuted },

  // Status / Book chips
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  statusChipActive:      { backgroundColor: C.primaryPale, borderColor: C.primary },
  statusChipLabel:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  statusChipLabelActive: { color: C.primary },

  // Empty
  empty:      { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  emptySub:   { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },

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

export default ListAllBandhak;
