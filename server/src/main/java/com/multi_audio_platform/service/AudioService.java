package com.multi_audio_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;

public interface AudioService {
    List<Audio> getAllAudio();
    List<Audio> getAudioByType(AudioType type);
    List<Audio> getAudioByAuthor(String author);
    List<Audio> getAudioByName(String name);
    Optional<Audio> getAudioById(Long id);
    Audio createAudio(Audio audio, MultipartFile coverFile);
    Audio getAudioByTypePaginated(AudioType type, Pageable pageable);
}
