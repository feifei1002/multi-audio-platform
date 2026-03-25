package com.multi_audio_platform.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.multi_audio_platform.model.Cover;

public interface CoverRepository extends JpaRepository<Cover, Long> {
    Cover findByFilename(String filename);
    boolean existsByFilename(String filename);
}
