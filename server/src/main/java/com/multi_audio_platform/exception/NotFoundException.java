package com.multi_audio_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.multi_audio_platform.model.Audio;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends RuntimeException {
    public NotFoundException(Long id) {
        super("User with ID " + id + " not found.");
    }

    public NotFoundException(Audio audio) {
        super("Audio with ID " + audio.getId() + " not found.");
    }
}
