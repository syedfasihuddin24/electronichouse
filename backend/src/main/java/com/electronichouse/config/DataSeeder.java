package com.electronichouse.config;

import com.electronichouse.model.Product;
import com.electronichouse.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        productRepository.saveAll(List.of(
            new Product(null, "Samsung 55\" 4K Smart TV", "Televisions", 45999.0,
                "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
                true, "Samsung", "55 inch 4K UHD Smart TV with HDR support"),

            new Product(null, "LG 43\" Full HD TV", "Televisions", 28999.0,
                "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=400",
                true, "LG", "43 inch Full HD LED TV with WebOS"),

            new Product(null, "Whirlpool 265L Refrigerator", "Refrigerators", 32999.0,
                "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
                true, "Whirlpool", "265L Double Door Refrigerator with Frost Free technology"),

            new Product(null, "Samsung 253L Double Door Fridge", "Refrigerators", 27999.0,
                "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400",
                false, "Samsung", "253L frost free double door refrigerator"),

            new Product(null, "LG 7kg Front Load Washing Machine", "Washing Machines", 38999.0,
                "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400",
                true, "LG", "7kg fully automatic front load with steam wash"),

            new Product(null, "Whirlpool 6.5kg Top Load Washer", "Washing Machines", 22999.0,
                "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400",
                true, "Whirlpool", "6.5kg fully automatic top load washing machine"),

            new Product(null, "Symphony 45L Air Cooler", "Air Coolers", 8999.0,
                "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
                true, "Symphony", "45 litre desert air cooler with remote control"),

            new Product(null, "Bajaj 20L Personal Air Cooler", "Air Coolers", 5499.0,
                "https://images.unsplash.com/photo-1563991655280-cb95c90ca2fb?w=400",
                false, "Bajaj", "20 litre personal air cooler ideal for small rooms"),

            new Product(null, "Philips Air Fryer HD9200", "Kitchen Appliances", 6999.0,
                "https://images.unsplash.com/photo-1648476475318-96bf09bd3936?w=400",
                true, "Philips", "4.1L digital air fryer with rapid air technology"),

            new Product(null, "Prestige Induction Cooktop", "Kitchen Appliances", 3499.0,
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
                true, "Prestige", "2000W induction cooktop with 8 preset menus")
        ));

        System.out.println("✅ Sample products loaded into database!");
    }
}