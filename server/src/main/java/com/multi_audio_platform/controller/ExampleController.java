package com.multi_audio_platform.controller;

import java.util.Collections;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExampleController {
    @GetMapping("/")
    public Map<String, String> ping() {
        return Collections.singletonMap("status", "Backend is reachable!");
    }
    
}
