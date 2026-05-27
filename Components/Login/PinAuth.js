import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Animated,
} from 'react-native';

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
  gold:         '#D4AF37',
  goldLight:    '#FFF8E1',
  goldBorder:   '#F5D76E',
};

const PinAuth = ({ navigation }) => {
  const [pin, setPin]         = useState(['', '', '', '']);
  const [hasError, setHasError] = useState(false);
  const inputs                = useRef([]);
  const shakeAnim             = useRef(new Animated.Value(0)).current;

  // ── Logic (unchanged) ───────────────────────────────────────────────────────
  const handlePinChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      setPin(newPin);
      setHasError(false);
      if (text && index < 3) inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newPin = [...pin];
      if (newPin[index] === '') {
        if (index > 0) {
          newPin[index - 1] = '';
          setPin(newPin);
          inputs.current[index - 1].focus();
        }
      } else {
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handlePinSubmit = (enteredPin) => {
    if (enteredPin === '1234') {
      navigation.replace('Home');
    } else {
      setHasError(true);
      triggerShake();
      setTimeout(() => {
        setPin(['', '', '', '']);
        setHasError(false);
        inputs.current[0].focus();
      }, 600);
    }
  };

  const filledCount = pin.filter(d => d !== '').length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Decorative blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        {/* ── Brand mark ───────────────────────────────────────────────────── */}
        <View style={styles.brandArea}>
          <View style={styles.brandIconBox}>
            <Text style={{ fontSize: 32 }}>💎</Text>
          </View>
          <Text style={styles.brandName}>LMJ</Text>
          <Text style={styles.brandTagline}>Management Portal</Text>
        </View>

        {/* ── PIN card ─────────────────────────────────────────────────────── */}
        <View style={styles.card}>

          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={{ fontSize: 16 }}>🔐</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Enter your PIN</Text>
              <Text style={styles.cardSub}>4-digit security code</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* PIN dots progress */}
          <View style={styles.progressRow}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < filledCount && styles.progressDotFilled,
                  hasError && styles.progressDotError,
                ]}
              />
            ))}
          </View>

          {/* PIN inputs */}
          <Animated.View
            style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.pinBox,
                  digit !== '' && styles.pinBoxFilled,
                  hasError && styles.pinBoxError,
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handlePinChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholderTextColor={C.textMuted}
                secureTextEntry
                autoFocus={index === 0}
              />
            ))}
          </Animated.View>

          {/* Error message */}
          {hasError && (
            <View style={styles.errorRow}>
              <Text style={styles.errorDot}>●</Text>
              <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitBtn, filledCount < 4 && styles.submitBtnDisabled]}
            onPress={() => handlePinSubmit(pin.join(''))}
            activeOpacity={0.85}
            disabled={filledCount < 4}
          >
            <Text style={styles.submitBtnText}>Verify PIN</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerNote}>Secure access · LMJ Management Portal</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  // Blobs
  blobTopRight: {
    position: 'absolute',
    top: -60, right: -60,
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: C.primaryLight,
    opacity: 0.7,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80, left: -80,
    width: 240, height: 240,
    borderRadius: 120,
    backgroundColor: C.goldLight,
    opacity: 0.6,
  },

  // Brand
  brandArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1C3A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 3,
  },

  // Card
  card: {
    width: '100%',
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
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
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
    marginBottom: 20,
  },

  // Progress dots
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  progressDotFilled: {
    backgroundColor: C.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotError: {
    backgroundColor: C.accent,
  },

  // PIN inputs
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 18,
  },
  pinBox: {
    width: 58,
    height: 62,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
  },
  pinBoxFilled: {
    borderColor: C.primary,
    backgroundColor: C.primaryPale,
  },
  pinBoxError: {
    borderColor: C.accent,
    backgroundColor: '#FEF1EE',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.accentPale,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
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

  // Submit button
  submitBtn: {
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
  submitBtnDisabled: {
    backgroundColor: C.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer
  footerNote: {
    marginTop: 24,
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.3,
  },
});

export default PinAuth;
