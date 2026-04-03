package com.multi_audio_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignInResponse {
    private boolean success;
    private String message;
    private String redirect; // "linking" or "main"
    private Long userId;
}