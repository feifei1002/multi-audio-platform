package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.dto.SignInResponse;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OtpService otpService;

    // ─── Register ─────────────────────────────────────────────────────────────

    public RegisterResponse register(RegisterRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank() ||
            request.getLastName() == null || request.getLastName().isBlank() ||
            request.getDateOfBirth() == null || request.getDateOfBirth().isBlank() ||
            request.getEmail() == null || request.getEmail().isBlank()) {
            return new RegisterResponse(false, "Please fill in all fields.", null);
        }

        if (!request.getEmail().contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.", null);
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            return new RegisterResponse(false, "An account with this email already exists.", null);
        }

        LocalDate dob;
        try {
            String cleaned = request.getDateOfBirth().replace(" ", "");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            dob = LocalDate.parse(cleaned, formatter);
        } catch (DateTimeParseException e) {
            return new RegisterResponse(false, "Invalid date format. Use DD/MM/YYYY.", null);
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .dateOfBirth(dob)
                .email(request.getEmail().toLowerCase().trim())
                .verified(false)
                .linked(false)
                .build();

        userRepository.save(user);

        RegisterResponse otpResult = otpService.sendSignUpOtp(user.getEmail());
        if (!otpResult.isSuccess()) {
            return new RegisterResponse(true,
                "Account created but we couldn't send the activation code. Please contact support.",
                user.getId());
        }

        return new RegisterResponse(true,
            "Account created! Please enter the code sent to " + user.getEmail(),
            user.getId());
    }

    // ─── Sign In ──────────────────────────────────────────────────────────────

    public SignInResponse signIn(String email) {
        if (email == null || email.isBlank()) {
            return new SignInResponse(false, "Please enter your email.", null,null);
        }

        if (!email.contains("@")) {
            return new SignInResponse(false, "Please enter a valid email address.", null,null);
        }

        Optional<User> optionalUser = userRepository.findByEmail(email.toLowerCase().trim());

        if (optionalUser.isEmpty()) {
            return new SignInResponse(false, "No account found with this email.", null,null);
        }

        User user = optionalUser.get();

        if (!Boolean.TRUE.equals(user.getVerified())) {
            return new SignInResponse(false,
                "Your account is not verified. Please check your email for the activation code.", null,null);
        }

        // Redirect based on whether user has linked a service
        if (!Boolean.TRUE.equals(user.getLinked())) {
            return new SignInResponse(true, "Welcome back, " + user.getFirstName() + "!", "linking", user.getId());
        }

        return new SignInResponse(true, "Welcome back, " + user.getFirstName() + "!", "main", user.getId());
    }

    // ─── Get User By ID ───────────────────────────────────────────────────────

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}