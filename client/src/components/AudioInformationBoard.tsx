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
                style={styles.coverImage}
                resizeMode="cover" 
                />
            )}

            {/*Display audio details */}
            <View style={styles.audioDetails}>
              <Text style={styles.author}>{audio.author}</Text>
              {audio.description && (
              <Text style={styles.description} numberOfLines={2}>
              {audio.description}
    </Text>
  )}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
      width: '100%',
      height: '80%',
      borderRadius: 28,

  },
  audioDetails: {
    width: '100%',
    height: '20%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: -2,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: -2,
  },
});