# 🏪 Electronic House

A full-stack e-commerce web application for an electronics and home appliances store — built with a React frontend and a Spring Boot backend, backed by MySQL.

> Your one-stop shop for the best electronics and home appliances in town. Trusted since 2005.

---

## ✨ Features

- 🛍️ **Product Catalog** — browse by category (TVs, Refrigerators, Washing Machines, Air Coolers, Kitchen Appliances, Mobile Phones, Laptops)
- 🔍 **Search & Sort** — search by name/brand, sort by price
- ⚖️ **Product Comparison** — compare up to 2 products side by side
- ❤️ **Wishlist** — save products for later, move to cart anytime
- 🛒 **Shopping Cart** — add, update quantity, remove items
- 👤 **User Authentication** — register/login with JWT-based auth
- 🧾 **Checkout & Orders** — place orders, view order history, track order status
- 🖥️ **Admin Panel** — manage products and contacts, view store stats
- 📞 **Contact Form** — customer inquiries saved to the database

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Plain CSS (custom design system with CSS variables)

**Backend**
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- Spring Security + JWT

**Database**
- MySQL 8+ (local instance)

---

## 📁 Project Structure

```
electronic-house/
├── backend/                # Spring Boot API
│   ├── src/main/java/com/electronichouse/
│   │   ├── config/         # Security, JWT config
│   │   ├── controller/     # REST controllers
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Spring Data repositories
│   │   └── service/        # Business logic
│   └── src/main/resources/
│       └── application.properties
└── frontend/                # React (Vite) app
    └── src/
        ├── App.jsx
        ├── AdminPanel.jsx
        ├── Checkout.jsx
        └── index.css
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven
- Node.js + npm
- MySQL 8+ (running locally)

### 1. Database Setup

Start MySQL and create the database:

```sql
CREATE DATABASE electronichouse;
```

Update `backend/src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/electronichouse
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

### 2. Run the Backend

```bash
cd backend
mvn clean spring-boot:run
```

The API will start on **`http://localhost:8080`**.

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **`http://localhost:5173`**.

---

## 🔐 Admin Access

The admin panel is accessed via a hidden trigger — click the footer copyright year (© 2026) **5 times** to unlock it.

---

## 📌 Notes

- This project currently runs on a **local MySQL instance** for development/demo purposes.
- Environment-specific files (`application.properties` values, credentials, `node_modules`, build output) are excluded via `.gitignore` and should never be committed.

---

## 👨‍💻 Author

Built with ❤️ by **Syed Fasihuddin**
