package com.agriapp.service.impl;

import com.agriapp.model.User;
import com.agriapp.repository.UserRepository;
import com.agriapp.service.UserService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Base64;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    
    }

    @Override
    public User createUser(User user) {
        // In a real application, you would hash the password before storing it
        // user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(User user) {
        // Check if user exists before updating
        if (!userRepository.existsById(user.getId())) {
            throw new RuntimeException("User not found with ID: " + user.getId());
        }
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void addBadge(String userId, String badge) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.getBadges().contains(badge)) {
                user.getBadges().add(badge);
                userRepository.save(user);
            }
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    @Override
    public void followUser(String userId, String followedUserId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.getFollowingUsers().contains(followedUserId)) {
                user.getFollowingUsers().add(followedUserId);
                userRepository.save(user);
            }
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    @Override
    public void unfollowUser(String userId, String unfollowedUserId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.getFollowingUsers().remove(unfollowedUserId);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    @Override
    public String generateToken(User user) {
        // In a real application, you would use a JWT library like jjwt
        // This is a simplified version for demonstration
        
        // Create a payload with user ID and username
        String payload = user.getId() + ":" + user.getUsername() + ":" + System.currentTimeMillis();
        
        // For production, use a secure encoding with signatures
        return Base64.getEncoder().encodeToString(payload.getBytes());
    }

    @Override
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        // For basic authentication, compare passwords directly
        // In a production app, you would use BCrypt: return bCryptPasswordEncoder.matches(rawPassword, encodedPassword);
        return rawPassword.equals(encodedPassword);
    }
}