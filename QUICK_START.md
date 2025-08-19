# Quick Start Guide

## Starting the Application

### Option 1: Automatic Start (Windows)
Double-click `start-servers.bat` to start both backend and frontend servers automatically.

### Option 2: Manual Start

#### Backend Server
```bash
cd backend-node
npm install
npm start
```
Server will be available at: http://localhost:8000

#### Frontend Server
```bash
cd frontend
npm install
npm start
```
Application will be available at: http://localhost:3000

## Default Login Credentials
- Email: Admin@gmail.com
- Password: Admin1234

## Troubleshooting

### "Failed to add doctor" Error
1. Make sure the backend server is running on port 8000
2. Check the browser console for detailed error messages
3. Verify the backend-node/server.js is running without errors

### Database Issues
The SQLite database file will be created automatically when the server starts.

### Port Conflicts
- Backend runs on port 8000
- Frontend runs on port 3000
- Make sure these ports are not in use by other applications

## Features
- Patient Management
- Doctor Management  
- Visit Recording with AI Summaries
- Lab Tests and Imaging
- Reports and Analytics
- Settings Configuration
