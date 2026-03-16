package com.multi_audio_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.multi_audio_platform.model.Audio;

public interface AudioRepository extends JpaRepository<Audio, Long> {
    
}
