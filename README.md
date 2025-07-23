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

<div align="center">

### Main Features
<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/Home.png" width="200" alt="Home Screen"><br>
      <b>Home Screen</b><br>
      <sub>Dashboard with bill insights</sub>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/Owner.png" width="200" alt="Owner Screen"><br>
      <b>Owner Management</b><br>
      <sub>Manage owner data with actions</sub>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/Transport.png" width="200" alt="Transport Screen"><br>
      <b>Transport Management</b><br>
      <sub>Track transport bills with status</sub>
    </td>
  </tr>
</table>

### Reports & Settings
<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/Report.png" width="200" alt="Report Screen"><br>
      <b>Reports</b><br>
      <sub>Generate comprehensive reports</sub>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/AmanAJ21/Expo-Transport-Entry-app-offline-/main/screenshots/Setting.png" width="200" alt="Settings Screen"><br>
      <b>Settings</b><br>
      <sub>App configuration and data management</sub>
    </td>
  </tr>
</table>

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

Built with ❤️ usiuestions, please contact the development team.

---

Built with ❤️ using React Native and Expo