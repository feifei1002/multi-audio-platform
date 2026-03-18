package com.multi_audio_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;
import com.multi_audio_platform.repository.AudioRepository;

@Service
public class AudioServiceImpl implements AudioService {

    private final AudioRepository audioRepository;

    public AudioServiceImpl(AudioRepository audioRepository) {
        this.audioRepository = audioRepository;
    }

    @Override
    public List<Audio> getAllAudio() {
        return audioRepository.findAll();
    }

    @Override
    public List<Audio> getAudioByType(AudioType type) {
        return audioRepository.findByType(type);
    }

    @Override
    public List<Audio> getAudioByAuthor(String author) {
        return audioRepository.findByAuthor(author);
    }

    @Override
    public List<Audio> getAudioByName(String name) {
        return audioRepository.findByName(name);
    }

    @Override
    public Optional<Audio> getAudioById(Long id) {
        return audioRepository.findById(id);
    }

    @Override
    public Audio createAudio(Audio audio) {
        return audioRepository.save(audio);
    }
    
    
}
