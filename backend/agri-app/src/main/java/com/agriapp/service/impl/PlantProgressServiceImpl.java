package com.agriapp.service.impl;

import com.agriapp.model.PlantProgress;
import com.agriapp.model.PlantingPlan;
import com.agriapp.repository.PlantProgressRepository;
import com.agriapp.repository.PlantingPlanRepository;
import com.agriapp.service.PlantProgressService;
import com.agriapp.service.UserService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class PlantProgressServiceImpl implements PlantProgressService {

    //These are injected via constructor:
    private final PlantProgressRepository plantProgressRepository;
    private final PlantingPlanRepository plantingPlanRepository;
    private final UserService userService;

    public PlantProgressServiceImpl(
            PlantProgressRepository plantProgressRepository,
            PlantingPlanRepository plantingPlanRepository,
            UserService userService) {
        this.plantProgressRepository = plantProgressRepository;
        this.plantingPlanRepository = plantingPlanRepository;
        this.userService = userService;
    }

    @Override
    public PlantProgress createProgress(PlantProgress progress) {
        // Check if the planting plan exists
        Optional<PlantingPlan> plantingPlanOpt = plantingPlanRepository.findById(progress.getPlantingPlanId());
        if (!plantingPlanOpt.isPresent()) {
            throw new RuntimeException("Planting plan not found with ID: " + progress.getPlantingPlanId());
        }
        
        // Initialize start time if not already set
        if (progress.getStartedAt() == null) {
            progress.setStartedAt(LocalDateTime.now());
        }
        
        progress.setLastUpdatedAt(LocalDateTime.now());
        
        // Calculate initial progress percentage based on completed milestones
        updateProgressPercentageInternal(progress, plantingPlanOpt.get());
        
        return plantProgressRepository.save(progress);
    }

    @Override
    public Optional<PlantProgress> getProgressById(String id) {
        System.out.println("Fetching progress by ID: " + id);
        
        Optional<PlantProgress> progress = plantProgressRepository.findById(id);
        
        // Debug the content
        if (progress.isPresent()) {
            PlantProgress p = progress.get();
            System.out.println("Found progress with ID: " + p.getId());
            
            // Ensure completedMilestones is never null
            if (p.getCompletedMilestones() == null) {
                p.setCompletedMilestones(new ArrayList<>());
            }
            
            // Log the milestones for debugging
            System.out.println("Completed milestones count: " + p.getCompletedMilestones().size());
            for (PlantProgress.CompletedMilestone m : p.getCompletedMilestones()) {
                System.out.println("Milestone: " + m.getMilestoneId() + " - Notes: " + m.getNotes());
            }
        } else {
            System.out.println("No progress found with ID: " + id);
        }
        
        return progress;
    }

    @Override
    public List<PlantProgress> getAllProgress() {
        return plantProgressRepository.findAll();
    }

    @Override
    public List<PlantProgress> getProgressByUserId(String userId) {
        return plantProgressRepository.findByUserId(userId);
    }

    @Override
    public List<PlantProgress> getProgressByPlantingPlanId(String plantingPlanId) {
        return plantProgressRepository.findByPlantingPlanId(plantingPlanId);
    }

    @Override
    public Optional<PlantProgress> getProgressByUserAndPlan(String userId, String plantingPlanId) {
        return plantProgressRepository.findByUserIdAndPlantingPlanId(userId, plantingPlanId);
    }

    @Override
    public PlantProgress updateProgress(PlantProgress progress) {
        System.out.println("Updating progress with ID: " + progress.getId());
        
        // Make sure completedMilestones is not null
        if (progress.getCompletedMilestones() == null) {
            progress.setCompletedMilestones(new ArrayList<>());
        }
        
        // Ensure lastUpdatedAt is set
        progress.setLastUpdatedAt(LocalDateTime.now());
        
        System.out.println("Milestones before save: " + progress.getCompletedMilestones());
        PlantProgress savedProgress = plantProgressRepository.save(progress);
        System.out.println("Milestones after save: " + savedProgress.getCompletedMilestones());
        
        // Force a refresh to ensure we have the latest data
        return plantProgressRepository.findById(progress.getId()).orElse(savedProgress);
    }

    @Override
    public void deleteProgress(String id) {
        plantProgressRepository.deleteById(id);
    }

    @Override
    public void completeMilestone(String progressId, PlantProgress.CompletedMilestone completedMilestone) {
        Optional<PlantProgress> progressOpt = plantProgressRepository.findById(progressId);
        if (progressOpt.isPresent()) {
            PlantProgress progress = progressOpt.get();
            
            // Set completion time if not provided
            if (completedMilestone.getCompletedAt() == null) {
                completedMilestone.setCompletedAt(LocalDateTime.now());
            }
            
            // Make sure completedMilestones is not null
            if (progress.getCompletedMilestones() == null) {
                progress.setCompletedMilestones(new ArrayList<>());
            }
            
            // Check if milestone has already been completed
            boolean alreadyCompleted = progress.getCompletedMilestones().stream()
                    .anyMatch(cm -> cm.getMilestoneId().equals(completedMilestone.getMilestoneId()));
            
            if (!alreadyCompleted) {
                System.out.println("Adding milestone: " + completedMilestone.getMilestoneId());
                progress.getCompletedMilestones().add(completedMilestone);
                progress.setLastUpdatedAt(LocalDateTime.now());
                
                // Save with explicit call to updateProgress
                updateProgress(progress);
                
                // Recalculate progress percentage
                updateProgressPercentage(progressId);
            }
        } else {
            throw new RuntimeException("Plant progress not found with ID: " + progressId);
        }
    }

    @Override
    public void updateProgressPercentage(String progressId) {
        Optional<PlantProgress> progressOpt = plantProgressRepository.findById(progressId);
        if (progressOpt.isPresent()) {
            PlantProgress progress = progressOpt.get();
            
            Optional<PlantingPlan> plantingPlanOpt = plantingPlanRepository.findById(progress.getPlantingPlanId());
            if (plantingPlanOpt.isPresent()) {
                PlantingPlan plantingPlan = plantingPlanOpt.get();
                
                updateProgressPercentageInternal(progress, plantingPlan);
                
                // Check for completion and award badges if needed
                checkAndAwardBadges(progress, plantingPlan);
                
                progress.setLastUpdatedAt(LocalDateTime.now());
                plantProgressRepository.save(progress);
            } else {
                throw new RuntimeException("Planting plan not found with ID: " + progress.getPlantingPlanId());
            }
        } else {
            throw new RuntimeException("Plant progress not found with ID: " + progressId);
        }
    }

    @Override
    public void awardBadge(String progressId, String badge) {
        Optional<PlantProgress> progressOpt = plantProgressRepository.findById(progressId);
        if (progressOpt.isPresent()) {
            PlantProgress progress = progressOpt.get();
            
            // Add badge if not already present
            if (!progress.getAwardedBadges().contains(badge)) {
                progress.getAwardedBadges().add(badge);
                
                progress.setLastUpdatedAt(LocalDateTime.now());
                plantProgressRepository.save(progress);
            }
        } else {
            throw new RuntimeException("Plant progress not found with ID: " + progressId);
        }
    }
    
    @Override
    public void likeProgress(String progressId) {
        Optional<PlantProgress> progressOpt = plantProgressRepository.findById(progressId);
        if (progressOpt.isPresent()) {
            PlantProgress progress = progressOpt.get();
            progress.setLikes(progress.getLikes() + 1);
            plantProgressRepository.save(progress);
        } else {
            throw new RuntimeException("Plant progress not found with ID: " + progressId);
        }
    }
    
    @Override
    public List<PlantProgress> getRecentProgressByUser(String userId) {
        return plantProgressRepository.findByUserIdOrderByLastUpdatedAtDesc(userId);
    }
    
    // Helper method to calculate progress percentage
    private void updateProgressPercentageInternal(PlantProgress progress, PlantingPlan plantingPlan) {
        if (plantingPlan.getMilestones() == null || plantingPlan.getMilestones().isEmpty()) {
            progress.setProgressPercentage(0);
            return;
        }
        
        int totalMilestones = plantingPlan.getMilestones().size();
        int completedMilestones = progress.getCompletedMilestones().size();
        
        double percentage = ((double) completedMilestones / totalMilestones) * 100;
        progress.setProgressPercentage(percentage);
    }
    
    // Helper method to check completion and award badges
    private void checkAndAwardBadges(PlantProgress progress, PlantingPlan plantingPlan) {
        if (progress.getAwardedBadges() == null) {
            progress.setAwardedBadges(new ArrayList<>());
        }
        
        // Award badge for 100% completion
        if (progress.getProgressPercentage() >= 100 && 
                !progress.getAwardedBadges().contains("COMPLETION_MASTER")) {
            awardBadge(progress.getId(), "COMPLETION_MASTER");
        }
        
        // Award badge for 50% completion
        if (progress.getProgressPercentage() >= 50 && 
                !progress.getAwardedBadges().contains("HALFWAY_HERO")) {
            awardBadge(progress.getId(), "HALFWAY_HERO");
        }
        
        // If the plant was coffee, award coffee specific badge on completion
        if (progress.getProgressPercentage() >= 100 && 
                plantingPlan.getTags() != null && 
                plantingPlan.getTags().contains("coffee") && 
                !progress.getAwardedBadges().contains("COFFEE_GROWER")) {
            awardBadge(progress.getId(), "COFFEE_GROWER");
        }
    }
}