import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'form' | 'otp' | 'continue';

interface SignUpForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

interface SignUpScreenProps {
  onNavigateToSignIn?: () => void;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function registerUser(form: SignUpForm): Promise<{
  success: boolean;
  message: string;
  userId?: number;
}> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    return await response.json();
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

async function verifySignUpOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-signup-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return await response.json();
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

async function resendSignUpOtp(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/resend-signup-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
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
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  cell: {
    width: 46, height: 56, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  cellText: { fontSize: 22, fontWeight: '700' },
  cursor: {
    position: 'absolute', bottom: 10, width: 2,
    height: 20, borderRadius: 1, opacity: 0.7,
  },
});

// ─── Glass Input ──────────────────────────────────────────────────────────────

interface GlassInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  borderColor: string;
  textColor: string;
  placeholderColor: string;
  labelColor: string;
}

function GlassInput({
  label, value, onChangeText, placeholder,
  keyboardType = 'default', borderColor, textColor,
  placeholderColor, labelColor,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, { color: labelColor }]}>{label}</Text>
      <View style={[
        inputStyles.inputContainer,
        { borderColor: focused ? 'rgba(0,0,0,0.4)' : borderColor },
      ]}>
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
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
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
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  inputContainer: {
    borderRadius: 14, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: { fontSize: 15, fontWeight: '400' },
});

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

export default function SignUpScreen({ onNavigateToSignIn }: SignUpScreenProps) {
  const theme = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<SignUpForm>({
    firstName: '', lastName: '', dateOfBirth: '', email: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const placeholderColor = 'rgba(0,0,0,0.25)';
  const labelColor = 'rgba(0,0,0,0.6)';

  const setField = (field: keyof SignUpForm) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // ── Submit form ───────────────────────────────────────────────────────────

  const handleRegister = async () => {
    const { firstName, lastName, dateOfBirth, email } = form;
    if (!firstName || !lastName || !dateOfBirth || !email) {
      setIsError(true);
      setStatusMessage('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setIsError(false);
    setStatusMessage('Creating your account…');
    const result = await registerUser(form);
    setLoading(false);

    if (result.success) {
      setRegisteredEmail(form.email.trim().toLowerCase());
      setIsError(false);
      setStatusMessage('');
      setStep('otp');
    } else if (result.message === 'UNVERIFIED_ACCOUNT') {
      // Unverified account exists — show continue prompt
      setRegisteredEmail(form.email.trim().toLowerCase());
      setIsError(false);
      setStatusMessage('');
      setStep('continue');
    } else {
      setIsError(true);
      setStatusMessage(result.message);
    }
  };

  // ── Continue signup — resend OTP and go to OTP step ──────────────────────

  const handleContinueSignup = async () => {
    setLoading(true);
    setIsError(false);
    setStatusMessage('Sending new code…');
    const result = await resendSignUpOtp(registeredEmail);
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);
    if (result.success) {
      setOtp('');
      setStep('otp');
    }
  };

  const handleStartFresh = () => {
    // Go back to form with email cleared so user knows they need a different email
    setStep('form');
    setForm({ firstName: '', lastName: '', dateOfBirth: '', email: '' });
    setRegisteredEmail('');
    setStatusMessage('');
    setIsError(false);
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setIsError(true);
      setStatusMessage('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setIsError(false);
    setStatusMessage('Verifying…');
    const result = await verifySignUpOtp(registeredEmail, otp);
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);

    if (result.success) {
      setRegisteredEmail('');
      router.replace('/linking' as any);
    }

    if (!result.success && result.message.includes('cancelled')) {
      setTimeout(() => {
        setStep('form');
        setOtp('');
        setForm({ firstName: '', lastName: '', dateOfBirth: '', email: '' });
        setStatusMessage('');
        setIsError(false);
        setRegisteredEmail('');
      }, 2000);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setIsError(false);
    setStatusMessage('Resending code…');
    const result = await resendSignUpOtp(registeredEmail);
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);
    if (result.success) setOtp('');
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtp('');
    setStatusMessage('');
    setIsError(false);
  };

  // ── Header text per step ──────────────────────────────────────────────────

  const headerTitle = () => {
    if (step === 'form') return 'Create Account';
    if (step === 'otp') return 'Verify Email';
    return 'Welcome Back';
  };

  const headerSubtitle = () => {
    if (step === 'form') return 'Join to enjoy!';
    if (step === 'otp') return `Enter the 6-digit code sent to ${registeredEmail}`;
    return `We found an incomplete signup for ${registeredEmail}`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{headerTitle()}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{headerSubtitle()}</Text>
        </View>

        {/* Single glass card */}
        <View style={[styles.glassCard, { borderColor: theme.backgroundSelected }]}>

          {/* ── Form step ── */}
          {step === 'form' && (
            <>
              <View style={styles.formGrid}>
                <GlassInput
                  label="First Name" value={form.firstName}
                  onChangeText={setField('firstName')} placeholder=""
                  borderColor={theme.backgroundSelected} textColor={theme.text}
                  placeholderColor={placeholderColor} labelColor={labelColor}
                />
                <GlassInput
                  label="Last Name" value={form.lastName}
                  onChangeText={setField('lastName')} placeholder=""
                  borderColor={theme.backgroundSelected} textColor={theme.text}
                  placeholderColor={placeholderColor} labelColor={labelColor}
                />
                <GlassInput
                  label="Date of Birth" value={form.dateOfBirth}
                  onChangeText={setField('dateOfBirth')} placeholder="DD/MM/YYYY"
                  keyboardType="numeric"
                  borderColor={theme.backgroundSelected} textColor={theme.text}
                  placeholderColor={placeholderColor} labelColor={labelColor}
                />
                <GlassInput
                  label="Email" value={form.email}
                  onChangeText={setField('email')} placeholder="example@gmail.com"
                  keyboardType="email-address"
                  borderColor={theme.backgroundSelected} textColor={theme.text}
                  placeholderColor={placeholderColor} labelColor={labelColor}
                />
              </View>

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: isError ? '#E53E3E' : '#38A169' }]}>
                  {statusMessage}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleRegister}
                disabled={loading}
                accessibilityLabel="Create account button"
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Creating…' : 'Create Account →'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Continue step ── */}
          {step === 'continue' && (
            <>
              <View style={styles.continueBox}>
                <Text style={[styles.continueTitle, { color: theme.text }]}>
                  You already started signing up.{'\n'}Continue?
                </Text>
                <Text style={[styles.continueSubtitle, { color: theme.textSecondary }]}>
                  We'll send a new activation code to{'\n'}{registeredEmail}
                </Text>
              </View>

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: isError ? '#E53E3E' : '#38A169' }]}>
                  {statusMessage}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleContinueSignup}
                disabled={loading}
                accessibilityLabel="Continue signup button"
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Sending…' : 'Resend OTP & Continue →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartFresh}
                accessibilityLabel="Use different email"
              >
                <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                  Use a different email
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── OTP step ── */}
          {step === 'otp' && (
            <>
              <View style={styles.otpSection}>
                <Text style={[inputStyles.label, { color: labelColor }]}>Activation Code</Text>
                <OtpInput
                  value={otp} onChange={setOtp}
                  borderColor={theme.backgroundSelected} textColor={theme.text}
                />
              </View>

              <Text style={[styles.hintText, { color: labelColor }]}>
                Code expires in 5 minutes. If you don't receive it, tap Resend below.
              </Text>

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: isError ? '#E53E3E' : '#38A169' }]}>
                  {statusMessage}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
                accessibilityLabel="Verify activation code"
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Verifying…' : 'Activate Account →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={loading}
                accessibilityLabel="Resend activation code"
              >
                <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                  Didn't receive a code? Resend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBackToForm} accessibilityLabel="Back to sign up form">
                <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                  ← Use a different email
                </Text>
              </TouchableOpacity>
            </>
          )}

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToSignIn} accessibilityLabel="Go to sign in">
            <Text style={[styles.footerLink, { color: theme.text }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  orbTopRight: {
    position: 'absolute', width: 340, height: 340,
    top: -80, right: -80, borderRadius: 999,
    backgroundColor: '#2D4B6A', opacity: 0.28,
  },
  orbBottomLeft: {
    position: 'absolute', width: 300, height: 300,
    bottom: -60, left: -60, borderRadius: 999,
    backgroundColor: '#7E8FA4', opacity: 0.18,
  },
  scrollContent: {
    flexGrow: 1, padding: Spacing.five,
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
  formGrid: { gap: Spacing.three },
  continueBox: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  continueSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpSection: { gap: Spacing.two },
  hintText: { fontSize: 11, textAlign: 'center', opacity: 0.7 },
  statusText: { fontSize: 12, textAlign: 'center' },
  ctaButton: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', backgroundColor: '#2D6BE4',
  },
  ctaText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4, color: '#FFFFFF' },
  linkText: { fontSize: 12, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13 },
  footerLink: { fontSize: 13, fontWeight: '700' },
});