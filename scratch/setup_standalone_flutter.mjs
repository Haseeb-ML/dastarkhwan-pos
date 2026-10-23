import fs from 'node:fs';
import path from 'node:path';

const dest = path.resolve('..', 'Dastarkhwan-Flutter-App');

const batContent = `@echo off
echo ===================================================
echo     Dastarkhwan POS - Flutter APK Builder
echo ===================================================
echo.
echo Running flutter pub get...
call flutter pub get
echo.
echo Building Release APK...
call flutter build apk --release
echo.
if exist build\\app\\outputs\\flutter-apk\\app-release.apk (
    copy /y build\\app\\outputs\\flutter-apk\\app-release.apk Dastarkhwan-POS.apk >nul
    echo ===================================================
    echo  SUCCESS: New APK ready at Dastarkhwan-POS.apk!
    echo ===================================================
) else (
    echo [ERROR] Build failed. Please check Flutter and Android SDK.
)
echo.
pause
`;

fs.writeFileSync(path.join(dest, 'build_apk.bat'), batContent, 'utf-8');

const readmeContent = `# Dastarkhwan POS — Flutter Mobile & Tablet App

This is the standalone **Flutter Android App** for Dastarkhwan Restaurant Management POS & ERP.

## Ready to Install APK
- **File:** \`Dastarkhwan-POS.apk\` (located directly in this folder)
- Transfer this file to any Android mobile or tablet and tap to install.

## Features
- **Offline First:** Embedded local server serves all ERP screens without requiring an active internet connection.
- **Realtime Cloud Sync:** Auto-syncs live orders, sales, and accounts with Firebase Firestore when internet is available.
- **Dual Mode:** Instant toggle between Offline Local mode and Live Cloud mode.
- **Hardware Integration:** Supports Bluetooth thermal printers and camera barcode scanning.
- **Back Button Protection:** Prevents accidental closing during active orders.

## How to Run / Rebuild
1. Open this folder in **VS Code** or **Android Studio**.
2. Run on connected Android device:
   \`\`\`bash
   flutter run
   \`\`\`
3. To rebuild the Release APK, simply double-click **\`build_apk.bat\`** or run:
   \`\`\`bash
   flutter build apk --release
   \`\`\`
`;

fs.writeFileSync(path.join(dest, 'README.md'), readmeContent, 'utf-8');
console.log('build_apk.bat and README.md created in Dastarkhwan-Flutter-App!');
