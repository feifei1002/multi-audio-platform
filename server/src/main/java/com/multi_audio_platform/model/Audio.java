package com.multi_audio_platform.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Audio {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AudioType type;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String author;

    private String description;

    @OneToOne
    @JoinColumn(name = "cover_id")
    private Cover cover;
}
