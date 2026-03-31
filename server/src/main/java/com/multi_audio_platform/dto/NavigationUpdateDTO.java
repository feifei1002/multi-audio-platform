package com.multi_audio_platform.dto;

public class NavigationUpdateDTO {
    private Long userId;
    private String cardIdentifier;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCardIdentifier() { return cardIdentifier; }
    public void setCardIdentifier(String cardIdentifier) { this.cardIdentifier = cardIdentifier; }
    
}
