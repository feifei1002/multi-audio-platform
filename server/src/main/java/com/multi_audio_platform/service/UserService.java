package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public RegisterResponse register(RegisterRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank() ||
            request.getLastName() == null || request.getLastName().isBlank() ||
            request.getDateOfBirth() == null || request.getDateOfBirth().isBlank() ||
            request.getEmail() == null || request.getEmail().isBlank()) {
            return new RegisterResponse(false, "Please fill in all fields.");
        }

        if (!request.getEmail().contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return new RegisterResponse(false, "An account with this email already exists.");
        }

        LocalDate dob;
        try {
            String cleaned = request.getDateOfBirth().replace(" ", "");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            dob = LocalDate.parse(cleaned, formatter);
        } catch (DateTimeParseException e) {
            return new RegisterResponse(false, "Invalid date format. Use DD/MM/YYYY.");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .dateOfBirth(dob)
                .email(request.getEmail().toLowerCase().trim())
                .build();

        userRepository.save(user);

        return new RegisterResponse(true, "Account created!");
    }
}