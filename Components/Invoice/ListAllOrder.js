import {
  View, Text, Image, TouchableOpacity, FlatList, StyleSheet,
  TextInput, StatusBar, Platform, Dimensions
} from 'react-native';
import React, { useState, useCallback } from 'react';
import Header from '../Common/Header';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import debounce from 'lodash.debounce';
import LottieView from 'lottie-react-native';
import C from '../../colorConfig';

const { width: W } = Dimensions.get('window');


const statusTheme = (s) => {
  if (!s) return { bg: C.bg, text: C.textMuted, dot: C.textMuted };
  const sl = s.toLowerCase();
  if (sl === 'pending')   return { bg: C.pendingBg,   text: C.pendingText,   dot: C.pendingDot };
  if (sl === 'ongoing')   return { bg: C.ongoingBg,   text: C.ongoingText,   dot: C.ongoingDot };
  if (sl === 'completed') return { bg: C.completedBg, text: C.completedText, dot: C.completedDot };
  if (sl === 'delivered') return { bg: C.deliveredBg, text: C.deliveredText, dot: C.deliveredDot };
  return { bg: C.bg, text: C.textMuted, dot: C.textMuted };
};

const metalTheme = (m) => {
  if (m === 'Gold')   return { bg: '#FFF8E1', text: '#9A6D00', border: '#F5D76E', label: 'G' };
  if (m === 'Silver') return { bg: '#F0F0F0', text: '#5A5A6A', border: '#C0C0C0', label: 'S' };
  if (m === 'Mix')    return { bg: '#F0EEFF', text: '#5B3FA0', border: '#B39DDB', label: 'M' };
  return { bg: C.primaryPale, text: C.primary, border: C.border, label: 'U' };
};

// ─── Filter Options ───────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { label: 'Name',         value: 'name' },
  { label: 'Address',      value: 'address' },
  { label: 'Order No.',    value: 'invoice_number' },
  { label: 'Delivery Date',value: 'delivery_date' },
  { label: 'Status',       value: 'status' },
];

const STATUS_OPTIONS = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Ongoing',   value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Delivered', value: 'delivered' },
];

// ─── Invoice Card ─────────────────────────────────────────────────────────────
const OrderCard = ({ item, isActive, onPress }) => {
  const st = statusTheme(item.status);
  const mt = metalTheme(item.metal);
  const bal = (parseFloat(item.totalAmount || 0) - parseFloat(item.amountGiven || 0));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[c.wrap, isActive && c.wrapActive]}>

      {/* Invoice tag */}
      <View style={c.invTag}>
        <Text style={c.invTagText}>#{item.invoice_number}</Text>
      </View>

      {/* Staff dot */}
      {item.staffAccess === 'yes' ? <View style={c.staffDot} /> : null}

      <View style={c.row}>
        {/* Avatar */}
        <View style={c.avatar}>
          <Text style={c.avatarLetter}>{(item.name?.[0] || '?').toUpperCase()}</Text>
        </View>

        {/* Info */}
        <View style={c.info}>
          {/* Name + metal */}
          <View style={c.nameRow}>
            <Text style={c.name} numberOfLines={1}>{item.name}</Text>
            <View style={[c.metalBadge, { backgroundColor: mt.bg, borderColor: mt.border }]}>
              <Text style={[c.metalText, { color: mt.text }]}>{item.metal || 'Unknown'}</Text>
            </View>
          </View>

          {/* Amounts */}
          <View style={c.amtRow}>
            <View style={c.amtCell}>
              <Text style={c.amtLabel}>Billed</Text>
              <Text style={c.amtValue}>{`₹${parseFloat(item.totalAmount || 0).toLocaleString('en-IN')}`}</Text>
            </View>
            <View style={c.amtDivider} />
            <View style={c.amtCell}>
              <Text style={c.amtLabel}>Paid</Text>
              <Text style={[c.amtValue, { color: C.primary }]}>{`₹${parseFloat(item.amountGiven || 0).toLocaleString('en-IN')}`}</Text>
            </View>
            <View style={c.amtDivider} />
            <View style={c.amtCell}>
              <Text style={c.amtLabel}>Due</Text>
              <Text style={[c.amtValue, { color: bal > 0 ? C.accent : C.primary }]}>{`₹${Math.abs(bal).toLocaleString('en-IN')}`}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={[c.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[c.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[c.statusText, { color: st.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const c = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 16,
    paddingTop: 20,
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
  invTag: {
    position: 'absolute', top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16, borderBottomRightRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  invTagText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.4 },
  staffDot: {
    position: 'absolute', top: 10, right: 12,
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  avatarLetter: { fontSize: 17, fontWeight: '700', color: C.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '700', color: C.textPrimary, flex: 1, marginRight: 8 },
  metalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  metalText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
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
const ListAllOrder = () => {
  const navigation = useNavigation();
  const [data,          setData]          = useState([]);
  const [filteredData,  setFilteredData]  = useState([]);
  const [filterOption,  setFilterOption]  = useState('name');
  const [filterText,    setFilterText]    = useState('');
  const [filterDate,    setFilterDate]    = useState(null);
  const [showDatePicker,setShowDatePicker]= useState(false);
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [busy,          setBusy]          = useState(false);
  const [listRefState,  setListRefState]  = useState('');

  // ── Fetch all ────────────────────────────────────────────────────────────
  const fetchAllOrder = useCallback(async () => {
    setBusy(true);
    try {
      const res    = await fetch(`${config.BASE_URL}listAllOrder.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
        setFilteredData(result.data);
      }
    } catch (e) { console.warn(e); }
    finally { setBusy(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchAllOrder(); }, [fetchAllOrder]));

  // ── Refresh single record on return ──────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!listRefState) return;
      const refresh = async () => {
        try {
          const res    = await fetch(`${config.BASE_URL}getSingleOrder.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: listRefState }),
          });
          const result = await res.json();
          if (result.status === 'success' && result.data) {
            const updated = result.data;
            setData(prev => prev.map(i => i.id === updated.id ? updated : i));
            setFilteredData(prev => prev.map(i => i.id === updated.id ? updated : i));
          }
        } catch (e) { console.error(e); }
      };
      refresh();
    }, [listRefState])
  );

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filterData = (text = filterText, date = filterDate, status = statusFilter) => {
    let filtered = data;
    if (text) {
      filtered = filtered.filter(item =>
        (item[filterOption] || '').toString().toLowerCase().includes(text.toLowerCase())
      );
    }
    if (date) {
      filtered = filtered.filter(item => {
        const itemDate   = new Date(item.deliveryDate).toISOString().split('T')[0];
        const filterFmt  = date.toISOString().split('T')[0];
        return itemDate === filterFmt;
      });
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(item => item.status?.toLowerCase() === status.toLowerCase());
    }
    setFilteredData(filtered);
  };

  const debouncedFilter = useCallback(
    debounce((text, date, status) => filterData(text, date, status), 300),
    [filterData]
  );

  const handleTextChange = (text) => {
    setFilterText(text);
    debouncedFilter(text, filterDate, statusFilter);
  };

  const handleFilterOptionChange = (val) => {
    setFilterOption(val);
    setFilterText('');
    setFilterDate(null);
    setStatusFilter('all');
    setFilteredData(data);
  };

  const fmtDate = (d) => d?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Page Title ── */}
      <View style={s.pageHead}>
        <View>
          <Text style={s.pageTitle}>All Orders</Text>
          <Text style={s.pageSub}>{filteredData.length} record{filteredData.length !== 1 ? 's' : ''} found</Text>
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

        {/* Filter input area */}
        {filterOption === 'delivery_date' ? (
          <TouchableOpacity
            style={s.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <Text style={[s.datePickerBtnText, filterDate && s.datePickerBtnTextFilled]}>
              {filterDate ? fmtDate(filterDate) : 'Select delivery date'}
            </Text>
            {filterDate ? (
              <TouchableOpacity
                onPress={() => { setFilterDate(null); setFilteredData(data); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.dateClear}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.dateChevron}>›</Text>
            )}
          </TouchableOpacity>

        ) : filterOption === 'status' ? (
          <View style={s.statusRow}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => { setStatusFilter(opt.value); filterData(filterText, filterDate, opt.value); }}
                style={[s.statusChip, statusFilter === opt.value && s.statusChipActive]}
                activeOpacity={0.75}
              >
                <Text style={[s.statusChipLabel, statusFilter === opt.value && s.statusChipLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        ) : (
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              style={s.searchInput}
              placeholder={filterOption === 'invoice_number' ? 'Enter order number' : `Search by ${filterOption}`}
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
          filterData(filterText, date, statusFilter);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* ── List ── */}
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            isActive={listRefState === item.id}
            onPress={() => {
              setListRefState(item.id);
              navigation.navigate('InvoiceDetail', { invoiceid: item.id });
            }}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !busy ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No orders found</Text>
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
                    <Text style={s.loaderText}>Loading orders...</Text>
                  </View>
                </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Page head
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
  chipActive: { backgroundColor: C.primaryPale, borderColor: C.primary },
  chipLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  chipLabelActive: { color: C.primary },

  // Search box
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, minHeight: 46, gap: 8,
  },
  searchIcon: { fontSize: 18, color: C.textMuted },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary, fontWeight: '500', paddingVertical: Platform.OS === 'ios' ? 10 : 6 },
  searchClear: { fontSize: 14, color: C.textMuted, fontWeight: '600', paddingHorizontal: 4 },

  // Date picker button
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  datePickerBtnText: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  datePickerBtnTextFilled: { color: C.textPrimary, fontWeight: '600' },
  dateClear:   { fontSize: 13, color: C.accent, fontWeight: '700' },
  dateChevron: { fontSize: 20, color: C.textMuted },

  // Status chips
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  statusChipActive: { backgroundColor: C.primaryPale, borderColor: C.primary },
  statusChipLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  statusChipLabelActive: { color: C.primary },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
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

export default ListAllOrder;
