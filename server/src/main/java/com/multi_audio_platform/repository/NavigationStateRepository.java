package com.multi_audio_platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.multi_audio_platform.model.NavigationState;

public interface NavigationStateRepository extends JpaRepository<NavigationState, Long> {
    Optional<NavigationState> findById(Long userId);
}
