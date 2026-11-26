# 🏨 Heaven Homes — Premium Luxury Hotel Booking Platform

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-brightgreen?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?style=flat-square&logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-blue?style=flat-square)

> **Heaven Homes** is a modern, full-stack luxury hotel discovery and booking platform. Built with Java 21, Spring Boot 3.2.5, React 18 (Vite), PostgreSQL, and Razorpay Payment Integration.

---

## 🏗️ System Architecture — Modular Monolith

This project follows **Modular Monolith** architecture — the backend is organized into well-defined domain modules, each owning its entities, repositories, services, and controllers. All modules are deployed as a single Spring Boot application.

```
com.HeavenHomes.Heaven_Homes
│
├── 👤 user/           → User registration, profile, role management
├── 🔐 auth/           → JWT authentication, Spring Security, filters
├── 🏨 hotel/          → Hotel CRUD, image upload, search & browse
├── 🛏️  room/           → Room types, pricing, management
├── 📦 inventory/      → Room inventory & availability tracking
├── 💲 pricing/        → Dynamic pricing engine (strategy pattern)
├── 📅 booking/        → Booking lifecycle + Razorpay payment checkout
├── ⭐ review/          → Guest reviews & ratings
├── 👑 admin/          → Admin dashboard, analytics, hotel management
├── 🧑 guest/          → Guest profile management
│
└── 🔧 common/         → Shared: DTOs, Configs, Enums, Exceptions, Utils
```

```
┌─────────────────────────────────────┐
│     React 18 + Vite  (Port 3000)    │
└──────────────────┬──────────────────┘
                   │ REST API
┌──────────────────▼──────────────────┐
│  Spring Boot — Modular Monolith     │
│            (Port 8080)              │
│                                     │
│  admin | auth | booking | hotel     │
│  inventory | pricing | review       │
│  room | user | guest | common       │
└──────────────────┬──────────────────┘
                   │ JPA/Hibernate
┌──────────────────▼──────────────────┐
│     PostgreSQL Database (5432)      │
└─────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control: `GUEST`, `HOTEL_MANAGER`, `SUPER_ADMIN`
- Secure password encoding with BCrypt
- Spring Security filter chain

### 🏨 Hotel Management
- Full hotel CRUD with image upload
- Hotel contact info & amenities
- Real-time minimum price tracking
- Search & browse with filters (city, dates, guests, price range)

### 📦 Smart Inventory System
- Room-level inventory tracking per date
- Automatic availability update on booking/cancellation
- Overbooking prevention

### 💲 Dynamic Pricing Engine
- **Strategy & Decorator Pattern** implementation (`PricingStrategy`)
- Dynamic pricing layers: Base Price, Surge Pricing, Occupancy-based, Urgency (Last-minute), and Public Holiday surcharges
- Real-time public holiday detection via external API (`HolidayService`)

### 💳 Payment Integration
- **Razorpay** payment gateway
- Order creation → payment capture → webhook verification
- Booking status auto-update on payment success

### ⭐ Review System
- Guests can review after completed stay
- Rating aggregation per hotel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.2.5 |
| **Security** | Spring Security + JWT (jjwt 0.12.6) |
| **ORM** | Spring Data JPA + Hibernate 6.4 |
| **Database** | PostgreSQL 16 |
| **Payment** | Razorpay Java SDK |
| **Validation** | Jakarta Validation + Hibernate Validator |
| **Mapping** | ModelMapper 3.2.2 |
| **Docs** | SpringDoc OpenAPI (Swagger UI) |
| **Build** | Maven |
| **Frontend** | React 18 + Vite 5.4 |

---

## 📁 Project Structure

```
Heaven-Homes/
├── src/
│   ├── main/
│   │   ├── java/com/HeavenHomes/Heaven_Homes/
│   │   │   ├── admin/
│   │   │   │   ├── controller/AdminController.java
│   │   │   │   └── service/AdminService.java + AdminServiceImpl.java
│   │   │   ├── auth/
│   │   │   │   ├── controller/AuthController.java
│   │   │   │   └── security/ (JWT, Filter, WebSecurityConfig)
│   │   │   ├── booking/
│   │   │   │   ├── controller/ (HotelBookingController, WebhookController)
│   │   │   │   ├── entity/Booking.java
│   │   │   │   ├── repository/BookingRepository.java
│   │   │   │   └── service/ (BookingService, CheckoutService + Impls)
│   │   │   ├── common/
│   │   │   │   ├── advice/   (GlobalExceptionHandler, GlobalResponseHandler)
│   │   │   │   ├── config/   (CorsConfig, MapperConfig, RazorpayConfig, TableColumnFixer)
│   │   │   │   ├── dto/      (Shared Request/Response DTOs)
│   │   │   │   ├── enums/    (Role, Gender, Amenity, BookingStatus)
│   │   │   │   ├── exception/(ResourceNotFoundException, UnAuthorisedException)
│   │   │   │   └── util/     (AppUtils)
│   │   │   ├── guest/        (entity, repository, service)
│   │   │   ├── hotel/        (controller, entity, repository, service)
│   │   │   ├── inventory/    (controller, entity, repository, service)
│   │   │   ├── pricing/
│   │   │   │   ├── service/  (PricingService, PricingUpdateService, HolidayService)
│   │   │   │   └── strategy/ (PricingStrategy + 5 strategy implementations)
│   │   │   ├── review/       (controller, entity, repository, service)
│   │   │   ├── room/         (controller, entity, repository, service)
│   │   │   └── user/         (controller, entity, repository, service)
│   │   └── resources/
│   │       └── application.properties
├── frontend/                 ← React 18 + Vite frontend
├── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Maven 3.9+
- PostgreSQL 16
- Node.js 18+ (for frontend)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/ChandraPratapChaudhary/HeavenHomes.git
cd HeavenHomes

# 2. Configure PostgreSQL — create database
CREATE DATABASE HeavenHomesDB;

# 3. Update application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/HeavenHomesDB
spring.datasource.username=your_username
spring.datasource.password=your_password
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret

# 4. Build & Run
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080/api/v1`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### API Documentation
Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

---

## 🎯 Architecture Decision — Why Modular Monolith?

| Concern | Decision |
|---|---|
| **Deployment simplicity** | Single JAR, easy to run and deploy |
| **Domain separation** | Each module = one business domain |
| **Code organization** | No cross-module direct class access via raw packages |
| **Team scalability** | Each module can be owned by one developer |
| **Future migration** | Modules can be extracted into microservices later |

---

## 👨‍💻 Developer

**Chandra Pratap Chaudhary**
PG Diploma Final Project — C-DAC

---

## 📄 License

This project is for educational purposes.
