package com.agriapp.service;

import org.springframework.web.multipart.MultipartFile;

import com.agriapp.model.DiseaseAnalysisResult;

public interface CropDiseaseService {
    DiseaseAnalysisResult analyzeImage(MultipartFile image) throws Exception;
}