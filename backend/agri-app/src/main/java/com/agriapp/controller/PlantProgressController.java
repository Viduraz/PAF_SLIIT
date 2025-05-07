package com.agriapp.controller;

import com.agriapp.model.PlantProgress;
import com.agriapp.service.PlantProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class PlantProgressController {

    private final PlantProgressService plantProgressService;

    public PlantProgressController(PlantProgressService plantProgressService) {
        this.plantProgressService = plantProgressService;
    }

    @PostMapping
    public ResponseEntity<PlantProgress> createProgress(@RequestBody PlantProgress progress) {
        try {
            PlantProgress createdProgress = plantProgressService.createProgress(progress);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProgress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlantProgress> getProgressById(@PathVariable("id") String id) {
        Optional<PlantProgress> progress = plantProgressService.getProgressById(id);
        if (progress.isPresent()) {
            return ResponseEntity.ok(progress.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<PlantProgress>> getAllProgress() {
        return new ResponseEntity<>(plantProgressService.getAllProgress(), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<PlantProgress>> getProgressByUserId(@PathVariable String userId) {
        return new ResponseEntity<>(plantProgressService.getProgressByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/plans/{planId}")
    public ResponseEntity<List<PlantProgress>> getProgressByPlantingPlanId(@PathVariable String planId) {
        return new ResponseEntity<>(plantProgressService.getProgressByPlantingPlanId(planId), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/plans/{planId}")
    public ResponseEntity<PlantProgress> getProgressByUserAndPlan(@PathVariable String userId, @PathVariable String planId) {
        return plantProgressService.getProgressByUserAndPlan(userId, planId)
                .map(progress -> new ResponseEntity<>(progress, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlantProgress> updateProgress(@PathVariable String id, @RequestBody PlantProgress progress) {
        progress.setId(id);
        return new ResponseEntity<>(plantProgressService.updateProgress(progress), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable String id) {
        plantProgressService.deleteProgress(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<?> completeMilestone(@PathVariable String id, @RequestBody PlantProgress.CompletedMilestone milestone) {
        try {
            // Print debug information
            System.out.println("Received milestone: " + milestone.getMilestoneId() + ", Date: " + milestone.getCompletedAt());
            
            // If completedAt is null, set it to current time
            if (milestone.getCompletedAt() == null) {
                milestone.setCompletedAt(LocalDateTime.now());
            }
            
            plantProgressService.completeMilestone(id, milestone);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "error", e.getMessage(),
                    "milestone", milestone.getMilestoneId(),
                    "progress", id
                ));
        }
    }

    @PutMapping("/{id}/percentage")
    public ResponseEntity<Void> updateProgressPercentage(@PathVariable String id) {
        plantProgressService.updateProgressPercentage(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}/badges/{badge}")
    public ResponseEntity<Void> awardBadge(@PathVariable String id, @PathVariable String badge) {
        plantProgressService.awardBadge(id, badge);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Void> likeProgress(@PathVariable String id) {
        plantProgressService.likeProgress(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<List<PlantProgress>> getRecentProgressByUser(@PathVariable String userId) {
        return new ResponseEntity<>(plantProgressService.getRecentProgressByUser(userId), HttpStatus.OK);
    }
}