# Quick Deployment Guide

## For XAMPP Users

1. **Install XAMPP** from https://www.apachefriends.org/
2. **Start Apache** from XAMPP Control Panel
3. **Copy Backend:**
   ```
   Copy: backend folder
   To: C:\xampp\htdocs\clinic-backend\
   ```
4. **Install Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
5. **Access Application:** http://localhost:3000

## For WAMP Users

1. **Install WAMP** from http://www.wampserver.com/
2. **Start WAMP** (green icon in system tray)
3. **Copy Backend:**
   ```
   Copy: backend folder
   To: C:\wamp64\www\clinic-backend\
   ```
4. **Install Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
5. **Access Application:** http://localhost:3000

## Verification Steps

1. **Test Backend:** Visit http://localhost/clinic-backend/api/login.php
   - Should show error message (expected for GET request)

2. **Test Frontend:** Visit http://localhost:3000
   - Should show login page

3. **Login:** Use Admin@gmail.com / Admin1234

## Troubleshooting

- **CORS Error:** Make sure backend URL is exactly `http://localhost/clinic-backend/api/`
- **Database Error:** Ensure PHP SQLite extension is enabled
- **404 Error:** Check that Apache/WAMP is running and backend folder is in correct location
