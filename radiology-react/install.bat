@echo off
echo ========================================
echo  XferDx - React Installation
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Installing dependencies...
npm install

if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The application will be available at:
echo   http://localhost:3000
echo.
echo Default login credentials:
echo   Admin: ADMIN001 / admin123
echo   Radiologist: RAD001 / admin123
echo   Tech: TECH001 / admin123
echo.
pause
