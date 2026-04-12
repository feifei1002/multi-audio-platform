package com.multi_audio_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;
import com.multi_audio_platform.model.Cover;
import com.multi_audio_platform.repository.AudioRepository;
@Service
public class AudioServiceImpl implements AudioService {

    private final AudioRepository audioRepository;
    private final CoverService coverService;

    public AudioServiceImpl(AudioRepository audioRepository, CoverService coverService) {
        this.audioRepository = audioRepository;
        this.coverService = coverService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Audio> getAllAudio() {
        return audioRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Audio> getAudioByType(AudioType type) {
        return audioRepository.findByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Audio> getAudioByAuthor(String author) {
        return audioRepository.findByAuthor(author);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Audio> getAudioByName(String name) {
        return audioRepository.findByName(name);
    }

    @Override
    @Transactional(readOnly = true)
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

    @Override
    @Transactional(readOnly = true)
    public Optional<Audio> getAudioByTypePaginated(AudioType type, Pageable pageable) {
        Page<Audio> audioPage = audioRepository.findByType(type, pageable);
        if(audioPage.hasContent()) {
            return Optional.of(audioPage.getContent().get(0));
        }
        return Optional.empty();
    }
    
    
}
