import React from 'react';
import { ActivityIndicator, View, Text, Image, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { AudioData } from '@/types/audio';

interface Props {
    audio: AudioData | null;
    loading: boolean;
    theme: any;
}

export function AudioInformationBoard({audio, loading, theme} : Props) {
    if(loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={theme.text} />
            </View>
        );
    }

    if(!audio) {
        return (
            <View style={styles.center}>
                <Text style={{ color: theme.text }}>No track selected</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Display audio cover */}
            {audio.cover?.data && (
                <Image
                source={{ uri: `data:${audio.cover.contentType};base64,${audio.cover.data}` }} 
                style={styles.fullCover}
                resizeMode="cover" 
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    padding: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullCover: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D6BE4',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  author: {
    fontSize: 14,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
});