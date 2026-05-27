import { View, Text, Image, TouchableOpacity, StatusBar, Modal, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Same color system as AddInvoice ─────────────────────────────────────────
const C = {
    primary: '#1A9E8F',
    primaryLight: '#D6F5F1',
    primaryPale: '#EEF9F8',
    accent: '#FF7058',
    bg: '#F4FAF9',
    white: '#FFFFFF',
    textPrimary: '#1A2E35',
    textSub: '#5A7A82',
    textMuted: '#8FAAB0',
    border: '#C8E8E4',
};

const Header = (props) => {
    const hamburger = require('../../assets/more.png');
    const logo = require('../../assets/logo.png');
    const navigation = useNavigation();

    const [logoutModal, setLogoutModal] = useState(false);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        setLogoutModal(false);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={C.white} />

            <View style={s.bar}>

                {/* Left — Hamburger */}
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    style={s.iconBtn}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Image source={hamburger} style={[s.icon, { tintColor: C.textPrimary }]} />
                </TouchableOpacity>

                {/* Center — Logo */}
                {/* <View style={s.logoWrap}>
          <Image source={logo} style={s.logo} resizeMode="contain" />
        </View> */}

                {/* Right — ID badge or logout trigger */}
                {props.id ? (
                    <View style={s.idBadge}>
                        <Text style={s.idText}>{props.id}</Text>
                    </View>
                ) : (
                    /* Empty placeholder to keep logo centered */
                    <View style={s.iconBtn} />
                )}

            </View>

            {/* Bottom accent line */}
            <View style={s.accent} />

            {/* ── Logout Confirmation Modal ── */}
            <Modal transparent visible={logoutModal} animationType="fade" onRequestClose={() => setLogoutModal(false)}>
                <View style={m.backdrop}>
                    <View style={m.sheet}>
                        {/* Icon */}
                        <View style={m.iconCircle}>
                            <View style={m.iconInner} />
                        </View>

                        <Text style={m.title}>Sign out?</Text>
                        <Text style={m.message}>You'll be returned to the login screen. Any unsaved changes will be lost.</Text>

                        <View style={m.btnRow}>
                            <TouchableOpacity style={m.cancelBtn} onPress={() => setLogoutModal(false)} activeOpacity={0.8}>
                                <Text style={m.cancelLabel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={m.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                                <Text style={m.logoutLabel}>Sign out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// ─── Header Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: C.white,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 52 : 14,
        paddingBottom: 10,
    },
    accent: {
        height: 1,
        backgroundColor: C.border,
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
    },

    // Logo
    logoWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        height: 36,
        width: 100,
    },

    // ID badge (shown on specific pages via props.id)
    idBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: C.primaryLight,
        borderWidth: 1,
        borderColor: C.border,
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    idText: {
        color: C.primary,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

// ─── Logout Modal Styles ──────────────────────────────────────────────────────
const m = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(26,46,53,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    sheet: {
        width: '100%',
        backgroundColor: C.white,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },

    // Decorative icon at top
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEF1EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FADDD8',
    },
    iconInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: C.accent,
        opacity: 0.9,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: C.textPrimary,
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    message: {
        fontSize: 13,
        color: C.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },

    btnRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: C.border,
        backgroundColor: C.primaryPale,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: C.textSub,
        color: C.textPrimary,
    },
    logoutBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: C.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: C.white,
    },
});

export default Header;
