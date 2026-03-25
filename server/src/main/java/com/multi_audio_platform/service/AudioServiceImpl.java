package com.multi_audio_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;
import com.multi_audio_platform.model.Cover;
import com.multi_audio_platform.repository.AudioRepository;

import jakarta.transaction.Transactional;

@Service
public class AudioServiceImpl implements AudioService {

    private final AudioRepository audioRepository;
    private final CoverService coverService;

    public AudioServiceImpl(AudioRepository audioRepository, CoverService coverService) {
        this.audioRepository = audioRepository;
        this.coverService = coverService;
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
    @Transactional
    public Audio createAudio(Audio audio, MultipartFile coverFile) {
        Cover cover;
        try {
            cover = coverService.saveCover(coverFile);
            audio.setCover(cover);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return audioRepository.save(audio);
    }
    
    
}
