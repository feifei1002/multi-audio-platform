package com.multi_audio_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multi_audio_platform.dto.UserProfileDTO;
import com.multi_audio_platform.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(user -> new UserProfileDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth().toString()
            ))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
        }
}
