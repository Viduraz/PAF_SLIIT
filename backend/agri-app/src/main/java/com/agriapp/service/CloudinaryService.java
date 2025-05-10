package com.agriapp.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface CloudinaryService {
    Map uploadImage(MultipartFile file);
    Map deleteImage(String publicId);
}