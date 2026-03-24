package com.multi_audio_platform.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String email;
}