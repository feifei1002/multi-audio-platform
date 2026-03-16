package com.multi_audio_platform.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.service.AudioService;

@RestController
public class AudioController {

    private final AudioService audioService;
    
    public AudioController(AudioService audioService) {
        this.audioService = audioService;
    }
    
    @GetMapping("/")
    public Map<String, String> ping() {
        return Collections.singletonMap("status", "Backend is reachable!");
    }

    @GetMapping("/audio")
    public List<Audio> getAllAudio() {
        return audioService.getAllAudio();
    }

    @PostMapping("/audio/add")
    public Audio addAudio(@RequestBody Audio audio) {
        return audioService.createAudio(audio);
    }

}
