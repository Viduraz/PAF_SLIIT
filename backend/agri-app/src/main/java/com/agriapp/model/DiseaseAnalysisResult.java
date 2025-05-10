package com.agriapp.model;

import java.util.List;

public class DiseaseAnalysisResult {
    private String disease;
    private double confidence;
    private String description;
    private List<String> treatment;
    private List<String> preventiveMeasures;

    public DiseaseAnalysisResult() {
    }

    public DiseaseAnalysisResult(String disease, double confidence, String description, 
                                List<String> treatment, List<String> preventiveMeasures) {
        this.disease = disease;
        this.confidence = confidence;
        this.description = description;
        this.treatment = treatment;
        this.preventiveMeasures = preventiveMeasures;
    }

    // Getters and setters
    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTreatment() {
        return treatment;
    }

    public void setTreatment(List<String> treatment) {
        this.treatment = treatment;
    }

    public List<String> getPreventiveMeasures() {
        return preventiveMeasures;
    }

    public void setPreventiveMeasures(List<String> preventiveMeasures) {
        this.preventiveMeasures = preventiveMeasures;
    }
}