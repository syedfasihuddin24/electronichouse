package com.electronichouse.service;

import com.electronichouse.config.JwtUtil;
import com.electronichouse.model.User;
import com.electronichouse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private GoogleSheetsService sheetsService;

    public Map<String, String> register(User user) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("status", "error");
            response.put("message", "Email already registered!");
            return response;
        }

        String rawPhone = user.getPhone();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepository.save(user);

        logCustomerToSheet(user.getName(), user.getEmail(), rawPhone);

        String token = jwtUtil.generateToken(user.getEmail());
        response.put("status", "success");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    public Map<String, String> login(String email, String password) {
        Map<String, String> response = new HashMap<>();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            response.put("status", "error");
            response.put("message", "Invalid email or password!");
            return response;
        }

        String token = jwtUtil.generateToken(email);
        response.put("status", "success");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    private void logCustomerToSheet(String name, String email, String phone) {
        try {
            List<Object> row = Arrays.asList(
                name, email, phone == null ? "" : phone,
                LocalDate.now().toString()
            );
            sheetsService.appendRow(
                GoogleSheetsService.TAB_CUSTOMERS + "!A:D", row);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to log customer: " + e.getMessage());
        }
    }
}