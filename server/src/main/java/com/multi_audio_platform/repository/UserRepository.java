package com.multi_audio_platform.repository;

import com.multi_audio_platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.verified = false AND u.createdAt < :cutoff")
    void deleteUnverifiedUsersOlderThan(@Param("cutoff") LocalDateTime cutoff);
}