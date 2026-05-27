import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  StyleSheet,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Header from '../Common/Header';
import config from '../../config';
import { TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
};

const Settings = () => {
  const [userimg, setuserImg]         = useState(null);
  const navigation                     = useNavigation();
  const cameralogo                     = require('../../assets/camera.png');
  const showIcon                       = require('../../assets/eye.png');
  const hideIcon                       = require('../../assets/hidden.png');
  const [data, setData]               = useState(null);
  const [isOn, setIsOn]               = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [staffUserName, setStaffUserName] = useState(null);
  const [staffPassword, setStaffPassword] = useState(null);

  // ── Data fetching (unchanged) ───────────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      fetchUserDetail();
      getStaffStatus();
      getStaffCredential();
    }, [])
  );

  const getStaffStatus = async () => {
    const url = config.BASE_URL + 'getStaffStatus.php';
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify() });
    const result = await response.json();
    setIsOn(result.code == 200);
  };

  const getStaffCredential = async () => {
    const url = config.BASE_URL + 'getStaffCredential.php';
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const result = await response.json();
    if (result.status == 200) {
      setStaffUserName(result.data.user_name);
      setStaffPassword(result.data.password);
    }
  };

  const fetchUserDetail = async () => {
    const url = config.BASE_URL + 'adminDetail.php';
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify() });
    const result = await response.json();
    if (result.status == 'success') setData(result.data);
  };

  const changeStaffStatus = async (status) => {
    const url = config.BASE_URL + 'toggleAdminStatus.php';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status ? 'yes' : 'no' }),
    });
  };

  const onSelectImage = async () => {
    Alert.alert('Choose Medium', 'Choose option', [
      { text: 'Camera',  onPress: () => onCamera() },
      { text: 'Gallery', onPress: () => onGallery() },
      { text: 'Cancel',  onPress: () => {} },
    ]);
  };

  const onCamera = () => {
    ImagePicker.openCamera({ width: 500, height: 500, cropping: true, includeBase64: true })
      .then(image => { setuserImg(image); uploadImage(image); });
  };

  const onGallery = () => {
    ImagePicker.openPicker({ width: 500, height: 500, cropping: true, includeBase64: true })
      .then(image => { setuserImg(image); uploadImage(image); });
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append('profile_pic', { uri: image.path, type: image.mime, name: `profile_${Date.now()}.jpg` });
    const response = await fetch(config.BASE_URL + 'updateProfilePic.php', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    });
    const result = await response.json();
    if (result.status === 'success') {
      Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Image uploaded successfully!' });
      fetchUserDetail();
    }
  };

  useEffect(() => {
    const changeProfilePic = async () => {
      const userImageToSend = userimg ? 'data:' + userimg.mime + ';base64,' + userimg.data : null;
      const url = 'https://trust.webmastersinfotech.in/api/update_profile/update_member_image.php';
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: userImageToSend }) });
      const result = await response.json();
      if (result.code == 200) { setuserImg(null); fetchUserDetail(); }
    };
    if (userimg) changeProfilePic();
  }, [userimg]);

  const updateStaffCredential = async () => {
    const url = config.BASE_URL + 'updateStaffCredential.php';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: staffUserName, password: staffPassword }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.code == '200') {
          Toast.show({ type: 'success', text1: 'Success', text2: 'Staff credentials updated successfully!' });
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Update failed!' });
        }
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Network Error', text2: 'Something went wrong. Please try again.' });
      });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!data) return null;

  const profileUri = data.profile_pic
    ? config.BASE_URL + data.profile_pic
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  const initials = data.admin_name ? data.admin_name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Hero Card ─────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Decorative teal strip at top */}
          <View style={styles.heroStrip} />

          {/* Avatar with gold ring */}
          <View style={styles.avatarArea}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: profileUri }} style={styles.avatarImg} resizeMode="cover" />
              <TouchableOpacity style={styles.cameraBtn} onPress={onSelectImage} activeOpacity={0.8}>
                <Image source={cameralogo} style={{ height: 16, width: 16 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name / shop */}
          <Text style={styles.heroName}>{data.admin_name || 'Admin'}</Text>
          <Text style={styles.heroShop}>{data.shop_name || 'Jewellers'}</Text>

          {/* Admin pill */}
          <View style={styles.adminPill}>
            <View style={styles.adminPillDot} />
            <Text style={styles.adminPillText}>Administrator</Text>
          </View>
        </View>

        {/* ── Staff Access Card ──────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 16 }}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>Staff Access</Text>
          </View>

          {/* Toggle row */}
          {isOn !== null && (
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Staff Login</Text>
                <Text style={styles.toggleSub}>
                  {isOn ? 'Staff can currently log in' : 'Staff login is disabled'}
                </Text>
              </View>
              <Switch
                value={isOn}
                onValueChange={(val) => { setIsOn(val); changeStaffStatus(val); }}
                trackColor={{ false: '#E0E0E0', true: C.primaryLight }}
                thumbColor={isOn ? C.primary : '#BDBDBD'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          )}

          {/* Status pill */}
          <View style={[styles.statusPill, { backgroundColor: isOn ? '#E6F9F0' : '#FEF1EE' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOn ? '#25A968' : C.accent }]} />
            <Text style={[styles.statusPillText, { color: isOn ? '#1A7A4A' : C.accent }]}>
              {isOn ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* ── Staff Credentials Card ─────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 16 }}>🔐</Text>
            </View>
            <Text style={styles.sectionTitle}>Staff Credentials</Text>
          </View>

          {/* Username field */}
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputEmoji}>👤</Text>
            <TextInput
              value={staffUserName}
              onChangeText={setStaffUserName}
              style={styles.textInput}
              placeholderTextColor={C.textMuted}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          {/* Password field */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputEmoji}>🔑</Text>
            <TextInput
              value={staffPassword}
              onChangeText={setStaffPassword}
              secureTextEntry={!showPassword}
              style={[styles.textInput, { flex: 1 }]}
              placeholderTextColor={C.textMuted}
              placeholder="Enter password"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
              <Image source={showPassword ? showIcon : hideIcon} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {/* Update button */}
          <TouchableOpacity style={styles.updateBtn} onPress={updateStaffCredential} activeOpacity={0.85}>
            <Text style={styles.updateBtnText}>Update Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* ── Danger zone spacer ─────────────────────────────────────────── */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Hero card
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    paddingBottom: 24,
  },
  heroStrip: {
    width: '100%',
    height: 72,
    backgroundColor: C.primary,
    marginBottom: -36,       // avatar overlaps
  },
  avatarArea: {
    marginBottom: 14,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    backgroundColor: C.goldLight,
    borderWidth: 2,
    borderColor: C.goldBorder,
    position: 'relative',
    // needed for the camera button
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: C.white,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 0.2,
  },
  heroShop: {
    fontSize: 13,
    color: C.textSub,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 10,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  adminPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  adminPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.4,
  },

  // ── Cards
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  // ── Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
  },

  // ── Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },

  // ── Status pill
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSub,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  textInput: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    paddingVertical: 0,
  },
  eyeIcon: {
    height: 20,
    width: 20,
    tintColor: C.textMuted,
  },

  // ── Update button
  updateBtn: {
    marginTop: 20,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  updateBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Settings;
