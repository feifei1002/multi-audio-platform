package com.multi_audio_platform.dto;

import com.multi_audio_platform.model.CardType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavigationUpdateDTO {
    private Long userId;
    private CardType cardIdentifier;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public CardType getCardIdentifier() { return cardIdentifier; }
    public void setCardIdentifier(CardType cardIdentifier) { this.cardIdentifier = cardIdentifier; }
    
}
