import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import config from '../../config';
import Header from '../Common/Header';
import DatePicker from 'react-native-date-picker';


// ─── Design Tokens ────────────────────────────────────────────────────────────
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
    gold: '#D4AF37',
    goldLight: '#FFF8E1',
    goldBorder: '#F5D76E',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const PAYMENT_MODE_EMOJI = { Cash: '💵', UPI: '📱', Card: '💳' };

// ─── Payment Card ─────────────────────────────────────────────────────────────
const PaymentCard = ({ item, index, onEdit, onDelete }) => {
    const emoji = PAYMENT_MODE_EMOJI[item.payment_mode] || '💰';

    return (
        <View style={styles.card}>
            {/* Top-left index ribbon */}
            <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>#{index + 1}</Text>
            </View>

            {/* Header row */}
            <View style={styles.cardTop}>
                {/* Avatar */}
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.paymentMode}>{item.payment_mode}</Text>
                    <Text style={styles.paymentDate}>
                        📅 {formatDate(item.paymentDate)}
                    </Text>
                </View>

                {/* Amount badge */}
                <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                </View>
            </View>

            {/* Amount row strip */}
            <View style={styles.amtRow}>
                <View style={styles.amtCell}>
                    <Text style={styles.amtLabel}>Amount</Text>
                    <Text style={styles.amtValue}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.amtDivider} />
                <View style={styles.amtCell}>
                    <Text style={styles.amtLabel}>Mode</Text>
                    <Text style={styles.amtValue}>{item.payment_mode}</Text>
                </View>
                <View style={styles.amtDivider} />
                <View style={styles.amtCell}>
                    <Text style={styles.amtLabel}>Payment on</Text>
                    <Text style={styles.amtValue}>{formatDate(item.paymentDate)}</Text>
                </View>
            </View>

            {/* Note box */}
            {!!item.note && (
                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>📝 {item.note}</Text>
                </View>
            )}

            {/* Action bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
                    <Text style={styles.actionBtnText}>✏️  Edit</Text>
                </TouchableOpacity>
                <View style={styles.actionBarDivider} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)} activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: C.accent }]}>🗑️  Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PaymentHistory = () => {
    const route = useRoute();
    const invoiceID = route.params?.invoiceid;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit modal
    const [editModal, setEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editNote, setEditNote] = useState('');
    const [editMode, setEditMode] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    // Delete modal
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [editDate, setEditDate] = useState(new Date());
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${config.BASE_URL}paymentHistory.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: invoiceID }),
            });
            const result = await res.json();
            if (result.status === 'success') setData(result.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchPayments(); }, []));

    // ── Edit ───────────────────────────────────────────────────────────────────
    const openEdit = (item) => {
        setEditItem(item);
        setEditAmount(String(item.amount));
        setEditNote(item.note || '');
          setEditDate(item.paymentDate ? new Date(item.paymentDate) : new Date()); // ← add this
        setEditMode(item.payment_mode);
        setEditModal(true);
    };

    const saveEdit = async () => {
        try {
            setEditSaving(true);
            const res = await fetch(`${config.BASE_URL}updatePayment.php`, {   // ← change API name here
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_payments_id: editItem.invoice_payments_id,
                    amount: editAmount,
                    note: editNote,
                    paymentDate:  editDate.toISOString(),
                    payment_mode: editMode,
                }),
            });
            const result = await res.json();
            if (result.status === 'success') {
                Toast.show({ type: 'success', text1: 'Payment Updated' });
                setEditModal(false);
                fetchPayments();
            } else {
                Toast.show({ type: 'error', text1: 'Update failed', text2: result.message });
            }
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Network error' });
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const openDelete = (item) => {
        setDeleteItem(item);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleteLoading(true);
            const res = await fetch(`${config.BASE_URL}deletePayment.php`, {   // ← change API name here
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_payments_id: deleteItem.invoice_payments_id }),
            });
            const result = await res.json();
            if (result.status === 'success') {
                Toast.show({ type: 'success', text1: 'Payment Deleted' });
                setDeleteModal(false);
                fetchPayments();
            } else {
                Toast.show({ type: 'error', text1: 'Delete failed', text2: result.message });
            }
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Network error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Total ──────────────────────────────────────────────────────────────────
    const total = data ? data.reduce((s, p) => s + parseFloat(p.amount || 0), 0) : 0;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={C.white} />
            <Header />

            {/* ── Summary banner ─────────────────────────────────────────────────── */}
            {data && (
                <View style={styles.summaryBanner}>
                    <View style={styles.summaryLeft}>
                        <View style={styles.summaryIconBox}>
                            <Text style={{ fontSize: 16 }}>💳</Text>
                        </View>
                        <View>
                            <Text style={styles.summaryLabel}>Payment History</Text>
                            <Text style={styles.summaryCount}>{data.length} record{data.length !== 1 ? 's' : ''}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryRight}>
                        <Text style={styles.summaryTotalLabel}>Total Paid</Text>
                        <Text style={styles.summaryTotal}>₹{total.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            )}

            {/* ── List ───────────────────────────────────────────────────────────── */}
            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={styles.loadingText}>Loading payments…</Text>
                </View>
            ) : !data || data.length === 0 ? (
                <View style={styles.centerBox}>
                    <Text style={{ fontSize: 48 }}>🧾</Text>
                    <Text style={styles.emptyTitle}>No payments found</Text>
                    <Text style={styles.emptySubtitle}>No payment records for this invoice yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => String(item.invoice_payments_id)}
                    renderItem={({ item, index }) => (
                        <PaymentCard
                            item={item}
                            index={index}
                            onEdit={openEdit}
                            onDelete={openDelete}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
            <Modal transparent visible={editModal} animationType="slide" onRequestClose={() => setEditModal(false)}>
                <View style={styles.sheetBackdrop}>
                    <View style={styles.sheet}>
                        {/* Handle */}
                        <View style={styles.sheetHandle} />

                        {/* Header */}
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Edit Payment</Text>
                            <TouchableOpacity style={styles.sheetClose} onPress={() => setEditModal(false)}>
                                <Text style={{ fontSize: 16, color: C.textSub }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Amount */}
                        <Text style={styles.inputLabel}>Amount (₹)</Text>
                        <View style={styles.inputBox}>
                            <Text style={styles.inputEmoji}>💰</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editAmount}
                                onChangeText={setEditAmount}
                                keyboardType="numeric"
                                placeholderTextColor={C.textMuted}
                                placeholder="Enter amount"
                            />
                        </View>

                        {/* Payment Date */}
<Text style={[styles.inputLabel, { marginTop: 14 }]}>Payment Date</Text>
<TouchableOpacity
  style={styles.inputBox}
  onPress={() => setShowEditDatePicker(true)}
  activeOpacity={0.8}
>
  <Text style={styles.inputEmoji}>📅</Text>
  <Text style={{ fontSize: 15, color: C.textPrimary, fontWeight: '500' }}>
    {editDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
  </Text>
</TouchableOpacity>

<DatePicker
  modal
  open={showEditDatePicker}
  date={editDate}
  mode="date"
  maximumDate={new Date()}
  onConfirm={(date) => { setShowEditDatePicker(false); setEditDate(date); }}
  onCancel={() => setShowEditDatePicker(false)}
/>

                        {/* Payment mode */}
                        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payment Mode</Text>
                        <View style={styles.modeRow}>
                            {['Cash', 'UPI', 'Card'].map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.modeChip, editMode === m && styles.modeChipActive]}
                                    onPress={() => setEditMode(m)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.modeChipText, editMode === m && styles.modeChipTextActive]}>
                                        {PAYMENT_MODE_EMOJI[m]} {m}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Note */}
                        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Note</Text>
                        <View style={[styles.inputBox, { minHeight: 70, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <Text style={[styles.inputEmoji, { marginTop: 2 }]}>📝</Text>
                            <TextInput
                                style={[styles.textInput, { flex: 1 }]}
                                value={editNote}
                                onChangeText={setEditNote}
                                placeholderTextColor={C.textMuted}
                                placeholder="Optional note"
                                multiline
                            />
                        </View>

                        {/* Save button */}
                        <TouchableOpacity style={styles.submitBtn} onPress={saveEdit} activeOpacity={0.85} disabled={editSaving}>
                            {editSaving
                                ? <ActivityIndicator color={C.white} />
                                : <Text style={styles.submitBtnText}>Save Changes</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
            <Modal transparent visible={deleteModal} animationType="fade" onRequestClose={() => setDeleteModal(false)}>
                <View style={styles.confirmBackdrop}>
                    <View style={styles.confirmCard}>
                        <View style={styles.confirmIconCircle}>
                            <Text style={{ fontSize: 28 }}>🗑️</Text>
                        </View>
                        <Text style={styles.confirmTitle}>Delete Payment?</Text>
                        <Text style={styles.confirmMessage}>
                            {deleteItem
                                ? `₹${parseFloat(deleteItem.amount).toLocaleString('en-IN')} · ${deleteItem.payment_mode} · ${formatDate(deleteItem.paymentDate)}`
                                : ''}
                        </Text>
                        <Text style={styles.confirmSub}>This action cannot be undone.</Text>

                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModal(false)} activeOpacity={0.8}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete} activeOpacity={0.8} disabled={deleteLoading}>
                                {deleteLoading
                                    ? <ActivityIndicator color={C.white} size="small" />
                                    : <Text style={styles.confirmBtnText}>Delete</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    // Summary banner
    summaryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryIconBox: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: C.primaryLight,
        justifyContent: 'center', alignItems: 'center',
    },
    summaryLabel: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
    summaryCount: { fontSize: 12, color: C.textMuted, marginTop: 1 },
    summaryRight: { alignItems: 'flex-end' },
    summaryTotalLabel: { fontSize: 11, color: C.textMuted, fontWeight: '500' },
    summaryTotal: { fontSize: 18, fontWeight: '800', color: C.primary },

    // List
    listContent: { padding: 16, paddingBottom: 32 },

    // Card
    card: {
        backgroundColor: C.white,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#1C3A36',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    ribbon: {
        position: 'absolute', top: 0, left: 0,
        backgroundColor: C.primaryLight,
        borderTopLeftRadius: 16, borderBottomRightRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
        zIndex: 1,
    },
    ribbonText: { fontSize: 11, fontWeight: '700', color: C.primary },

    cardTop: {
        flexDirection: 'row', alignItems: 'center',
        gap: 12, padding: 16, paddingTop: 22, paddingLeft: 16,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: C.primaryPale,
        borderWidth: 1.5, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    paymentMode: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    paymentDate: { fontSize: 12, color: C.textMuted, marginTop: 3 },
    amountBadge: {
        backgroundColor: C.primaryPale,
        borderRadius: 10, borderWidth: 1, borderColor: C.border,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    amountText: { fontSize: 14, fontWeight: '800', color: C.primary },

    // Amount row
    amtRow: {
        flexDirection: 'row',
        backgroundColor: C.bg,
        marginHorizontal: 14, marginBottom: 10,
        borderRadius: 10, overflow: 'hidden',
        borderWidth: 1, borderColor: C.border,
    },
    amtCell: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    amtDivider: { width: 1, backgroundColor: C.border },
    amtLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },
    amtValue: { fontSize: 13, color: C.textPrimary, fontWeight: '700', marginTop: 3 },

    // Note box
    noteBox: {
        marginHorizontal: 14, marginBottom: 10,
        backgroundColor: C.bg, borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 8,
        borderLeftWidth: 3, borderLeftColor: C.border,
    },
    noteText: { fontSize: 13, color: C.textSub },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        borderTopWidth: 1, borderTopColor: C.border,
    },
    actionBtn: { flex: 1, paddingVertical: 13, alignItems: 'center' },
    actionBtnText: { fontSize: 13, fontWeight: '700', color: C.primary },
    actionBarDivider: { width: 1, backgroundColor: C.border },

    // Center states
    centerBox: {
        flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32,
    },
    loadingText: { fontSize: 14, color: C.textMuted, marginTop: 10 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
    emptySubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center' },

    // Bottom sheet
    sheetBackdrop: {
        flex: 1, backgroundColor: 'rgba(13,43,54,0.5)', justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: C.white,
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: 20, paddingBottom: 36,
    },
    sheetHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
    sheetClose: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center',
    },

    // Inputs
    inputLabel: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6, letterSpacing: 0.3 },
    inputBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.inputBg, borderRadius: 12,
        borderWidth: 1.5, borderColor: C.border,
        paddingHorizontal: 14, minHeight: 50,
    },
    inputEmoji: { fontSize: 14, marginRight: 8 },
    textInput: {
        color: C.textPrimary, fontSize: 15, fontWeight: '500',
        flex: 1, paddingVertical: 0,
    },

    // Mode chips
    modeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    modeChip: {
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
        backgroundColor: C.bg,
    },
    modeChipActive: { borderColor: C.primary, backgroundColor: C.primaryPale },
    modeChipText: { fontSize: 13, fontWeight: '600', color: C.textSub },
    modeChipTextActive: { color: C.primary },

    // Submit button
    submitBtn: {
        marginTop: 22, backgroundColor: C.primary,
        borderRadius: 16, paddingVertical: 17, alignItems: 'center',
        shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    submitBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },

    // Confirm modal
    confirmBackdrop: {
        flex: 1, backgroundColor: 'rgba(13,43,54,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    confirmCard: {
        width: 300, backgroundColor: C.white,
        borderRadius: 22, padding: 24, alignItems: 'center',
        shadowColor: '#1C3A36', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    confirmIconCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: C.accentPale, justifyContent: 'center', alignItems: 'center',
        marginBottom: 14, borderWidth: 1, borderColor: '#FCCCC4',
    },
    confirmTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 6 },
    confirmMessage: { fontSize: 13, color: C.textSub, textAlign: 'center', fontWeight: '600' },
    confirmSub: { fontSize: 12, color: C.textMuted, marginTop: 4, marginBottom: 22 },
    confirmButtons: { flexDirection: 'row', gap: 10, width: '100%' },
    cancelBtn: {
        flex: 1, paddingVertical: 13, borderRadius: 14,
        borderWidth: 1.5, borderColor: C.border,
        backgroundColor: C.primaryPale, alignItems: 'center',
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: C.primary },
    confirmBtn: {
        flex: 1, paddingVertical: 13, borderRadius: 14,
        backgroundColor: C.accent, alignItems: 'center',
        shadowColor: C.accent, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    confirmBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
});

export default PaymentHistory;
