package com.agriapp.controller;

import com.agriapp.model.User;
import com.agriapp.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Date;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow requests from any origin for development
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Handle specific exceptions with appropriate HTTP status codes
            if (e.getMessage().contains("not found")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
            } else if (e.getMessage().contains("already taken") || e.getMessage().contains("already in use")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error updating user: " + e.getMessage());
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User successfully deleted");
            response.put("userId", id);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error deleting user: " + e.getMessage());
            }
        }
    }

    @PutMapping("/{id}/badges/{badge}")
    public ResponseEntity<Void> addBadge(@PathVariable String id, @PathVariable String badge) {
        userService.addBadge(id, badge);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}/follow/{followedId}")
    public ResponseEntity<Void> followUser(@PathVariable String id, @PathVariable String followedId) {
        userService.followUser(id, followedId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}/unfollow/{unfollowedId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable String id, @PathVariable String unfollowedId) {
        userService.unfollowUser(id, unfollowedId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // Validate credentials
        Optional<User> userOptional = userService.getUserByUsername(username);
        if (userOptional.isEmpty() || !userService.validatePassword(password, userOptional.get().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = userOptional.get();

        // Generate JWT token
        String token = userService.generateToken(user);

        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("token", token);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
        // Check if username or email already exists
        if (userService.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        if (userService.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        // Set default properties for new user
        user.setCreatedAt(new Date());
        user.setRole("user"); // Default role

        // Create the user (service should handle password hashing)
        User createdUser = userService.createUser(user);

        // Generate JWT token
        String token = userService.generateToken(createdUser);

        // Create response with user and token
        Map<String, Object> response = new HashMap<>();
        response.put("user", createdUser);
        response.put("token", token);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        User user = userService.getUserFromToken(token);
       

        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/login/google")
    public ResponseEntity<Map<String, Object>> loginWithGoogle(@RequestBody Map<String, String> googleData) {
        String email = googleData.get("email");
        String displayName = googleData.get("displayName");
        String uid = googleData.get("uid");

        // Check if user exists
        Optional<User> userOptional = userService.getUserByEmail(email);
        User user;

        if (userOptional.isEmpty()) {
            // Create a new user if they don't exist
            user = new User();
            user.setEmail(email);
            user.setUsername(displayName);
            // Generate a secure random password
            String randomPassword = UUID.randomUUID().toString();
            user.setPassword(randomPassword);
            user.setCreatedAt(new Date());
            user.setRole("user");
            
            // You might want to store the Google UID as well
            // Create a field in your User entity for this
            
            user = userService.createUser(user);
        } else {
            user = userOptional.get();
        }

        // Generate token
        String token = userService.generateToken(user);

        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("token", token);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}