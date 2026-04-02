import { useState } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignInScreenProps {
  onNavigateToSignUp?: () => void;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function signIn(email: string): Promise<{ success: boolean; message: string; redirect: string | null }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.', redirect: null };
  }
}

// ─── Glass Input ──────────────────────────────────────────────────────────────

interface GlassInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  borderColor: string;
  textColor: string;
  placeholderColor: string;
  labelColor: string;
}

function GlassInput({
  label, value, onChangeText, placeholder,
  borderColor, textColor, placeholderColor, labelColor,
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
          keyboardType="email-address"
          autoCapitalize="none"
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

// ─── Sign In Screen ───────────────────────────────────────────────────────────

export default function SignInScreen({ onNavigateToSignUp }: SignInScreenProps) {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const placeholderColor = 'rgba(0,0,0,0.25)';
  const labelColor = 'rgba(0,0,0,0.6)';

  const handleSignIn = async () => {
    if (!email.trim()) {
      setIsError(true);
      setStatusMessage('Please enter your email.');
      return;
    }
    setLoading(true);
    setIsError(false);
    setStatusMessage('Signing in…');
    const result = await signIn(email.trim());
    setLoading(false);
    setIsError(!result.success);
    setStatusMessage(result.message);

    if (result.success) {
      if (result.redirect === 'linking') {
        router.replace('/linking');
      } else if (result.redirect === 'main') {
        router.replace('/');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.orbTopLeft} />
      <View style={styles.orbBottomRight} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in with your email
          </Text>
        </View>

        {/* Single glass card */}
        <View style={[styles.glassCard, { borderColor: theme.backgroundSelected }]}>
          <GlassInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="example@gmail.com"
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
            onPress={handleSignIn}
            disabled={loading}
            accessibilityLabel="Sign in button"
          >
            <Text style={styles.ctaText}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </Text>
          </TouchableOpacity>
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