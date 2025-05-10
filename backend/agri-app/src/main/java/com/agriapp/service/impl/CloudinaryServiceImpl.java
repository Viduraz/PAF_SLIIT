package com.agriapp.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.agriapp.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public Map uploadImage(MultipartFile file) {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "auto");
            options.put("folder", "agri_app"); // Optional - creates a folder in your Cloudinary account
            
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return uploadResult;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public Map deleteImage(String publicId) {
        try {
            return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }
}