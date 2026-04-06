package com.multi_audio_platform.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;

public interface AudioRepository extends JpaRepository<Audio, Long> {
    List<Audio> findAll();
    List<Audio> findByType(AudioType type);
    Page<Audio> findByType(AudioType type, Pageable pageable);
    List<Audio> findByAuthor(String author);
    List<Audio> findByName(String name);
}
