package com.multi_audio_platform.controller;

import com.multi_audio_platform.dto.OtpRequest;
import com.multi_audio_platform.dto.OtpVerifyRequest;
import com.multi_audio_platform.dto.RegisterRequest;
import com.multi_audio_platform.dto.RegisterResponse;
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

    // ─── Email Verification ───────────────────────────────────────────────────

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        RegisterResponse response = userService.verifyEmail(token);
        if (response.isSuccess()) {
            // Return a simple HTML page so clicking the link shows a nice message
            String html = """
                <html>
                  <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb;">
                    <div style="text-align:center;padding:40px;border-radius:16px;background:white;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      <h1 style="font-size:32px; color:#38A169;">&#10003;</h1>
                      <h2 style="font-weight:700;margin-bottom:8px;">Account Activated!</h2>
                      <p style="color:#666;">Your MultiAudio Player account is now active.<br>You can close this tab and sign in.</p>
                    </div>
                  </body>
                </html>
            """;
            return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
        } else {
            String html = """
                <html>
                  <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb;">
                    <div style="text-align:center;padding:40px;border-radius:16px;background:white;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      <h1 style="font-size:32px; color:#E53E3E;">&#10007;</h1>
                      <h2 style="font-weight:700;margin-bottom:8px;">Invalid Link</h2>
                      <p style="color:#666;">%s</p>
                    </div>
                  </body>
                </html>
            """.formatted(response.getMessage());
            return ResponseEntity.badRequest().header("Content-Type", "text/html").body(html);
        }
    }

    // ─── OTP ──────────────────────────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<RegisterResponse> sendOtp(@RequestBody OtpRequest request) {
        RegisterResponse response = otpService.sendOtp(request.getEmail());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<RegisterResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        RegisterResponse response = otpService.verifyOtp(request.getEmail(), request.getOtp());
        int status = response.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(response);
    }
}