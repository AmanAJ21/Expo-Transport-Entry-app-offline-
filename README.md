# JData

A modern React Native application built with Expo for data management and billing operations.

## 🚀 Features

- **Cross-platform**: Runs on Android and Web
- **Modern UI**: Built with NativeWind (Tailwind CSS for React Native)
- **Data Management**: Comprehensive bill and owner data tracking
- **Visual Analytics**: Interactive charts and reports
- **File Operations**: Document picking, image manipulation, and PDF generation
- **Secure Storage**: Local data persistence with encryption
- **Print & Share**: Export and share reports

## 📱 Screenshots

<!-- Add screenshots here -->

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Charts**: React Native Chart Kit with D3
- **State Management**: React Context
- **Storage**: Async Storage & Secure Store
- **File Handling**: Expo File System, Document Picker
- **Image Processing**: Expo Image Manipulator

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JData
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
src/
├── app/                 # App screens (Expo Router)
│   ├── _layout.tsx     # Root layout
│   ├── index.tsx       # Home screen
│   ├── owner.tsx       # Owner management
│   ├── report.tsx      # Reports screen
│   ├── settings.tsx    # Settings screen
│   └── transport.tsx   # Transport management
├── components/         # Reusable UI components
├── contexts/          # React contexts
├── models/            # TypeScript types
├── utils/             # Utility functions
└── assets/            # Images and static files
```

## 🎯 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run web` - Run on web browser
- `npm run deploy` - Export and deploy to web

## 🔧 Configuration

The app is configured through:
- `app.json` - Expo configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `metro.config.js` - Metro bundler configuration

## 📊 Key Components

- **BillsList**: Display and manage billing data
- **OwnerDataList**: Owner information management
- **AdvancePieChart**: Data visualization
- **FilterModal**: Data filtering capabilities
- **PrintButton**: Export functionality

