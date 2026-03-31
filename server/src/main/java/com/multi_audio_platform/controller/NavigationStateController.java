package com.multi_audio_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multi_audio_platform.dto.NavigationUpdateDTO;
import com.multi_audio_platform.model.NavigationState;
import com.multi_audio_platform.service.NavigationStateService;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin
public class NavigationStateController {

    private final NavigationStateService navigationStateService;

    public NavigationStateController(NavigationStateService navigationStateService) {
        this.navigationStateService = navigationStateService;
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateState (@RequestBody NavigationUpdateDTO updateDTO) {
        try {
            NavigationState savedState = navigationStateService.saveState(
                updateDTO.getUserId(),
                updateDTO.getCardIdentifier());
            return ResponseEntity.ok(savedState);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save navigation state: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getLastState(@PathVariable Long userId) {
        return navigationStateService.getLastState(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
}
