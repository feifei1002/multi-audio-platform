package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterResponse;
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

    // In-memory OTP store: email -> OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;

    // ─── Send OTP ────────────────────────────────────────────────────────────

    public RegisterResponse sendOtp(String email) {
        if (email == null || email.isBlank()) {
            return new RegisterResponse(false, "Please enter your email.");
        }

        if (!email.contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.");
        }

        // Check if user exists
        Optional<User> optionalUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.");
        }

        // Block unverified users
        User user = optionalUser.get();
        if (!Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false,
                "Please verify your email first. Check your inbox for the activation link.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpStore.put(email.toLowerCase().trim(), new OtpEntry(otp, expiry));

        // Send OTP email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your MultiAudio Player Sign-In Code");
            message.setText(
                "Hi " + user.getFirstName() + ",\n\n" +
                "Your one-time sign-in code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "— The MultiAudio Player Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.");
        }

        return new RegisterResponse(true, "OTP sent to " + email);
    }

    // ─── Verify OTP ──────────────────────────────────────────────────────────

    public RegisterResponse verifyOtp(String email, String otp) {
        if (email == null || otp == null) {
            return new RegisterResponse(false, "Invalid request.");
        }

        String key = email.toLowerCase().trim();
        OtpEntry entry = otpStore.get(key);

        if (entry == null) {
            return new RegisterResponse(false, "No OTP was sent to this email.");
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            otpStore.remove(key);
            return new RegisterResponse(false, "OTP has expired. Please request a new one.");
        }

        if (!entry.otp().equals(otp.trim())) {
            return new RegisterResponse(false, "Incorrect OTP. Please try again.");
        }

        // Valid — remove so it can't be reused
        otpStore.remove(key);
        return new RegisterResponse(true, "Signed in successfully!");
    }

    // ─── OTP Entry record ────────────────────────────────────────────────────

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}