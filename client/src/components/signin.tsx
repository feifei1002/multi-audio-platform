import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { saveUserSession } from '@/utils/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'email' | 'otp';

interface SignInScreenProps {
  onNavigateToSignUp?: () => void;
}

// ─── backend ─────────────────────────────────────────────────────────────

async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; userId?: number }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    return { success: data.success, message: data.message, userId: data.userId };
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.'};
  }
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  borderColor: string;
  textColor: string;
}

function OtpInput({ value, onChange, borderColor, textColor }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, ' ').split('');

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      accessibilityLabel="OTP input"
    >
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={text => onChange(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="numeric"
        maxLength={6}
        style={otpStyles.hiddenInput}
        caretHidden
      />
      <View style={otpStyles.row}>
        {digits.map((digit, i) => (
          <View
            key={i}
            style={[
              otpStyles.cell,
              {
                borderColor: i === value.length ? 'rgba(0,0,0,0.4)' : borderColor,
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            <Text style={[otpStyles.cellText, { color: textColor }]}>
              {digit.trim() || ''}
            </Text>
            {i === value.length && (
              <View style={[otpStyles.cursor, { backgroundColor: textColor }]} />
            )}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const otpStyles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 22,
    fontWeight: '700',
  },
  cursor: {
    position: 'absolute',
    bottom: 10,
    width: 2,
    height: 20,
    borderRadius: 1,
    opacity: 0.7,
  },
});

// ─── Interface ──────────────────────────────────────────────────────────────

interface GlassInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  borderColor: string;
  textColor: string;
  placeholderColor: string;
  labelColor: string;
  editable?: boolean;
}

function GlassInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  borderColor,
  textColor,
  placeholderColor,
  labelColor,
  editable = true,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          inputStyles.inputContainer,
          {
            borderColor: focused ? 'rgba(0,0,0,0.4)' : borderColor,
            opacity: editable ? 1 : 0.55,
          },
        ]}
      >
        <TextInput
          style={[
            inputStyles.input,
            { color: textColor },
            Platform.OS === 'web' && ({ outline: 'none' } as any),
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor="transparent"
        />
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    fontSize: 15,
    fontWeight: '400',
  },
});

// ─── Sign In Screen ───────────────────────────────────────────────────────────

export default function SignInScreen({ onNavigateToSignUp }: SignInScreenProps) {
  const theme = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const placeholderColor = 'rgba(0,0,0,0.25)';
  const labelColor = 'rgba(0,0,0,0.6)';

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setIsError(true);
      setStatusMessage('Please enter your email.');
      return;
    }
    setLoading(true);
    setIsError(false);
    setStatusMessage('Sending OTP…');
    const result = await sendOtp(email.trim());
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);
    if (result.success) setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setIsError(true);
      setStatusMessage('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setIsError(false);
    setStatusMessage('Verifying…');
    const result = await verifyOtp(email.trim(), otp);
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);
    if (result.success && result.userId) {
      await saveUserSession('userId', String(result.userId));
      // Redirect to index page
      router.replace('/');
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setStatusMessage('');
    setIsError(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Ambient orbs */}
      <View style={styles.orbTopLeft} />
      <View style={styles.orbBottomRight} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {step === 'email' ? 'Welcome Back' : 'Enter OTP'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 'email'
              ? 'Sign in with your email'
              : `Check ${email} for your one-time code`}
          </Text>
        </View>

        {/* Single glass card */}
        <View style={[styles.glassCard, { borderColor: theme.backgroundSelected }]}>
          {step === 'email' ? (
            <>
              <GlassInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                keyboardType="email-address"
                borderColor={theme.backgroundSelected}
                textColor={theme.text}
                placeholderColor={placeholderColor}
                labelColor={labelColor}
              />

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: isError ? '#E53E3E' : '#38A169' }]}>
                  {statusMessage}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleSendOtp}
                disabled={loading}
                accessibilityLabel="Send OTP button"
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Sending…' : 'Send OTP →'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <GlassInput
                label="Email"
                value={email}
                onChangeText={() => {}}
                borderColor={theme.backgroundSelected}
                textColor={theme.text}
                placeholderColor={placeholderColor}
                labelColor={labelColor}
                editable={false}
              />

              <View style={styles.otpSection}>
                <Text style={[inputStyles.label, { color: labelColor }]}>One-Time Password</Text>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  borderColor={theme.backgroundSelected}
                  textColor={theme.text}
                />
              </View>

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: isError ? '#E53E3E' : '#38A169' }]}>
                  {statusMessage}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
                accessibilityLabel="Verify OTP and sign in"
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Verifying…' : 'Sign In →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBack} accessibilityLabel="Back to email step">
                <Text style={[styles.backLink, { color: theme.textSecondary }]}>
                  ← Use a different email
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToSignUp} accessibilityLabel="Go to sign up">
            <Text style={[styles.footerLink, { color: theme.text }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  orbTopLeft: {
    position: 'absolute', width: 340, height: 340,
    top: -80, left: -80, borderRadius: 999,
    backgroundColor: '#2D4B6A', opacity: 0.28,
  },
  orbBottomRight: {
    position: 'absolute', width: 300, height: 300,
    bottom: -60, right: -60, borderRadius: 999,
    backgroundColor: '#7E8FA4', opacity: 0.18,
  },
  content: {
    flex: 1, padding: Spacing.five,
    justifyContent: 'center', gap: Spacing.five,
  },
  header: {
    gap: Spacing.one, maxWidth: 600,
    width: '100%', alignSelf: 'center',
  },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 13 },
  glassCard: {
    borderRadius: 28, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: Spacing.five, gap: Spacing.four,
    shadowColor: '#0B1824', shadowOpacity: 0.18,
    shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    maxWidth: 600, width: '100%', alignSelf: 'center',
  },
  otpSection: { gap: Spacing.two },
  statusText: { fontSize: 12, textAlign: 'center' },
  ctaButton: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', backgroundColor: '#2D6BE4',
  },
  ctaText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4, color: '#FFFFFF' },
  backLink: { fontSize: 12, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13 },
  footerLink: { fontSize: 13, fontWeight: '700' },
});