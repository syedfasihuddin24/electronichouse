package com.electronichouse.controller;

import com.electronichouse.model.Contact;
import com.electronichouse.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:5173")
public class ContactController {

    @Autowired
    private ContactService contactService;

    // POST contact form submission
    @PostMapping
    public Map<String, String> submitContact(@RequestBody Contact contact) {
        contactService.saveContact(contact);
        return Map.of(
            "status", "success",
            "message", "Thank you! We will contact you soon."
        );
    }
}