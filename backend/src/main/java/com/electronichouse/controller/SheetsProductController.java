package com.electronichouse.controller;

import com.electronichouse.service.GoogleSheetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sheets")
@CrossOrigin(origins = "http://localhost:5173")
public class SheetsProductController {

    @Autowired
    private GoogleSheetsService sheetsService;

    @GetMapping("/products")
    public List<Map<String, Object>> getProducts() {
        try {
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            List<List<Object>> rows = sheetsService.readSheet(tab + "!A2:H");
            List<Map<String, Object>> products = new ArrayList<>();
            if (rows == null || rows.isEmpty()) return products;
            for (int i = 0; i < rows.size(); i++) {
                List<Object> row = rows.get(i);
                if (row.isEmpty() || row.get(0).toString().isBlank()) continue;
                Map<String, Object> product = new LinkedHashMap<>();
                product.put("id", getValue(row, 0));
                product.put("name", getValue(row, 1));
                product.put("category", getValue(row, 2));
                product.put("price", parseDouble(getValue(row, 3)));
                product.put("image", getValue(row, 4));
                product.put("inStock", getValue(row, 5).equalsIgnoreCase("true"));
                product.put("brand", getValue(row, 6));
                product.put("description", getValue(row, 7));
                product.put("rowIndex", i + 2);
                products.add(product);
            }
            return products;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @PostMapping("/products")
    public Map<String, String> addProduct(@RequestBody Map<String, Object> product) {
        try {
            String id = "P" + System.currentTimeMillis();
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            List<Object> row = Arrays.asList(
                id, product.getOrDefault("name", ""),
                product.getOrDefault("category", ""),
                product.getOrDefault("price", 0),
                product.getOrDefault("image", ""),
                product.getOrDefault("inStock", true),
                product.getOrDefault("brand", ""),
                product.getOrDefault("description", "")
            );
            sheetsService.appendRow(tab + "!A:H", row);
            return Map.of("status", "success", "message", "Product added!", "id", id);
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @PutMapping("/products/{rowIndex}")
    public Map<String, String> updateProduct(@PathVariable int rowIndex, @RequestBody Map<String, Object> product) {
        try {
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            String range = tab + "!A" + rowIndex + ":H" + rowIndex;
            List<Object> row = Arrays.asList(
                product.getOrDefault("id", ""),
                product.getOrDefault("name", ""),
                product.getOrDefault("category", ""),
                product.getOrDefault("price", 0),
                product.getOrDefault("image", ""),
                product.getOrDefault("inStock", true),
                product.getOrDefault("brand", ""),
                product.getOrDefault("description", "")
            );
            sheetsService.updateRow(range, row);
            return Map.of("status", "success", "message", "Product updated!");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @DeleteMapping("/products/{rowIndex}")
    public Map<String, String> deleteProduct(@PathVariable int rowIndex) {
        try {
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            sheetsService.deleteRow(tab + "!A" + rowIndex + ":H" + rowIndex);
            return Map.of("status", "success", "message", "Product deleted!");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @PostMapping("/sync")
    public Map<String, String> syncToSheet(@RequestBody List<Map<String, Object>> products) {
        try {
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            for (Map<String, Object> product : products) {
                List<Object> row = Arrays.asList(
                    product.getOrDefault("id", ""),
                    product.getOrDefault("name", ""),
                    product.getOrDefault("category", ""),
                    product.getOrDefault("price", 0),
                    product.getOrDefault("image", ""),
                    product.getOrDefault("inStock", true),
                    product.getOrDefault("brand", ""),
                    product.getOrDefault("description", "")
                );
                sheetsService.appendRow(tab + "!A:H", row);
            }
            return Map.of("status", "success", "message", "Synced!");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    private String getValue(List<Object> row, int index) {
        if (index < row.size() && row.get(index) != null)
            return row.get(index).toString().trim();
        return "";
    }

    private double parseDouble(String value) {
        try { return Double.parseDouble(value); }
        catch (Exception e) { return 0.0; }
    }
}