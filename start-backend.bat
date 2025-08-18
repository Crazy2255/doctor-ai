@echo off
echo ======================================
echo   Starting PHP Development Server
echo ======================================
echo.

echo Checking if PHP is installed...
php --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo.
    echo Please install PHP or use XAMPP/WAMP:
    echo 1. Download XAMPP from: https://www.apachefriends.org/
    echo 2. Install XAMPP
    echo 3. Start Apache from XAMPP Control Panel
    echo 4. Copy backend folder to C:\xampp\htdocs\clinic-backend\
    echo 5. Access: http://localhost/clinic-backend/api/
    echo.
    pause
    exit /b 1
)

echo PHP is installed. Starting development server...
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend should connect to: http://localhost:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0backend"
php -S localhost:8000
