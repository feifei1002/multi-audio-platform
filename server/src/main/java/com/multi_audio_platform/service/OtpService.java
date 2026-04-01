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

    // Separate OTP stores for sign-up and sign-in
    private final Map<String, OtpEntry> signUpOtpStore = new ConcurrentHashMap<>();
    private final Map<String, OtpEntry> signInOtpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;

    // ─── Send Sign Up OTP (for unverified users) ──────────────────────────────

    public RegisterResponse sendSignUpOtp(String email) {
        if (email == null || email.isBlank()) {
            return new RegisterResponse(false, "Email is required.");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.");
        }

        User user = optionalUser.get();

        if (Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false, "Account is already verified. Please sign in.");
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        signUpOtpStore.put(email.toLowerCase().trim(), new OtpEntry(otp, expiry));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Activate your Glass Player account");
            message.setText(
                "Hi " + user.getFirstName() + ",\n\n" +
                "Your account activation code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't create an account, you can safely ignore this email.\n\n" +
                "— The Glass Player Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.");
        }

        return new RegisterResponse(true, "Activation code sent to " + email);
    }

    // ─── Verify Sign Up OTP ───────────────────────────────────────────────────

    public RegisterResponse verifySignUpOtp(String email, String otp) {
        if (email == null || otp == null) {
            return new RegisterResponse(false, "Invalid request.");
        }

        String key = email.toLowerCase().trim();
        OtpEntry entry = signUpOtpStore.get(key);

        if (entry == null) {
            return new RegisterResponse(false, "No activation code was sent to this email.");
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            signUpOtpStore.remove(key);
            return new RegisterResponse(false, "Code has expired. Please request a new one.");
        }

        if (!entry.otp().equals(otp.trim())) {
            return new RegisterResponse(false, "Incorrect code. Please try again.");
        }

        // Mark user as verified
        Optional<User> optionalUser = userRepository.findByEmail(key);
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "Account not found.");
        }

        User user = optionalUser.get();
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        signUpOtpStore.remove(key);
        return new RegisterResponse(true, "Account activated successfully!");
    }

    // ─── Send Sign In OTP (only for verified users) ───────────────────────────

    public RegisterResponse sendOtp(String email) {
        if (email == null || email.isBlank()) {
            return new RegisterResponse(false, "Please enter your email.");
        }

        if (!email.contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.");
        }

        User user = optionalUser.get();
        if (!Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false,
                "Please verify your email first. Check your inbox for the activation code.");
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        signInOtpStore.put(email.toLowerCase().trim(), new OtpEntry(otp, expiry));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Glass Player Sign-In Code");
            message.setText(
                "Hi " + user.getFirstName() + ",\n\n" +
                "Your one-time sign-in code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "— The Glass Player Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.");
        }

        return new RegisterResponse(true, "OTP sent to " + email);
    }

    // ─── Verify Sign In OTP ───────────────────────────────────────────────────

    public RegisterResponse verifyOtp(String email, String otp) {
        if (email == null || otp == null) {
            return new RegisterResponse(false, "Invalid request.");
        }

        String key = email.toLowerCase().trim();
        OtpEntry entry = signInOtpStore.get(key);

        if (entry == null) {
            return new RegisterResponse(false, "No OTP was sent to this email.");
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            signInOtpStore.remove(key);
            return new RegisterResponse(false, "OTP has expired. Please request a new one.");
        }

        if (!entry.otp().equals(otp.trim())) {
            return new RegisterResponse(false, "Incorrect OTP. Please try again.");
        }

        signInOtpStore.remove(key);
        return new RegisterResponse(true, "Signed in successfully!");
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(999999));
    }

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}