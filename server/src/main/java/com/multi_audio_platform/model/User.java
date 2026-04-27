package com.multi_audio_platform.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Encrypted PII fields — stored as Base64 AES-256 ciphertext
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    // Stored as String to hold encrypted value (was LocalDate, now encrypted text)
    @Column(name = "date_of_birth", nullable = false)
    private String dateOfBirth;

    // SHA-256 hash of email — used for fast lookups, cannot be reversed
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    // AES-256 encrypted email — used to display actual email back to user
    @Column(name = "email_encrypted")
    private String emailEncrypted;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "linked")
    @Builder.Default
    private Boolean linked = false;

    @Column(name = "otp_attempts")
    @Builder.Default
    private Integer otpAttempts = 0;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private NavigationState navigationState;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}