# 🌱 AgriLanka - Agriculture Management Platform

A comprehensive full-stack web application designed to support Sri Lankan farmers with modern agricultural tools, disease detection, crop planning, and community engagement features.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**AgriLanka** is an innovative agricultural management platform built to empower farmers in Sri Lanka. It combines modern web technologies with practical agricultural features to help farmers manage their crops efficiently, detect diseases early, plan planting schedules, track plant progress, and connect with a farming community.

The application promotes sustainable agriculture, knowledge sharing, and enhanced productivity through a user-friendly interface backed by robust backend services.

---

## ✨ Features

### 🌾 Core Features

#### **1. User Management**
- User registration and authentication
- Secure login/logout functionality
- Profile creation and management
- User profile editing with profile pictures
- Role-based access control

#### **2. Planting Plan Management**
- Create and manage planting plans for different crops
- Set planting dates, expected harvest dates, and crop details
- View detailed planting plan information
- Edit existing planting plans
- Explore community planting plans
- Track multiple planting sessions simultaneously

#### **3. Plant Progress Tracking**
- Document plant growth at different stages
- Upload progress photos for visual documentation
- Track plant health metrics
- Record height, leaf count, and other observations
- View detailed progress analytics
- Monitor growth trends over time

#### **4. Crop Disease Detection**
- AI-powered crop disease identification system
- Upload plant images for disease analysis
- Get disease analysis results with confidence scores
- Receive treatment recommendations
- Access disease prevention tips
- Historical disease record management

#### **5. Community Engagement**
- Create and share posts with the farming community
- Comment on other farmers' posts
- Share experiences and tips
- Vote/like posts (medals/achievements)
- Community news feed
- Post sharing functionality

#### **6. Image Management**
- Image upload with Cloudinary integration
- Support for high-resolution images
- Automatic image optimization
- Secure file storage

#### **7. Weather Information**
- Real-time weather data integration
- Weather forecasting for crop planning
- Temperature and precipitation tracking
- Seasonal alerts and recommendations

---

## 🛠 Tech Stack

### **Backend**
- **Framework**: Spring Boot 3.4.5
- **Language**: Java 17
- **Database**: MongoDB (NoSQL)
- **ORM/Mapping**: Spring Data MongoDB
- **Image Storage**: Cloudinary API
- **Build Tool**: Maven
- **Architecture**: RESTful API with MVC pattern

### **Frontend**
- **Framework**: React 19.0
- **Build Tool**: Vite 6.2
- **Styling**: 
  - Tailwind CSS 4.0
  - Bootstrap 5.3
  - Styled Components 6.1
- **State Management**: React Context API
- **HTTP Client**: Axios 1.8
- **Animation**: Framer Motion 12.10
- **Icons**: Lucide React & React Icons
- **Routing**: React Router v7
- **Authentication**: Firebase 11.7
- **UI Components**: React Bootstrap

### **DevOps & Tools**
- **Version Control**: Git
- **Linting**: ESLint 9.21
- **Cloud Services**: Cloudinary, Firebase, MongoDB Atlas

---

## 📁 Project Structure

```
PAF_SLIIT/
│
├── backend/
│   └── agri-app/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/agriapp/agri_app/
│       │   │   │   ├── AgriAppApplication.java          (Main Spring Boot Application)
│       │   │   │   ├── config/                          (Configuration Classes)
│       │   │   │   │   ├── CloudinaryConfig.java        (Cloudinary Setup)
│       │   │   │   │   └── WebConfig.java               (CORS & Web Configuration)
│       │   │   │   ├── controller/                      (REST API Endpoints)
│       │   │   │   │   ├── UserController.java
│       │   │   │   │   ├── PlantingPlanController.java
│       │   │   │   │   ├── PlantProgressController.java
│       │   │   │   │   ├── CropDiseaseController.java
│       │   │   │   │   ├── PostController.java
│       │   │   │   │   ├── CommentController.java
│       │   │   │   │   └── ImageUploadController.java
│       │   │   │   ├── model/                           (Data Models/Entities)
│       │   │   │   │   ├── User.java
│       │   │   │   │   ├── PlantingPlan.java
│       │   │   │   │   ├── PlantProgress.java
│       │   │   │   │   ├── DiseaseAnalysisResult.java
│       │   │   │   │   ├── Post.java
│       │   │   │   │   └── Comment.java
│       │   │   │   ├── repository/                      (Data Access Layer)
│       │   │   │   │   ├── UserRepository.java
│       │   │   │   │   ├── PlantingPlanRepository.java
│       │   │   │   │   ├── PlantProgressRepository.java
│       │   │   │   │   ├── PostRepository.java
│       │   │   │   │   └── CommentRepository.java
│       │   │   │   └── service/                         (Business Logic)
│       │   │   │       ├── UserService.java
│       │   │   │       ├── PlantingPlanService.java
│       │   │   │       ├── PlantProgressService.java
│       │   │   │       ├── CropDiseaseService.java
│       │   │   │       ├── PostService.java
│       │   │   │       ├── CommentService.java
│       │   │   │       ├── CloudinaryService.java
│       │   │   │       ├── FileStorageService.java
│       │   │   │       └── impl/                        (Service Implementations)
│       │   │   │           ├── UserServiceImpl.java
│       │   │   │           ├── PlantingPlanServiceImpl.java
│       │   │   │           ├── PlantProgressServiceImpl.java
│       │   │   │           ├── CropDiseaseServiceImpl.java
│       │   │   │           ├── PostServiceImpl.java
│       │   │   │           ├── CommentServiceImpl.java
│       │   │   │           ├── CloudinaryServiceImpl.java
│       │   │   │           └── FileStorageServiceImpl.java
│       │   │   └── resources/
│       │   │       └── application.properties            (Configuration Properties)
│       │   └── test/
│       │       └── java/                                 (Unit Tests)
│       ├── pom.xml                                      (Maven Dependencies)
│       ├── mvnw & mvnw.cmd                              (Maven Wrapper)
│       └── .mvn/
│
├── frontend/
│   ├── src/
│   │   ├── pages/                                       (Page Components)
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ProfileEditPage.jsx
│   │   │   ├── PlantingForm.jsx
│   │   │   ├── PlantingPlanDetail.jsx
│   │   │   ├── PlantingPlanEditPage.jsx
│   │   │   ├── PlantingPlanExplorer.jsx
│   │   │   ├── PlantProgressDetailPage.jsx
│   │   │   ├── CropDiseaseDetector.jsx
│   │   │   ├── CreatePostPage.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── PostsPage.jsx
│   │   │   ├── WeatherPage.jsx
│   │   │   └── ShareModal.jsx
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx                           (Navigation Bar)
│   │   │       ├── Footer.jsx                           (Footer Component)
│   │   │       └── EditPostPopup.jsx                    (Post Editing Modal)
│   │   ├── services/                                    (API Integration & Business Logic)
│   │   │   ├── api.jsx                                  (Axios Configuration)
│   │   │   ├── userService.jsx
│   │   │   ├── PlantingPlanService.jsx
│   │   │   ├── PlantProgressService.jsx
│   │   │   ├── PostService.jsx
│   │   │   ├── commentService.jsx
│   │   ├── utils/                                       (Utilities)
│   │   │   ├── AuthContext.jsx                          (Authentication Context)
│   │   │   └── firebase.config.js                       (Firebase Configuration)
│   │   ├── styles/
│   │   │   └── cursor.css                               (Custom Styling)
│   │   ├── images/                                      (Static Images)
│   │   │   ├── home/
│   │   │   └── progress/
│   │   ├── App.jsx                                      (Main App Component)
│   │   ├── main.jsx                                     (Entry Point)
│   │   └── index.css
│   ├── public/                                          (Static Assets)
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html

└── README.md                                            (This File)
```

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

### **Backend Requirements**
- **Java 17+**: [Download Java](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.6+**: [Download Maven](https://maven.apache.org/download.cgi)
- **MongoDB Atlas Account**: [Create MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas)

### **Frontend Requirements**
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **npm 9+**: Comes with Node.js

### **External Services**
- **Cloudinary Account**: For image storage [Sign up](https://cloudinary.com/)
- **Firebase Account**: For authentication [Create Project](https://firebase.google.com/)

---

## 🚀 Installation & Setup

### **Backend Setup**

1. **Navigate to backend directory**
   ```bash
   cd backend/agri-app
   ```

2. **Configure MongoDB Connection**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/agri_app
   ```

3. **Configure Cloudinary Credentials**
   Update in `src/main/resources/application.properties`:
   ```properties
   cloudinary.cloud-name=YOUR_CLOUD_NAME
   cloudinary.api-key=YOUR_API_KEY
   cloudinary.api-secret=YOUR_API_SECRET
   ```

4. **Build the application**
   ```bash
   mvn clean install
   ```

### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update `src/utils/firebase.config.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Configure API Base URL**
   Update `src/services/api.jsx`:
   ```javascript
   const API_BASE_URL = "http://localhost:8081/api";
   ```

---

## ▶️ Running the Application

### **Backend**

```bash
# From backend/agri-app directory
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Java directly (after building)
java -jar target/agri-app-0.0.1-SNAPSHOT.jar
```

Backend will run on: `http://localhost:8081`

### **Frontend**

```bash
# From frontend directory
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

Frontend will run on: `http://localhost:5173`

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:8081/api
```

### **Key Endpoints**

#### **User Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login user |
| GET | `/users/{id}` | Get user profile |
| PUT | `/users/{id}` | Update user profile |
| DELETE | `/users/{id}` | Delete user account |

#### **Planting Plans**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/planting-plans` | Create new planting plan |
| GET | `/planting-plans` | Get all planting plans |
| GET | `/planting-plans/{id}` | Get specific planting plan |
| PUT | `/planting-plans/{id}` | Update planting plan |
| DELETE | `/planting-plans/{id}` | Delete planting plan |

#### **Plant Progress**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/plant-progress` | Record plant progress |
| GET | `/plant-progress/{planId}` | Get progress for plan |
| PUT | `/plant-progress/{id}` | Update progress record |
| DELETE | `/plant-progress/{id}` | Delete progress record |

#### **Disease Detection**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/disease-analysis` | Analyze crop disease |
| GET | `/disease-analysis/{id}` | Get analysis result |
| GET | `/disease-analysis/history/{userId}` | Get user's analysis history |

#### **Posts & Comments**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts` | Create new post |
| GET | `/posts` | Get all posts |
| PUT | `/posts/{id}` | Update post |
| DELETE | `/posts/{id}` | Delete post |
| POST | `/comments` | Add comment to post |
| DELETE | `/comments/{id}` | Delete comment |

#### **Image Upload**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload image to Cloudinary |

---

## 🗄️ Database Schema

### **Collections in MongoDB**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String (URL),
  firstName: String,
  lastName: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Planting Plans Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  cropName: String,
  plantingDate: Date,
  expectedHarvestDate: Date,
  quantity: Number,
  area: Number,
  soilType: String,
  wateringSchedule: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Plant Progress Collection**
```javascript
{
  _id: ObjectId,
  plantingPlanId: ObjectId,
  date: Date,
  height: Number,
  leafCount: Number,
  health: String,
  notes: String,
  imageUrl: String,
  createdAt: Date
}
```

#### **Disease Analysis Results Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  imageUrl: String,
  disease: String,
  confidence: Number,
  treatment: String,
  prevention: String,
  createdAt: Date
}
```

#### **Posts Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  content: String,
  imageUrl: String,
  likes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Comments Collection**
```javascript
{
  _id: ObjectId,
  postId: ObjectId,
  userId: ObjectId,
  content: String,
  createdAt: Date
}
```

---

## 🤝 Contributing

We welcome contributions to improve AgriLanka! Here's how you can contribute:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**

### **Code Standards**
- Follow Java conventions for backend code
- Use React best practices for frontend code
- Add comments for complex logic
- Write meaningful commit messages

---

## 📄 License

This project is developed as part of the SLIIT PAF (Project) program.

---

## 📞 Support & Contact

For support or questions about the project, please reach out to the development team or check the project documentation.

---

## 🙏 Acknowledgments

- **SLIIT (Sri Lanka Institute of Information Technology)** for the platform and guidance
- **MongoDB Atlas** for database services
- **Cloudinary** for image management
- **Firebase** for authentication services
- All contributors and supporters of AgriLanka

---

**Last Updated**: June 2026
**Version**: 1.0.0 
