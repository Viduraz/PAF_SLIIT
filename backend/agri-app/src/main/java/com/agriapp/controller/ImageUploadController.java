package com.agriapp.controller;

import com.agriapp.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    @Autowired
    public ImageUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map> uploadImage(@RequestParam("file") MultipartFile file) {
        Map uploadResult = cloudinaryService.uploadImage(file);
        return new ResponseEntity<>(uploadResult, HttpStatus.OK);
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<Map> deleteImage(@PathVariable String publicId) {
        Map result = cloudinaryService.deleteImage(publicId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}