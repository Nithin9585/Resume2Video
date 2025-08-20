# 🎬 Resume2Video - AI-Powered Video Resume Creator

[![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.4.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

Transform your traditional resume into an engaging AI-powered video presentation that stands out to employers. Resume2Video leverages cutting-edge AI technology to create professional video resumes with realistic avatars, natural voice synthesis, and stunning visual presentations.

## 🌟 Features

### 🤖 AI-Powered Technology
- **Smart Script Generation**: Automatically converts resume content into engaging video scripts
- **Professional AI Avatars**: 50+ studio-quality digital presenters
- **Natural Voice Synthesis**: Multi-language support (English, Tamil, Hindi)
- **Intelligent Content Analysis**: Advanced PDF parsing and text extraction

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful transparent elements with backdrop blur effects
- **Advanced Animations**: Mouse-following gradients, floating particles, and smooth transitions
- **Responsive Design**: Optimized for all devices and screen sizes
- **Dark Theme**: Professional dark interface with gradient accents

### 🔒 Security & Performance
- **Firebase Authentication**: Secure user management and session handling
- **Firestore Database**: Real-time data synchronization and storage
- **Cloudinary Integration**: Optimized media storage and delivery
- **Performance Caching**: In-memory caching with TTL for faster API responses

### 🚀 Advanced Features
- **Real-time Progress Tracking**: Live video generation status updates
- **Script Customization**: Full editing capabilities for generated scripts
- **Multiple Export Options**: High-quality video downloads
- **User Dashboard**: Comprehensive analytics and project management

## 🏗️ Architecture & Flow

```mermaid
graph TB
    subgraph "Client Side"
        A[User Registration/Login] --> B[Upload Resume & Photo]
        B --> C[AI Script Generation]
        C --> D[Review & Edit Script]
        D --> E[Select Avatar]
        E --> F[Choose Voice]
        F --> G[Preview Selection]
        G --> H[Generate Video]
        H --> I[Download Video]
    end

    subgraph "Authentication Layer"
        J[Firebase Auth] --> K[User Session Management]
        K --> L[Protected Routes]
    end

    subgraph "Backend Services"
        M[Next.js API Routes] --> N[File Upload Handler]
        N --> O[Cloudinary Storage]
        M --> P[PDF Text Extraction]
        P --> Q[Google Gemini AI]
        Q --> R[Script Generation]
        M --> S[HeyGen API Integration]
        S --> T[Avatar Management]
        S --> U[Voice Synthesis]
        S --> V[Video Generation]
    end

    subgraph "Database Layer"
        W[Firestore] --> X[User Data]
        W --> Y[Project Management]
        W --> Z[Activity Tracking]
    end

    subgraph "External APIs"
        AA[HeyGen Video API] --> BB[Avatar Rendering]
        AA --> CC[Voice Processing]
        AA --> DD[Video Compilation]
        EE[Google Gemini] --> FF[AI Text Processing]
        GG[Cloudinary] --> HH[Media Management]
    end

    A --> J
    B --> M
    C --> P
    E --> T
    F --> U
    H --> S
    M --> W
    S --> AA
    Q --> EE
    O --> GG

    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style I fill:#e8f5e8
    style J fill:#fff3e0
    style M fill:#fce4ec
    style W fill:#f1f8e9
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.1 with App Router
- **UI Library**: React 19.0.0 with Hooks
- **Styling**: Tailwind CSS 4.0 with custom components
- **Icons**: Lucide React, React Icons, Radix UI Icons
- **Animations**: Custom CSS animations with Tailwind
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: Firebase Auth with session management
- **Database**: Firestore with real-time synchronization
- **File Storage**: Cloudinary for media management
- **PDF Processing**: PDF.js for text extraction
- **AI Integration**: Google Gemini for script generation

### External Services
- **Video Generation**: HeyGen API for avatar and voice synthesis
- **Cloud Storage**: Cloudinary for optimized media delivery
- **Analytics**: Custom analytics with Firestore
- **Monitoring**: Built-in error handling and logging

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Firebase** project with Authentication and Firestore enabled
- **Cloudinary** account for media storage
- **HeyGen API** credentials for video generation
- **Google AI** API key for Gemini integration

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Nithin9585/Resume2Video.git
cd Resume2Video/resume2video
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PROJECT_ID=your_project_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# HeyGen API Configuration
HEYGEN_API_KEY=your_heygen_api_key
HEYGEN_API_URL=https://api.heygen.com/v2

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore Database

2. **Configure Authentication**:
   - Enable Email/Password authentication
   - Configure authorized domains

3. **Setup Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userdata/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Start the Production Server**: Run the production server with:
  ```bash
  npm start
  ```

## Project Structure

- **src/app**: Contains the main application logic and API routes.
- **src/components**: Reusable UI components.
- **src/lib**: Utility functions and database connection logic.
- **public**: Static assets like images and icons.

## 🔄 Application Workflow

### User Journey Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant F as Firebase
    participant H as HeyGen
    participant G as Gemini AI

    U->>C: Access Application
    C->>F: Check Authentication
    F-->>C: Auth Status
    
    alt User Not Authenticated
        C->>U: Redirect to Login
        U->>C: Login/Register
        C->>F: Authenticate User
        F-->>C: User Session
    end

    U->>C: Upload Resume & Photo
    C->>A: POST /api/Upload
    A->>A: Process PDF Text
    A->>G: Generate Script
    G-->>A: AI-Generated Script
    A->>F: Save User Data
    F-->>A: Confirmation
    A-->>C: Upload Success

    U->>C: Review Script
    C->>U: Display Editable Script
    U->>C: Confirm/Edit Script

    U->>C: Select Avatar
    C->>A: GET /api/GetAvatars
    A-->>C: Avatar List
    U->>C: Choose Avatar

    U->>C: Select Voice
    C->>A: GET /api/GetVoices
    A-->>C: Voice List
    U->>C: Choose Voice

    U->>C: Generate Video
    C->>A: POST /api/GenerateVideo
    A->>H: Create Video Request
    H-->>A: Video Job ID
    A-->>C: Generation Started

    loop Video Generation
        C->>A: GET /api/CheckVideoStatus
        A->>H: Check Job Status
        H-->>A: Status Update
        A-->>C: Current Status
    end

    H->>A: Video Completed
    A-->>C: Video URL Ready
    U->>C: Download Video
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### File Management
- `POST /api/Upload` - Upload resume and profile picture
- `GET /api/files/[id]` - Retrieve uploaded files

### AI Processing
- `POST /api/GenerateScript` - Generate AI script from resume
- `GET /api/GetAvatars` - Fetch available avatars
- `GET /api/GetVoices` - Fetch available voices

### Video Generation
- `POST /api/GenerateVideo` - Start video generation
- `GET /api/CheckVideoStatus` - Check video generation status
- `GET /api/video/[id]` - Download generated video

## 🚀 Deployment Guide

### Production Deployment

1. **Build the Application**:
```bash
npm run build
```

2. **Environment Setup**:
   - Configure production environment variables
   - Set up Firebase production project
   - Configure Cloudinary for production
   - Update HeyGen API endpoints

3. **Deploy to Vercel** (Recommended):
```bash
npm install -g vercel
vercel --prod
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Firebase Authentication Errors
```bash
Error: Firebase config is not defined
```
**Solution**: Ensure all Firebase environment variables are properly set in `.env.local`

#### 2. HeyGen API Failures
```bash
Error: Avatar not found
```
**Solution**: Verify HeyGen API credentials and check avatar availability

#### 3. PDF Processing Issues
```bash
Error: PDF text extraction failed
```
**Solution**: Ensure PDF contains selectable text (not image-based)

## 🤝 Contributing

We welcome contributions to Resume2Video! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API reference
- **Email Support**: contact@resume2video.com

---

<div align="center">

**Built with ❤️ by [Nithin9585](https://github.com/Nithin9585)**

[⭐ Star this repo](https://github.com/Nithin9585/Resume2Video) | [🐛 Report Bug](https://github.com/Nithin9585/Resume2Video/issues) | [✨ Request Feature](https://github.com/Nithin9585/Resume2Video/issues)

</div>
