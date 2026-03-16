package com.multi_audio_platform.service;

import java.util.List;
import java.util.Optional;

import com.multi_audio_platform.model.Audio;

public interface AudioService {
    List<Audio> getAllAudio();
    Optional<Audio> getAudioById(Long id);
    Audio createAudio(Audio audio);
}
