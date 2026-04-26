package com.multi_audio_platform.service;

import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.dto.SignInResponse;
import com.multi_audio_platform.model.CardType;
import com.multi_audio_platform.model.NavigationState;
import com.multi_audio_platform.model.User;
import com.multi_audio_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
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
    private final HashingService hashingService;
    private final EncryptionService encryptionService;

    private final Map<String, OtpEntry> signUpOtpStore = new ConcurrentHashMap<>();
    private final Map<String, OtpEntry> signInOtpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_OTP_ATTEMPTS = 3;

    // ─── Send Sign Up OTP ─────────────────────────────────────────────────────

    public RegisterResponse sendSignUpOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return new RegisterResponse(false, "Please enter your email.", null);
        }

        String key = rawEmail.toLowerCase().trim();
        String emailHash = hashingService.hashEmail(key);

        Optional<User> optionalUser = userRepository.findByEmail(emailHash);
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.", null);
        }

        User user = optionalUser.get();

        if (Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false, "Account is already verified. Please sign in.", null);
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        signUpOtpStore.put(key, new OtpEntry(otp, expiry));

        // Decrypt first name for email greeting
        String firstName = encryptionService.decrypt(user.getFirstName());

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(key);
            message.setSubject("Activate your Multi-Audio Platform account");
            message.setText(
                "Hi " + firstName + ",\n\n" +
                "Your account activation code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't create an account, you can safely ignore this email.\n\n" +
                "— The Multi-Audio Platform Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.", null);
        }

        return new RegisterResponse(true, "Activation code sent to " + key, null);
    }

    // ─── Verify Sign Up OTP ───────────────────────────────────────────────────

    public RegisterResponse verifySignUpOtp(String rawEmail, String otp) {
        if (rawEmail == null || otp == null) {
            return new RegisterResponse(false, "Invalid request.", null);
        }

        String key = rawEmail.toLowerCase().trim();
        String emailHash = hashingService.hashEmail(key);
        OtpEntry entry = signUpOtpStore.get(key);

        if (entry == null) {
            return new RegisterResponse(false, "No activation code was sent to this email.", null);
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            signUpOtpStore.remove(key);
            return new RegisterResponse(false,
                "Code has expired. Please click resend to get a new one.", null);
        }

        if (!entry.otp().equals(otp.trim())) {
            Optional<User> optionalUser = userRepository.findByEmail(emailHash);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                int attempts = (user.getOtpAttempts() == null ? 0 : user.getOtpAttempts()) + 1;
                user.setOtpAttempts(attempts);

                if (attempts >= MAX_OTP_ATTEMPTS) {
                    userRepository.delete(user);
                    signUpOtpStore.remove(key);
                    return new RegisterResponse(false,
                        "Too many incorrect attempts. Your registration has been cancelled. Please sign up again.", null);
                }

                userRepository.save(user);
                int remaining = MAX_OTP_ATTEMPTS - attempts;
                return new RegisterResponse(false,
                    "Incorrect code. " + remaining + " attempt(s) remaining.", null);
            }
            return new RegisterResponse(false, "Incorrect code. Please try again.", null);
        }

        // OTP correct — mark user as verified
        Optional<User> optionalUser = userRepository.findByEmail(emailHash);
        if (optionalUser.isEmpty()) {
            signUpOtpStore.remove(key);
            return new RegisterResponse(false,
                "Registration was not found or has expired. Please sign up again.", null);
        }

        User user = optionalUser.get();
        user.setVerified(true);
        user.setVerificationToken(null);
        user.setOtpAttempts(0);

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

    // ─── Send Sign In OTP ─────────────────────────────────────────────────────

    public RegisterResponse sendSignInOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return new RegisterResponse(false, "Please enter your email.", null);
        }

        if (!rawEmail.contains("@")) {
            return new RegisterResponse(false, "Please enter a valid email address.", null);
        }

        String key = rawEmail.toLowerCase().trim();
        String emailHash = hashingService.hashEmail(key);

        Optional<User> optionalUser = userRepository.findByEmail(emailHash);
        if (optionalUser.isEmpty()) {
            return new RegisterResponse(false, "No account found with this email.", null);
        }

        User user = optionalUser.get();

        if (!Boolean.TRUE.equals(user.getVerified())) {
            return new RegisterResponse(false,
                "Your account is not verified. Please check your email for the activation code.", null);
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        signInOtpStore.put(key, new OtpEntry(otp, expiry));

        String firstName = encryptionService.decrypt(user.getFirstName());

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(key);
            message.setSubject("Your Multi-Audio Platform Sign-In Code");
            message.setText(
                "Hi " + firstName + ",\n\n" +
                "Your one-time sign-in code is: " + otp + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "— The Multi-Audio Platform Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            return new RegisterResponse(false, "Failed to send OTP. Please try again.", null);
        }

        return new RegisterResponse(true, "OTP sent to " + key, null);
    }

    // ─── Verify Sign In OTP ───────────────────────────────────────────────────

    public SignInResponse verifySignInOtp(String rawEmail, String otp) {
        if (rawEmail == null || otp == null) {
            return new SignInResponse(false, "Invalid request.", null, null);
        }

        String key = rawEmail.toLowerCase().trim();
        OtpEntry entry = signInOtpStore.get(key);

        if (entry == null) {
            return new SignInResponse(false, "No OTP was sent to this email.", null, null);
        }

        if (LocalDateTime.now().isAfter(entry.expiry())) {
            signInOtpStore.remove(key);
            return new SignInResponse(false, "OTP has expired. Please request a new one.", null, null);
        }

        if (!entry.otp().equals(otp.trim())) {
            return new SignInResponse(false, "Incorrect OTP. Please try again.", null, null);
        }

        signInOtpStore.remove(key);

        String emailHash = hashingService.hashEmail(key);
        User user = userRepository.findByEmail(emailHash)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String redirect = Boolean.TRUE.equals(user.getLinked()) ? "main" : "linking";
        return new SignInResponse(true, "Signed in successfully!", redirect, user.getId());
    }

    // ─── Scheduled cleanup ────────────────────────────────────────────────────

    @Scheduled(fixedRate = 300000)
    public void cleanUpUnverifiedUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        userRepository.deleteUnverifiedUsersOlderThan(cutoff);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(999999));
    }

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}