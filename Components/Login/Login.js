import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';
import LottieView from 'lottie-react-native';
import C from '../../colorConfig';

function Login() {
  const [loading, setLoading]             = useState(false);
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [invalidCredential, setInvalidCredential] = useState(false);

  const logo     = require('../../assets/logo.png');
  const showIcon = require('../../assets/eye.png');
  const hideIcon = require('../../assets/hidden.png');
  const navigation = useNavigation();

  // ── Logic (unchanged) ───────────────────────────────────────────────────────
  const verifyLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch(config.BASE_URL + 'login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (response.ok) {
        setInvalidCredential(false);
        await AsyncStorage.setItem('email', email);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        setInvalidCredential(true);
        await response.json();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Background ─────────────────────────────────────────────────────── */}
      <View style={styles.root}>

        {/* Decorative teal blob top-right */}
        <View style={styles.blobTopRight} />
        {/* Decorative gold blob bottom-left */}
        <View style={styles.blobBottomLeft} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand area ─────────────────────────────────────────────────── */}
          <View style={styles.brandArea}>
            {/* Logo tile */}
            <View style={styles.logoTile}>
              <Image source={logo} style={styles.logoImg} resizeMode="contain" />
            </View>

            <Text style={styles.brandName}>LMJ</Text>
            <Text style={styles.brandTagline}>Management Portal</Text>
          </View>

          {/* ── Login card ─────────────────────────────────────────────────── */}
          <View style={styles.card}>

            {/* Card header row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIconBox}>
                <Text style={{ fontSize: 16 }}>🔒</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSub}>Sign in to your account</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Username */}
            <Text style={styles.inputLabel}>Username</Text>
            <View style={[styles.inputBox, email.length > 0 && styles.inputBoxFocused]}>
              <Text style={styles.inputEmoji}>👤</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter username"
                placeholderTextColor={C.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t); setInvalidCredential(false); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password</Text>
            <View style={[styles.inputBox, password.length > 0 && styles.inputBoxFocused]}>
              <Text style={styles.inputEmoji}>🔑</Text>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor={C.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setInvalidCredential(false); }}
                key={showPassword ? 'shown' : 'hidden'}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Image
                  source={showPassword ? showIcon : hideIcon}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Invalid credential error */}
            {invalidCredential && (
              <View style={styles.errorRow}>
                <Text style={styles.errorDot}>●</Text>
                <Text style={styles.errorText}>Invalid username or password</Text>
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={verifyLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>

            {/* Footer note */}
            <Text style={styles.footerNote}>
              Secure access · LMJ Management Portal
            </Text>
          </View>

          {/* Bottom spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── Loading overlay ─────────────────────────────────────────────── */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
             <LottieView
                               source={require('../../assets/Coin purse.json')}
                               autoPlay loop
                               style={{ width: 140, height: 140 }}
                             />
                <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Signing In</Text>

            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Decorative blobs
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.primaryLight,
    opacity: 0.7,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: C.goldLight,
    opacity: 0.6,
  },

  // ── Scroll
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // ── Brand area
  brandArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoTile: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 14,
  },
  logoImg: {
    width: 64,
    height: 64,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // ── Card
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 22,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 18,
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
  inputBoxFocused: {
    borderColor: C.primary,
    backgroundColor: C.primaryPale,
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

  // ── Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: C.accentPale,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorDot: {
    fontSize: 8,
    color: C.accent,
  },
  errorText: {
    fontSize: 13,
    color: C.accent,
    fontWeight: '600',
  },

  // ── Login button
  loginBtn: {
    marginTop: 22,
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
  loginBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Footer note
  footerNote: {
    marginTop: 16,
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // ── Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(13,43,54,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSub,
  },
});

export default Login;
