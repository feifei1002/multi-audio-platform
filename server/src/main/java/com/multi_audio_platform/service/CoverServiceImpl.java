package com.multi_audio_platform.service;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.multi_audio_platform.model.Cover;
import com.multi_audio_platform.repository.CoverRepository;


@Service
public class CoverServiceImpl implements CoverService {

    private final CoverRepository coverRepository;

    public CoverServiceImpl(CoverRepository coverRepository) {
        this.coverRepository = coverRepository;
    }

    @Override
    public Cover findByFilename(String filename) {
        return coverRepository.findByFilename(filename);
    }

    @Override
    public Cover saveCover(MultipartFile file) throws Exception {
        if (coverRepository.existsByFilename(file.getOriginalFilename())) {
            return Cover.builder().filename(file.getOriginalFilename()).build();
        }
        return Cover.builder()
            .filename(file.getOriginalFilename())
            .data(file.getBytes())
            .build();
    }

}
