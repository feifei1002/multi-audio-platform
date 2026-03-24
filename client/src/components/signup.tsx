import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SignUpForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

interface SignUpScreenProps {
  onNavigateToSignIn?: () => void;
}

// ─── Real backend ─────────────────────────────────────────────────────────────

async function registerUser(form: SignUpForm): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        email: form.email,
      }),
    });
    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (err: any) {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

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
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  borderColor,
  textColor,
  placeholderColor,
  labelColor,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          inputStyles.inputContainer,
          { borderColor: focused ? 'rgba(0,0,0,0.4)' : borderColor },
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

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

export default function SignUpScreen({ onNavigateToSignIn }: SignUpScreenProps) {
  const theme = useTheme();
  const [form, setForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const setField = (field: keyof SignUpForm) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSignUp = async () => {
    const { firstName, lastName, dateOfBirth, email } = form;
    if (!firstName || !lastName || !dateOfBirth || !email) {
      setStatusMessage('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setStatusMessage('Creating your account…');
    const result = await registerUser(form);
    setLoading(false);
    setStatusMessage(result.message);
    if (result.success) {
      Alert.alert('Success', result.message);
    }
  };

  const placeholderColor = 'rgba(0,0,0,0.25)';
  const labelColor = 'rgba(0,0,0,0.6)';

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join to start listening
          </Text>
        </View>

        <View style={[styles.glassCard, { borderColor: theme.backgroundSelected }]}>
          <View style={styles.formGrid}>
            <GlassInput
              label="First Name"
              value={form.firstName}
              onChangeText={setField('firstName')}
              placeholder="Ada"
              borderColor={theme.backgroundSelected}
              textColor={theme.text}
              placeholderColor={placeholderColor}
              labelColor={labelColor}
            />
            <GlassInput
              label="Last Name"
              value={form.lastName}
              onChangeText={setField('lastName')}
              placeholder="Lovelace"
              borderColor={theme.backgroundSelected}
              textColor={theme.text}
              placeholderColor={placeholderColor}
              labelColor={labelColor}
            />
            <GlassInput
              label="Date of Birth"
              value={form.dateOfBirth}
              onChangeText={setField('dateOfBirth')}
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              borderColor={theme.backgroundSelected}
              textColor={theme.text}
              placeholderColor={placeholderColor}
              labelColor={labelColor}
            />
            <GlassInput
              label="Email"
              value={form.email}
              onChangeText={setField('email')}
              placeholder="ada@lovelace.io"
              keyboardType="email-address"
              borderColor={theme.backgroundSelected}
              textColor={theme.text}
              placeholderColor={placeholderColor}
              labelColor={labelColor}
            />
          </View>

          {statusMessage !== '' && (
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {statusMessage}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.ctaButton, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleSignUp}
            disabled={loading}
            accessibilityLabel="Sign up button"
          >
            <Text style={styles.ctaText}>
              {loading ? 'Creating…' : 'Create Account →'}
            </Text>
          </TouchableOpacity>
        </View>

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
  statusText: { fontSize: 12, textAlign: 'center' },
  ctaButton: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', backgroundColor: '#2D6BE4',
  },
  ctaText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4, color: '#FFFFFF' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13 },
  footerLink: { fontSize: 13, fontWeight: '700' },
});