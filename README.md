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

## 📱 Download

### Android APK
[![Download APK](https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android)](https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing)

*Latest version: v1.0.0*

### QR Code for Easy Download
![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing)

## 📱 Screenshots

<div align="center">

| Home Screen | Owner Management | Transport Management |
|-------------|------------------|---------------------|
| <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/home.png" width="250" alt="Home Screen"> | <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/owner.png" width="250" alt="Owner Screen"> | <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/transport.png" width="250" alt="Transport Screen"> |
| Dashboard with bill insights | Manage owner data with actions | Track transport bills with status |

| Reports | Settings |
|---------|----------|
| <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/report.png" width="250" alt="Report Screen"> | <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/settings.png" width="250" alt="Settings Screen"> |
| Generate comprehensive reports | App configuration and data management |

</div>

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
   git clone https://github.com/AmanAJ21/Expo-Transport-Entry-app-offline-.git
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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support and questions, please contact the development team.

---

Built with ❤️ using React Native and Expo