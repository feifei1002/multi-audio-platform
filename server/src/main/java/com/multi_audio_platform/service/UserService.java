package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.dto.SignInResponse;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EncryptionService encryptionService;
    private final HashingService hashingService;

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

        String rawEmail = request.getEmail().toLowerCase().trim();
        String emailHash = hashingService.hashEmail(rawEmail);

        // Check if email already exists using hash
        Optional<User> existingUser = userRepository.findByEmail(emailHash);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (!Boolean.TRUE.equals(user.getVerified())) {
                return new RegisterResponse(false, "UNVERIFIED_ACCOUNT", user.getId());
            }
            return new RegisterResponse(false, "An account with this email already exists.", null);
        }

        // Validate date format before encrypting
        if (!request.getDateOfBirth().matches("\\d{2}/\\d{2}/\\d{4}")) {
            return new RegisterResponse(false, "Invalid date format. Use DD/MM/YYYY.", null);
        }

        // Encrypt PII before saving
        User user = User.builder()
                .firstName(encryptionService.encrypt(request.getFirstName().trim()))
                .lastName(encryptionService.encrypt(request.getLastName().trim()))
                .dateOfBirth(encryptionService.encrypt(request.getDateOfBirth().trim()))
                .email(emailHash)
                .emailEncrypted(encryptionService.encrypt(rawEmail))
                .verified(false)
                .linked(false)
                .build();

        userRepository.save(user);

        // Send OTP using the raw email (decrypted)
        RegisterResponse otpResult = otpService.sendSignUpOtp(rawEmail);
        if (!otpResult.isSuccess()) {
            return new RegisterResponse(true,
                "Account created but we couldn't send the activation code. Please contact support.",
                user.getId());
        }

        return new RegisterResponse(true,
            "Account created! Please enter the code sent to " + rawEmail,
            user.getId());
    }

    // ─── Sign In ──────────────────────────────────────────────────────────────

    public SignInResponse signIn(String email) {
        if (email == null || email.isBlank()) {
            return new SignInResponse(false, "Please enter your email.", null, null);
        }

        if (!email.contains("@")) {
            return new SignInResponse(false, "Please enter a valid email address.", null, null);
        }

        // Hash the email for lookup
        String emailHash = hashingService.hashEmail(email.toLowerCase().trim());
        Optional<User> optionalUser = userRepository.findByEmail(emailHash);

        if (optionalUser.isEmpty()) {
            return new SignInResponse(false, "No account found with this email.", null, null);
        }

        User user = optionalUser.get();

        if (!Boolean.TRUE.equals(user.getVerified())) {
            return new SignInResponse(false,
                "Your account is not verified. Please check your email for the activation code.", null, null);
        }

        if (!Boolean.TRUE.equals(user.getLinked())) {
            return new SignInResponse(true, "Welcome back!", "linking", user.getId());
        }

        return new SignInResponse(true, "Welcome back!", "main", user.getId());
    }

    // ─── Get User By ID ───────────────────────────────────────────────────────
    // Decrypts PII before returning to frontend

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setFirstName(encryptionService.decrypt(user.getFirstName()));
            user.setLastName(encryptionService.decrypt(user.getLastName()));
            user.setDateOfBirth(encryptionService.decrypt(user.getDateOfBirth()));
            user.setEmailEncrypted(encryptionService.decrypt(user.getEmailEncrypted()));
            return user;
        });
    }
}