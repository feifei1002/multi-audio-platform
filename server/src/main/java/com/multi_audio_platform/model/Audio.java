package com.multi_audio_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "audios")
public class Audio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    String name;
    String author;
}
