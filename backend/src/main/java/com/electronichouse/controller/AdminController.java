package com.electronichouse.controller;

import com.electronichouse.model.Contact;
import com.electronichouse.model.Product;
import com.electronichouse.repository.ContactRepository;
import com.electronichouse.repository.ProductRepository;
import com.electronichouse.repository.UserRepository;
import com.electronichouse.service.GoogleSheetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired private ProductRepository productRepository;
    @Autowired private ContactRepository contactRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GoogleSheetsService sheetsService;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
            "totalProducts", productRepository.count(),
            "totalContacts", contactRepository.count(),
            "totalUsers", userRepository.count()
        );
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() { return productRepository.findAll(); }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        syncProductToSheet(saved, true);
        return saved;
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        Product saved = productRepository.save(product);
        syncProductToSheet(saved, false);
        return saved;
    }

    @DeleteMapping("/products/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return Map.of("status", "success", "message", "Product deleted!");
    }

    @GetMapping("/contacts")
    public List<Contact> getAllContacts() { return contactRepository.findAll(); }

    @DeleteMapping("/contacts/{id}")
    public Map<String, String> deleteContact(@PathVariable Long id) {
        contactRepository.deleteById(id);
        return Map.of("status", "success", "message", "Contact deleted!");
    }

    private void syncProductToSheet(Product product, boolean isNew) {
        try {
            List<Object> row = Arrays.asList(
                product.getId(), product.getName(), product.getCategory(),
                product.getPrice(), product.getImage(), product.getInStock(),
                product.getBrand(), product.getDescription()
            );
            String tab = GoogleSheetsService.TAB_PRODUCTS;
            if (isNew) {
                sheetsService.appendRow(tab + "!A:H", row);
            } else {
                int rowIndex = sheetsService.findRowIndexById(tab, product.getId());
                if (rowIndex > 0) {
                    sheetsService.updateRow(tab + "!A" + rowIndex + ":H" + rowIndex, row);
                } else {
                    sheetsService.appendRow(tab + "!A:H", row);
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Sheet sync failed: " + e.getMessage());
        }
    }
}