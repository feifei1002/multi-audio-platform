package com.multi_audio_platform.controller;

import com.multi_audio_platform.dto.OtpRequest;
import com.multi_audio_platform.dto.OtpVerifyRequest;
import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
import com.multi_audio_platform.dto.SignInResponse;
import com.multi_audio_platform.service.OtpService;
import com.multi_audio_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;

    // ─── Register ─────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        RegisterResponse response = userService.register(request);
        int status = response.isSuccess() ? 201 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // ─── Sign Up OTP ──────────────────────────────────────────────────────────

    @PostMapping("/verify-signup-otp")
    public ResponseEntity<RegisterResponse> verifySignUpOtp(@RequestBody OtpVerifyRequest request) {
        RegisterResponse response = otpService.verifySignUpOtp(request.getEmail(), request.getOtp());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/resend-signup-otp")
    public ResponseEntity<RegisterResponse> resendSignUpOtp(@RequestBody OtpRequest request) {
        RegisterResponse response = otpService.sendSignUpOtp(request.getEmail());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // ─── Sign In OTP ──────────────────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<RegisterResponse> sendSignInOtp(@RequestBody OtpRequest request) {
        RegisterResponse response = otpService.sendSignInOtp(request.getEmail());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<SignInResponse> verifySignInOtp(@RequestBody OtpVerifyRequest request) {
        SignInResponse response = otpService.verifySignInOtp(request.getEmail(), request.getOtp());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }
}