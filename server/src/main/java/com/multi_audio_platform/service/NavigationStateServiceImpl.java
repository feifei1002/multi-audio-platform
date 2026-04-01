package com.multi_audio_platform.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.multi_audio_platform.model.CardType;
import com.multi_audio_platform.model.NavigationState;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.NavigationStateRepository;
import com.multi_audio_platform.repository.UserRepository;

@Service
public class NavigationStateServiceImpl implements NavigationStateService {
    
    
    private final NavigationStateRepository navigationStateRepository;
    private final UserRepository userRepository;

    public NavigationStateServiceImpl(NavigationStateRepository navigationStateRepository, UserRepository userRepository) {
        this.navigationStateRepository = navigationStateRepository;
        this.userRepository = userRepository;
    }

    @Override
    public NavigationState saveState(Long userId, CardType cardIdentifier) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

        NavigationState navigationState = navigationStateRepository.findById(userId)
        .orElse(new NavigationState());
        navigationState.setUser(user);
        navigationState.setCardIdentifier(cardIdentifier);
        navigationState.setTimestamp(LocalDateTime.now());
        return navigationStateRepository.save(navigationState);
    }

    @Override
    public Optional<NavigationState> getLastState(Long userId) {
        return navigationStateRepository.findById(userId);
    }
}
