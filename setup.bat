@echo off
echo ======================================
echo   Clinic Management System Setup
echo ======================================
echo.

echo Step 1: Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up Backend...
echo Please ensure your web server is running and place the backend folder in:
echo - XAMPP: C:\xampp\htdocs\clinic-backend\
echo - WAMP: C:\wamp64\www\clinic-backend\
echo - IIS: C:\inetpub\wwwroot\clinic-backend\
echo.

echo Step 3: Backend API URL Configuration
echo The frontend is configured to use: http://localhost/clinic-backend/api/
echo If your backend is at a different location, update the API URLs in:
echo - frontend/src/components/Login.js
echo - frontend/src/components/PatientForm.js
echo - frontend/src/components/PatientList.js
echo - frontend/src/components/VisitForm.js
echo - frontend/src/components/PatientProfile.js
echo.

echo Step 4: Database Setup
echo SQLite database will be automatically created when you first run the backend.
echo Default admin login:
echo Email: Admin@gmail.com
echo Password: Admin1234
echo.

echo Setup Instructions:
echo 1. Copy the 'backend' folder to your web server directory
echo 2. Ensure PHP SQLite extension is enabled
echo 3. Start your web server (Apache/Nginx)
echo 4. Run 'npm start' in the frontend directory
echo 5. Open http://localhost:3000 in your browser
echo.

echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo To start the application:
echo 1. Ensure your web server is running
echo 2. Run: npm start (in frontend directory)
echo 3. Open: http://localhost:3000
echo.
pause
