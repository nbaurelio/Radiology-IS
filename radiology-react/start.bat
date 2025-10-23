@echo off
echo ========================================
echo  Starting XferDx - React
echo ========================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Dependencies not found. Running installation...
    call install.bat
    if errorlevel 1 exit /b 1
)

echo.
echo Starting development server...
echo The application will open automatically in your browser.
echo.
echo Available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.

npm run dev
