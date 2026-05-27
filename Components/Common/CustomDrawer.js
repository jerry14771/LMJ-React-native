import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDrawerStatus } from '@react-navigation/drawer';
import config from '../../config';

// ─── Design Tokens ───────────────────────────────────────────────────────────
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
};

// ─── Nav Items Config ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    key: 'InvoiceNav',
    label: 'Invoice',
    emoji: '🧾',
    onPress: (nav) => nav.navigate('InvoiceHome'),
  },
  {
    key: 'BandhakNav',
    label: 'Bandhak',
    emoji: '💍',
    onPress: (nav) => nav.navigate('BandhakNav', { screen: 'BandhakHome' }),
  },
  {
    key: 'UdhariNav',
    label: 'Udhari',
    emoji: '📒',
    onPress: (nav) => nav.navigate('UdhariNav', { screen: 'UdhariHome' }),
  },
  {
    key: 'FilterNav',
    label: 'Status Filter',
    emoji: '🔍',
    onPress: (nav) => nav.navigate('FilterNav'),
  },
];

  const logo = require('../../assets/logo.png');


// ─── NavItem Component ────────────────────────────────────────────────────────
const NavItem = ({ item, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 4 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.navItem,
            isActive && styles.navItemActive,
          ]}
        >
          {/* Icon box */}
          <View
            style={[
              styles.navIconBox,
              isActive && styles.navIconBoxActive,
            ]}
          >
            <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
          </View>

          <Text
            style={[
              styles.navLabel,
              isActive && styles.navLabelActive,
            ]}
          >
            {item.label}
          </Text>

          {/* Active indicator arrow */}
          {isActive && (
            <View style={styles.navActiveIndicator}>
              <Text style={{ fontSize: 10, color: C.primary }}>›</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
const CustomDrawer = (props) => {
  const navigation = useNavigation();
  const [pageName, setPageName] = useState('HomeScreen');
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isDrawerOpen = useDrawerStatus();

  useEffect(() => {
    const { state } = props;
    const { routes, index } = state;
    setPageName(routes[index].name);
  });

  useEffect(() => {
    fetchUserDetail();
  }, [isDrawerOpen]);

  const fetchUserDetail = async () => {
    try {
      const url = config.BASE_URL + 'adminDetail.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(),
      });
      const result = await response.json();
      if (result.status === 'success') setData(result.data);
    } catch (e) {
      // handle silently
    }
  };

  const handleConfirm = async () => {
    await AsyncStorage.clear();
    setModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Loading / error state
  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <View style={styles.loadingPulse}>
          <Text style={{ fontSize: 28 }}>💎</Text>
        </View>
        <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 12 }}>
          Loading…
        </Text>
      </View>
    );
  }

  const profileUri = data.profile_pic
    ? config.BASE_URL + data.profile_pic
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop';

  const initials = data.admin_name
    ? data.admin_name.charAt(0).toUpperCase()
    : '?';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Top Section ─────────────────────────────────────── */}
      <View style={{ flex: 1 }}>

        {/* Brand header strip */}
        <View style={styles.brandStrip}>
          <View style={styles.brandIcon}>
           <Image source={logo } style={{height:44,width:44}}/>
          </View>
          <View>
            <Text style={styles.brandTitle}>LMJ</Text>
            <Text style={styles.brandSub}>Management Portal</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileUri }}
              style={styles.avatar}
              resizeMode="cover"
            />
            {/* Online dot */}
            <View style={styles.onlineDot} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.adminName} numberOfLines={1}>
              {data.admin_name || '—'}
            </Text>
            {/* Role pill */}
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section label */}
        <Text style={styles.sectionLabel}>MODULES</Text>

        {/* Nav items */}
        <View style={{ paddingHorizontal: 12 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              isActive={pageName === item.key}
              onPress={() => item.onPress(navigation)}
            />
          ))}
        </View>
      </View>

      {/* ── Bottom Section ───────────────────────────────────── */}
      <View>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={{ paddingHorizontal: 12 }}>
          {/* Settings */}
          <NavItem
            item={{ key: 'Settings', label: 'Settings', emoji: '⚙️' }}
            isActive={pageName === 'Settings'}
            onPress={() => navigation.navigate('Settings')}
          />

          {/* Logout — always deactive style but accent on press */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.navItem, styles.logoutItem]}>
              <View style={[styles.navIconBox, styles.logoutIconBox]}>
                <Text style={{ fontSize: 16 }}>🚪</Text>
              </View>
              <Text style={styles.logoutLabel}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={styles.versionText}>v1.0.0 · LMJ</Text>
      </View>

      {/* ── Logout Confirm Modal ─────────────────────────────── */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Icon */}
            <View style={styles.modalIconCircle}>
              <Text style={{ fontSize: 28 }}>🚪</Text>
            </View>

            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalMessage}>
              You'll be redirected to the login screen.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingBottom: 24,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
  },
  loadingPulse: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Brand
  brandStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    // backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.primary,
  },
  onlineDot: {
    position: 'absolute',
    top: -3,
    left: -5,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#25A968',
    borderWidth: 2,
    borderColor: C.white,
  },
  welcomeText: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  adminName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 1,
  },
  rolePill: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.4,
  },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Nav item
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    marginBottom: 3,
  },
  navItemActive: {
    backgroundColor: C.primaryPale,
    borderWidth: 1,
    borderColor: C.border,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  navIconBoxActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.textSub,
  },
  navLabelActive: {
    color: C.primary,
    fontWeight: '700',
  },
  navActiveIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logout
  logoutItem: {
    marginTop: 4,
  },
  logoutIconBox: {
    backgroundColor: C.accentPale,
    borderColor: '#FCCCC4',
  },
  logoutLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
  },

  // Version
  versionText: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.3,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,43,54,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 300,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.accentPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCCCC4',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.primaryPale,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.accent,
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});

export default CustomDrawer;
