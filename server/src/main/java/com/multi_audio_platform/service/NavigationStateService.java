package com.multi_audio_platform.service;


import java.util.Optional;

import com.multi_audio_platform.model.CardType;
import com.multi_audio_platform.model.NavigationState;

public interface NavigationStateService {
    NavigationState saveState(Long userId, CardType cardIdentifier);
    Optional<NavigationState> getLastState(Long userId);
    
}
