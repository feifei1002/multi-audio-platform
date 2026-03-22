package com.multi_audio_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table(name = "covers")
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cover {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String filename;

    @Lob
    private byte[] data;
    
}
