import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { indexStyles } from '@/styles/indexScreen';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkingPageProps {
  onServiceSelect?: (service: string) => void;
}

// ─── Service Button ───────────────────────────────────────────────────────────

interface ServiceButtonProps {
  name: string;
  backgroundColor: string;
  onPress: () => void;
}

function ServiceButton({ name, backgroundColor, onPress }: ServiceButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.serviceButton, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`Link ${name}`}
    >
      <Text style={styles.serviceText}>{name}</Text>
    </TouchableOpacity>
  );
}

// ─── Linking Page ─────────────────────────────────────────────────────────────

export default function LinkingPage({ onServiceSelect }: LinkingPageProps) {
  const theme = useTheme();

  const handleServicePress = (service: string) => {
    // Placeholder — redirects to blank for now
    onServiceSelect?.(service);
  };

  return (
    <View
      style={[indexStyles.screen, { backgroundColor: theme.background }]}
      accessibilityLabel="Service linking screen"
    >
      {/* Gradient layers — identical to index page */}
      <View style={indexStyles.gradientLayerOne} />
      <View style={indexStyles.gradientLayerTwo} />

      {/* Stacked glass card — identical structure to index page */}
      <View style={indexStyles.stack}>
        {/* Main card */}
        <View
          style={[indexStyles.glassCard, indexStyles.mainCard, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Service linking panel"
        >
          {/* Header */}
          <View style={indexStyles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome to Multi Audio Stream Services
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />

          {/* Card subtitle */}
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Which service would you like to link?
          </Text>

          {/* Service buttons */}
          <View style={styles.buttonGroup}>
            <ServiceButton
              name="Apple Music"
              backgroundColor="#4973ef"
              onPress={() => handleServicePress('apple_music')}
            />
            <ServiceButton
              name="YouTube Music"
              backgroundColor="#4973ef"
              onPress={() => handleServicePress('youtube_music')}
            />
            <ServiceButton
              name="Spotify"
              backgroundColor="#4973ef"
              onPress={() => handleServicePress('spotify')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  divider: {
    height: 1,
    borderRadius: 999,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonGroup: {
    gap: Spacing.two,
  },
  serviceButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
});