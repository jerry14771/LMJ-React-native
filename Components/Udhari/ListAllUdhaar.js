import {
  View, Text, FlatList, TouchableOpacity, Image, Modal,
  StyleSheet, StatusBar, Platform,
  Linking, TextInput, Dimensions,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import Header from '../Common/Header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import config from '../../config';
import LottieView from 'lottie-react-native';
import ImageView from 'react-native-image-viewing';
import Share from 'react-native-share';
import C from '../../colorConfig'

const { width: W } = Dimensions.get('window');


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (ds) => {
  if (!ds) return '—';
  const d = new Date(ds);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtAmount = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

const parseImages = (raw) => {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return arr.map(img => ({ uri: `${config.BASE_URL}/${img}` }));
  } catch { return []; }
};

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
  backdrop:     { flex: 1, backgroundColor: 'rgba(26,46,53,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  card:         { width: '100%', backgroundColor: C.white, borderRadius: 22, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 10 },
  title:        { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  msg:          { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  row:          { flexDirection: 'row', width: '100%', gap: 12 },
  cancelBtn:    { flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
  cancelLabel:  { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  confirmBtn:   { flex: 1, height: 46, borderRadius: 12, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmLabel: { fontSize: 14, fontWeight: '700', color: C.white },
});

// ─── Udhari Card ──────────────────────────────────────────────────────────────
const UdhariCard = ({ item, onEdit, onDelete, onShare, onImagePress }) => {
  const total     = parseFloat(item.totalAmount  || 0);
  const paid      = parseFloat(item.amountGiven  || 0);
  const remaining = total - paid;
  const isCleared = remaining <= 0;
  const images    = parseImages(item.receiptImages);
  const hasImages = images.length > 0;

  const st = isCleared
    ? { bg: '#E6F9F0', text: '#1A7A4A', dot: '#25A968', label: 'Cleared' }
    : { bg: '#FFF4E5', text: '#A05C00', dot: '#F5A623', label: 'Pending' };

  return (
    <View style={card.wrap}>

      {/* Date tag — top left */}
      <View style={card.dateTag}>
        <Text style={card.dateTagText}>{fmtDate(item.udharDate)}</Text>
      </View>

      {/* Receipt thumbnail — top right */}
      {hasImages && (
        <TouchableOpacity
          style={card.thumbWrap}
          onPress={() => onImagePress(images)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: images[0].uri }} style={card.thumb} resizeMode="cover" />
          {images.length > 1 && (
            <View style={card.thumbCount}>
              <Text style={card.thumbCountText}>+{images.length - 1}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Avatar + Info */}
      <View style={card.row}>
        <View style={card.avatar}>
          <Text style={card.avatarLetter}>{(item.name?.[0] || '?').toUpperCase()}</Text>
        </View>

        <View style={card.info}>
          <Text style={card.name} numberOfLines={1}>{item.name}</Text>

          {item.mobile ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${item.mobile}`)}
              style={card.mobileRow} activeOpacity={0.7}
            >
              <Text style={card.mobileIcon}>📱</Text>
              <Text style={card.mobileText}>{item.mobile}</Text>
            </TouchableOpacity>
          ) : null}

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
              <Text style={[card.amtValue, { color: C.primary }]}>{fmtAmount(item.amountGiven)}</Text>
            </View>
            <View style={card.amtDivider} />
            <View style={card.amtBlock}>
              <Text style={card.amtLabel}>Remaining</Text>
              <Text style={[card.amtValue, { color: isCleared ? C.primary : C.accent }]}>
                {fmtAmount(Math.abs(remaining))}
              </Text>
            </View>
          </View>

          {/* Status + Chukti date row */}
          <View style={card.statusRow}>
            <View style={[card.statusBadge, { backgroundColor: st.bg }]}>
              <View style={[card.statusDot, { backgroundColor: st.dot }]} />
              <Text style={[card.statusText, { color: st.text }]}>{st.label}</Text>
            </View>
            {item.chuktiDate ? (
              <Text style={card.chuktiText}>Chukti: {fmtDate(item.chuktiDate)}</Text>
            ) : null}
          </View>

          {/* Description */}
          {item.description ? (
            <View style={card.descBox}>
              <Text style={card.descText} numberOfLines={50}>📝 {item.description}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Action Bar ── */}
      <View style={card.actionBar}>
        <TouchableOpacity style={card.actionBtn} onPress={onEdit} activeOpacity={0.8}>
          <Text style={card.actionIcon}>✏️</Text>
          <Text style={[card.actionLabel, { color: C.primary }]}>Edit</Text>
        </TouchableOpacity>
        <View style={card.actionDivider} />
        <TouchableOpacity style={card.actionBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={card.actionIcon}>🗑</Text>
          <Text style={[card.actionLabel, { color: C.accent }]}>Delete</Text>
        </TouchableOpacity>
        <View style={card.actionDivider} />
        <TouchableOpacity style={card.actionBtn} onPress={onShare} activeOpacity={0.8}>
          <Text style={card.actionIcon}>📤</Text>
          <Text style={[card.actionLabel, { color: C.textSub }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    position: 'absolute', top: 0, left: 0,
    backgroundColor: C.primaryLight,
    borderTopLeftRadius: 16, borderBottomRightRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dateTagText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.3 },

  // Receipt thumbnail
  thumbWrap: {
    position: 'absolute', top: 8, right: 12,
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1.5, borderColor: C.border,
  },
  thumb:          { width: 48, height: 48 },
  thumbCount: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: 'rgba(26,46,53,0.7)',
    paddingHorizontal: 4, paddingVertical: 2, borderTopLeftRadius: 6,
  },
  thumbCountText: { fontSize: 9, fontWeight: '700', color: C.white },

  row:          { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 4 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: C.primary },
  info:         { flex: 1 },
  name:         { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 4, marginRight: 56 },
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

  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  chuktiText:  { fontSize: 11, color: C.textMuted, fontWeight: '500' },

  descBox:  { backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderLeftWidth: 3, borderLeftColor: C.border },
  descText: { fontSize: 12, color: C.textSub, lineHeight: 18 },

  // Action bar
  actionBar: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  actionBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  actionDivider: { width: 1, height: 20, backgroundColor: C.border },
  actionIcon:    { fontSize: 14 },
  actionLabel:   { fontSize: 12, fontWeight: '700' },
});

// ─── Gallery Modal ────────────────────────────────────────────────────────────
const GalleryModal = ({ visible, images, onClose, onImagePress }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={gal.backdrop}>
      <View style={gal.sheet}>
        <View style={gal.handle} />
        <View style={gal.header}>
          <Text style={gal.title}>Receipt Images</Text>
          <TouchableOpacity onPress={onClose} style={gal.closeBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 16, color: C.textSub }}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={images}
          numColumns={3}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onImagePress(index)}
              style={gal.imgWrap}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.uri }} style={gal.img} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);
const GAL_IMG = (W - 32 - 24) / 3;
const gal = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 16, paddingTop: 10, maxHeight: '65%',
  },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:    { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  imgWrap:  { width: GAL_IMG, height: GAL_IMG, margin: 4, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  img:      { width: '100%', height: '100%' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ListAllUdhaar = () => {
  const navigation  = useNavigation();
  const editLogo    = require('../../assets/pen.png');

  const [data,           setData]           = useState(null);
  const [filteredData,   setFilteredData]   = useState(null);
  const [searchQuery,    setSearchQuery]     = useState('');
  const [busy,           setBusy]           = useState(false);

  // Delete
  const [deleteModal,    setDeleteModal]    = useState(false);
  const [deleteId,       setDeleteId]       = useState(null);

  // Gallery / ImageView
  const [galleryModal,   setGalleryModal]   = useState(false);
  const [galleryImages,  setGalleryImages]  = useState([]);
  const [viewerVisible,  setViewerVisible]  = useState(false);
  const [viewerIndex,    setViewerIndex]    = useState(0);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setBusy(true);
    try {
      const res    = await fetch(`${config.BASE_URL}fetchAllUdhari.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data);
        setFilteredData(result.data);
      }
    } catch (e) { console.warn(e); }
    finally { setBusy(false); }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) { setFilteredData(data); return; }
    const q = text.toLowerCase();
    setFilteredData(
      (data || []).filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q) ||
        item.mobile?.includes(q)
      )
    );
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (id) => { setDeleteId(id); setDeleteModal(true); };

  const performDelete = async () => {
    try {
      const res    = await fetch(`${config.BASE_URL}deleteUdhaar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        const updated = (data || []).filter(i => i.id !== deleteId);
        setData(updated);
        setFilteredData((filteredData || []).filter(i => i.id !== deleteId));
      }
    } catch (e) { console.warn(e); }
    finally { setDeleteModal(false); setDeleteId(null); }
  };

  // ── Gallery ───────────────────────────────────────────────────────────────
  const openGallery = (images) => {
    setGalleryImages(images);
    setGalleryModal(true);
  };

  const openViewer = (index) => {
    setViewerIndex(index);
    setGalleryModal(false);
    setViewerVisible(true);
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async (item) => {
    const images   = parseImages(item.receiptImages);
    const imgPaths = images.map(i => i.uri).join('\n');
    try {
      await Share.open({
        title: 'Share Udhaar Details',
        message: `🧾 Udhaar Details\n👤 Name: ${item.name}\n📞 Mobile: ${item.mobile}\n🏠 Address: ${item.address}\n🧾 Billed: ₹${item.totalAmount}\n✅ Paid: ₹${item.amountGiven}\n💰 Remaining: ₹${parseFloat(item.totalAmount || 0) - parseFloat(item.amountGiven || 0)}\n📅 Udhar: ${fmtDate(item.udharDate)}\n📅 Chukti: ${fmtDate(item.chuktiDate)}\n📝 ${item.description || 'N/A'}\n${imgPaths}`,
        social: Share.Social.WHATSAPP,
      });
    } catch (e) { if (e?.message !== 'User did not share') console.warn(e); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      {/* ── Page Header + Search ── */}
      <View style={s.pageHead}>
        <View>
          <Text style={s.pageTitle}>All Udhaar</Text>
          <Text style={s.pageSub}>
            {filteredData !== null
              ? `${filteredData.length} record${filteredData.length !== 1 ? 's' : ''} found`
              : 'Loading...'}
          </Text>
        </View>
      </View>

      {/* Search box */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          placeholder="Search by name, mobile or address..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={C.textMuted}
          style={s.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setFilteredData(data); }}>
            <Text style={s.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content ── */}
      {busy ? (
        <View style={s.loaderWrap}>
          <LottieView
                                                                                             style={{ flex: 1 }}
                                                                                             source={require('../../assets/Animation - 1739937488069.json')}
                                                                                             autoPlay loop
                                                                                           />
          <Text style={s.loaderText}>Loading records...</Text>
        </View>
      ) : filteredData !== null && filteredData.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={{ height: 220, aspectRatio: 1 }}>
            <LottieView
              style={{ flex: 1 }}
              source={require('../../assets/Animation - 1739937488069.json')}
              autoPlay loop
            />
          </View>
          <Text style={s.emptyTitle}>No records found</Text>
          <Text style={s.emptySub}>
            {searchQuery ? 'Try a different search term' : 'No udhaar records yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <UdhariCard
              item={item}
              onEdit={()   => navigation.navigate('AddUdhari', { udhariData: item })}
              onDelete={()  => confirmDelete(item.id)}
              onShare={()   => handleShare(item)}
              onImagePress={(imgs) => openGallery(imgs)}
            />
          )}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Delete Modal ── */}
      <ConfirmModal
        visible={deleteModal}
        title="Delete Udhaar"
        message="This will permanently delete this record. Are you sure?"
        onCancel={() => setDeleteModal(false)}
        onConfirm={performDelete}
        confirmLabel="Delete"
        danger
      />

      {/* ── Gallery Modal ── */}
      <GalleryModal
        visible={galleryModal}
        images={galleryImages}
        onClose={() => setGalleryModal(false)}
        onImagePress={openViewer}
      />

      {/* ── Full-screen Image Viewer ── */}
      <ImageView
        images={galleryImages}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Page header
  pageHead: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8,
  },
  pageTitle: { fontSize: 22, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  pageSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, marginHorizontal: 16,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, minHeight: 48, marginBottom: 8,
    shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 8,
  },
  searchIcon:  { fontSize: 18, color: C.textMuted },
  searchInput: {
    flex: 1, fontSize: 14, color: C.textPrimary, fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchClear: { fontSize: 14, color: C.textMuted, fontWeight: '600', paddingHorizontal: 4 },

  // Loader
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { fontSize: 14, fontWeight: '600', color: C.textMuted },

  // Empty
  emptyWrap:  { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  emptySub:   { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});

export default ListAllUdhaar;
