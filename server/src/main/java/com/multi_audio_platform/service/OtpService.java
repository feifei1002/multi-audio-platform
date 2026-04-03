package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.model.CardType;
import com.multi_audio_platform.model.NavigationState;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    private final Map<String, OtpEntry> signUpOtpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;

    // ─── Send Sign Up OTP (for unverified users) ──────────────────────────────

    public RegisterResponse sendSignUpOtp(String email) {
        if (email == null || email.isBlank()) {
            return new RegisterResponse(false, "Please enter your email.", null);
        }

        if (!email.contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.", null);
        }

        Optional<User> optionalUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.", null);
        }

        User user = optionalUser.get();

        // Only send OTP to unverified users — this is for sign up activation
        if (Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false, "Account is already verified. Please sign in.", null);
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        signUpOtpStore.put(email.toLowerCase().trim(), new OtpEntry(otp, expiry));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Activate your Multi-Audio Platform account");
            message.setText(
                "Hi " + user.getFirstName() + ",\n\n" +
                "Your account activation code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't create an account, you can safely ignore this email.\n\n" +
                "— The Multi-Audio Platform Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.", null);
        }

        return new RegisterResponse(true, "Activation code sent to " + email, null);
    }

    // ─── Verify Sign Up OTP ───────────────────────────────────────────────────

    public RegisterResponse verifySignUpOtp(String email, String otp) {
        if (email == null || otp == null) {
            return new RegisterResponse(false, "Invalid request.", null);
        }

        String key = email.toLowerCase().trim();
        OtpEntry entry = signUpOtpStore.get(key);

        if (entry == null) {
            return new RegisterResponse(false, "No activation code was sent to this email.", null);
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            signUpOtpStore.remove(key);
            return new RegisterResponse(false, "Code has expired. Please request a new one.", null);
        }

        if (!entry.otp().equals(otp.trim())) {
            return new RegisterResponse(false, "Incorrect code. Please try again.", null);
        }

        // Mark user as verified
        User user = userRepository.findByEmail(key)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        user.setVerificationToken(null);

        // Initialize default NavigationState on first verification (from her version)
        if (user.getNavigationState() == null) {
            NavigationState initialState = NavigationState.builder()
                    .user(user)
                    .cardIdentifier(CardType.PROFILE)
                    .timestamp(LocalDateTime.now())
                    .build();
            user.setNavigationState(initialState);
        }

        userRepository.save(user);
        signUpOtpStore.remove(key);

        return new RegisterResponse(true, "Account activated successfully!", user.getId());
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(999999));
    }

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}