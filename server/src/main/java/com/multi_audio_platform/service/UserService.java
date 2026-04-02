package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${app.base.url}")
    private String baseUrl;

    // ─── Register ────────────────────────────────────────────────────────────

    public RegisterResponse register(RegisterRequest request) {
        // Validate fields
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

        // Parse date of birth
        LocalDate dob;
        try {
            String cleaned = request.getDateOfBirth().replace(" ", "");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            dob = LocalDate.parse(cleaned, formatter);
        } catch (DateTimeParseException e) {
            return new RegisterResponse(false, "Invalid date format. Use DD/MM/YYYY.", null);
        }

        // Generate verification token
        String token = UUID.randomUUID().toString();

        // Save user as unverified
        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .dateOfBirth(dob)
                .email(request.getEmail().toLowerCase().trim())
                .verified(false)
                .verificationToken(token)
                .build();

        userRepository.save(user);

        // Send activation email
        try {
            sendActivationEmail(user.getEmail(), user.getFirstName(), token);
        } catch (Exception e) {
            // User is saved, but email failed — still return success
            // so user can request resend later if needed
            return new RegisterResponse(true,
                "Account created but we couldn't send the activation email. Please contact support.", null);
        }

        return new RegisterResponse(true,
            "Account created! Please check your email to activate your account.", null);
    }

    // ─── Verify Email ─────────────────────────────────────────────────────────

    public RegisterResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            return new RegisterResponse(false, "Invalid verification link.", null);
        }

        Optional<User> optionalUser = userRepository.findByVerificationToken(token);

        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "Verification link is invalid or already used.", null);
        }

        User user = optionalUser.get();

        if (Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(true, "Your account is already verified. You can sign in.", user.getId());
        }

        user.setVerified(true);
        user.setVerificationToken(null); // clear token after use
        userRepository.save(user);

        return new RegisterResponse(true, "Account verified successfully! You can now sign in.", user.getId());
    }

    // ─── Send Activation Email ────────────────────────────────────────────────

    private void sendActivationEmail(String email, String firstName, String token) {
        String activationLink = baseUrl + "/api/auth/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Activate your MultiAudio Player account");
        message.setText(
            "Hi " + firstName + ",\n\n" +
            "Thanks for signing up for MultiAudio Player!\n\n" +
            "Please click the link below to activate your account:\n\n" +
            activationLink + "\n\n" +
            "This link will remain valid until you use it.\n\n" +
            "If you didn't create an account, you can safely ignore this email.\n\n" +
            "— The MultiAudio Player Team"
        );
        mailSender.send(message);
    }

    // ─── Get User By ID ──────────────────────────────────────────────────────
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}