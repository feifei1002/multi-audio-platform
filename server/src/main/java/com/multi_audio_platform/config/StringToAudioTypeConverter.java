package com.multi_audio_platform.config;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.multi_audio_platform.model.AudioType;

@Component
public class StringToAudioTypeConverter implements Converter<String, AudioType> {
    @Override
    public AudioType convert(String source) {
        try {
            return AudioType.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
            // Will implement custom exception handling later to return a more informative error message to the client
        }
    }
}
