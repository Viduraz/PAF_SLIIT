package com.agriapp.service.impl;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.agriapp.model.DiseaseAnalysisResult;
import com.agriapp.service.CloudinaryService;
import com.agriapp.service.CropDiseaseService;

@Service
public class CropDiseaseServiceImpl implements CropDiseaseService {

    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Value("${plant.disease.api.url:https://your-plant-disease-api-url.com}")
    private String plantDiseaseApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Disease database for demo (in production, this would come from an API or database)
    private final Map<String, DiseaseAnalysisResult> diseaseDatabase = initDiseaseDatabase();

    @Override
    public DiseaseAnalysisResult analyzeImage(MultipartFile image) throws Exception {
        // Upload image to Cloudinary to get a URL
        Map uploadResult = cloudinaryService.uploadImage(image);
        String imageUrl = (String) uploadResult.get("secure_url");
        
        // In a real implementation, send the image or URL to the AI service
        // For demo purposes, we'll return a mock result
        return getMockResult();
        
        /* Uncomment for actual API integration
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", image.getResource());
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        DiseaseAnalysisResult response = restTemplate.postForObject(
            plantDiseaseApiUrl,
            requestEntity,
            DiseaseAnalysisResult.class
        );
        
        return response;
        */
    }
    
    // Mock result for demo purposes
    private DiseaseAnalysisResult getMockResult() {
        // In a real implementation, this would come from the AI service
        // For now, return a random disease from our mock database
        String[] diseases = diseaseDatabase.keySet().toArray(new String[0]);
        String randomDisease = diseases[(int) (Math.random() * diseases.length)];
        
        return diseaseDatabase.get(randomDisease);
    }
    
    // Initialize a mock disease database
    private Map<String, DiseaseAnalysisResult> initDiseaseDatabase() {
        Map<String, DiseaseAnalysisResult> database = new HashMap<>();
        
        // Late Blight
        database.put("late_blight", new DiseaseAnalysisResult(
            "Late Blight",
            0.92,
            "Late blight is a plant disease caused by the fungus-like oomycete pathogen Phytophthora infestans. It primarily affects plants in the Solanaceae family, including tomatoes and potatoes.",
            Arrays.asList(
                "Remove and destroy all infected plant parts",
                "Apply fungicide containing chlorothalonil or copper compounds",
                "Ensure adequate spacing between plants for air circulation",
                "Water at the base of plants to keep foliage dry"
            ),
            Arrays.asList(
                "Use resistant varieties when available",
                "Apply preventive fungicides during humid conditions",
                "Practice crop rotation",
                "Remove plant debris at the end of the season"
            )
        ));
        
        // Powdery Mildew
        database.put("powdery_mildew", new DiseaseAnalysisResult(
            "Powdery Mildew",
            0.85,
            "Powdery mildew is a fungal disease that affects a wide range of plants. It appears as white powdery spots on leaves and stems.",
            Arrays.asList(
                "Apply fungicide specifically designed for powdery mildew",
                "Remove and destroy heavily infected leaves",
                "Increase air circulation around plants",
                "Apply neem oil or potassium bicarbonate solutions as organic alternatives"
            ),
            Arrays.asList(
                "Plant resistant varieties",
                "Avoid overhead watering",
                "Space plants properly for good air circulation",
                "Keep the growing area clean and free of plant debris"
            )
        ));
        
        // Add more diseases as needed
        // Leaf Spot
        database.put("leaf_spot", new DiseaseAnalysisResult(
            "Bacterial Leaf Spot",
            0.88,
            "Bacterial leaf spot is a common disease that affects plants like peppers, tomatoes, and leafy vegetables. It appears as dark, water-soaked spots on leaves.",
            Arrays.asList(
                "Remove infected leaves and plants",
                "Apply copper-based bactericide",
                "Avoid overhead watering",
                "Provide adequate spacing between plants"
            ),
            Arrays.asList(
                "Use disease-free seeds and transplants",
                "Rotate crops every 2-3 years",
                "Keep the garden free from debris",
                "Disinfect garden tools regularly"
            )
        ));
        
        return database;
    }
}