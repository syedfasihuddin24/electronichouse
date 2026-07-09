package com.electronichouse.controller;

import com.electronichouse.service.GoogleSheetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private GoogleSheetsService sheetsService;

    // ─── LOG A NEW ORDER TO GOOGLE SHEET ─────────────────
    @PostMapping
    public Map<String, String> logOrder(@RequestBody Map<String, Object> order) {
        try {
            List<Object> row = Arrays.asList(
                order.getOrDefault("orderId", ""),
                order.getOrDefault("customerName", ""),
                order.getOrDefault("phone", ""),
                order.getOrDefault("address", ""),
                order.getOrDefault("items", ""),
                order.getOrDefault("totalAmount", 0),
                order.getOrDefault("paymentMethod", ""),
                order.getOrDefault("status", "Placed"),
                order.getOrDefault("date", "")
            );
            sheetsService.appendRow(
                GoogleSheetsService.TAB_ORDERS + "!A:I", row);
            return Map.of("status", "success", "message", "Order logged to Google Sheet!");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}