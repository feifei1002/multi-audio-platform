package com.multi_audio_platform.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Audio;
import com.multi_audio_platform.model.AudioType;
import com.multi_audio_platform.model.Cover;
import com.multi_audio_platform.service.AudioService;
import com.multi_audio_platform.service.CoverService;

import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/audios")
@CrossOrigin(originPatterns = "*", allowCredentials = "true", allowedHeaders = "*")
public class AudioController {

    private final AudioService audioService;
    private final CoverService coverService;
    
    public AudioController(AudioService audioService, CoverService coverService) {
        this.audioService = audioService;
        this.coverService = coverService;
    }
    
    // @GetMapping("/")
    // public Map<String, String> ping() {
    //     return Collections.singletonMap("status", "Backend is reachable!");
    // }

    @GetMapping("/")
    public List<Audio> getAllAudio() {
        return audioService.getAllAudio();
    }

    @GetMapping("/audio/{id}")
    public ResponseEntity<Audio> getAudioById(@PathVariable Long id) {
        return audioService.getAudioById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public List<Audio> getAudioByType(@PathVariable AudioType type) {
        return audioService.getAudioByType(type);
    }

    @GetMapping("/author/{author}")
    public List<Audio> getAudioByAuthor(@PathVariable String author) {
        return audioService.getAudioByAuthor(author);
    }

    @GetMapping("/name/{name}")
    public List<Audio> getAudioByName(@PathVariable String name) {
        return audioService.getAudioByName(name);
    }

    @GetMapping("/type/{type}/id/{index}")
    public ResponseEntity<Audio> getAudioByIndex(@PathVariable AudioType type, @PathVariable int index) {
        int pageNumber = Math.max(0, index - 1);
        PageRequest pageRequest = PageRequest.of(pageNumber, 1, Sort.by("id"));
        Audio result = audioService.getAudioByTypePaginated(type, pageRequest);
    
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/add", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Audio> addAudio(@RequestPart("audio") String audioJSON, @RequestPart("file") MultipartFile coverFile) {
        
        ObjectMapper objectMapper = new ObjectMapper();
        Audio audio = objectMapper.readValue(audioJSON, Audio.class);

        Cover savedCover;
        try {
            savedCover = coverService.saveCover(coverFile);
            audio.setCover(savedCover);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return ResponseEntity.ok(audioService.createAudio(audio, coverFile));
    }

}
