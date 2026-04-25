package com.multi_audio_platform.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class HashingService {

    // ─── Hash email for database lookups ──────────────────────────────────────
    // SHA-256 is one-way — cannot be reversed back to original email
    // Always produces the same output for the same input, so queries work

    public String hashEmail(String email) {
        if (email == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(
                email.toLowerCase().trim().getBytes(StandardCharsets.UTF_8)
            );
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }
}