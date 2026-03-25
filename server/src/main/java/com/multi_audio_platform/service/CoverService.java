package com.multi_audio_platform.service;



import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Cover;

public interface CoverService {
    Cover findByFilename(String filename);
    Cover saveCover(MultipartFile file) throws Exception;
    
}
