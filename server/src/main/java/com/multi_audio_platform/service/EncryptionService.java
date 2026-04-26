package com.multi_audio_platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${encryption.secret.key}")
    private String secretKeyBase64;

    // ─── Encrypt ──────────────────────────────────────────────────────────────

    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            SecretKey key = getSecretKey();

            // Generate random IV for each encryption
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] encryptedData = cipher.doFinal(plainText.getBytes("UTF-8"));

            // Prepend IV to encrypted data so we can use it for decryption
            byte[] encryptedWithIv = new byte[GCM_IV_LENGTH + encryptedData.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, GCM_IV_LENGTH);
            System.arraycopy(encryptedData, 0, encryptedWithIv, GCM_IV_LENGTH, encryptedData.length);

            return Base64.getEncoder().encodeToString(encryptedWithIv);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    // ─── Decrypt ──────────────────────────────────────────────────────────────

    public String decrypt(String encryptedText) {
        if (encryptedText == null) return null;
        try {
            SecretKey key = getSecretKey();

            byte[] encryptedWithIv = Base64.getDecoder().decode(encryptedText);

            // Extract IV from the first 12 bytes
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(encryptedWithIv, 0, iv, 0, GCM_IV_LENGTH);

            // Extract the actual encrypted data
            byte[] encryptedData = new byte[encryptedWithIv.length - GCM_IV_LENGTH];
            System.arraycopy(encryptedWithIv, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] decryptedData = cipher.doFinal(encryptedData);
            return new String(decryptedData, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private SecretKey getSecretKey() {
        if (secretKeyBase64 == null || secretKeyBase64.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Invalid encryption.secret.key configuration: value is missing or blank. " +
                            "Expected Base64-encoded AES key bytes (16, 24, or 32 bytes; 32 bytes recommended for AES-256).");
        }

        final byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secretKeyBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "Invalid encryption.secret.key configuration: value is not valid Base64. " +
                            "Expected Base64-encoded AES key bytes (16, 24, or 32 bytes; 32 bytes recommended for AES-256).",
                    e);
        }

        if (!isValidAesKeyLength(keyBytes.length)) {
            throw new IllegalStateException(
                    "Invalid encryption.secret.key configuration: decoded key length is " + keyBytes.length +
                            " bytes. AES keys must be 16, 24, or 32 bytes; use Base64 of 32 bytes for AES-256.");
        }

        return new SecretKeySpec(keyBytes, "AES");
    }

    private boolean isValidAesKeyLength(int keyLengthBytes) {
        return keyLengthBytes == 16 || keyLengthBytes == 24 || keyLengthBytes == 32;
    }
}