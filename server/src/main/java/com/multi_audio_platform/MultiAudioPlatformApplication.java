package com.multi_audio_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MultiAudioPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(MultiAudioPlatformApplication.class, args);
    }
}