package com.agriapp.controller;

import com.agriapp.model.DiseaseAnalysisResult;
import com.agriapp.service.CropDiseaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/crop-disease")
@CrossOrigin(origins = "*")
public class CropDiseaseController {

    private final CropDiseaseService cropDiseaseService;

    @Autowired
    public CropDiseaseController(CropDiseaseService cropDiseaseService) {
        this.cropDiseaseService = cropDiseaseService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<DiseaseAnalysisResult> analyzeImage(@RequestParam("image") MultipartFile image) {
        try {
            DiseaseAnalysisResult result = cropDiseaseService.analyzeImage(image);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}