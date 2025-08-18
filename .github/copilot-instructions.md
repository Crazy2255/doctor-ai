<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Clinic Management System

This is a comprehensive clinic management system with the following tech stack:

## Frontend (React.js)
- React.js with React Router for navigation
- Axios for API calls
- CSS modules for styling
- Components for Login, Dashboard, Patient Management, Visit Forms, and Patient Profiles

## Backend (PHP)
- PHP REST APIs
- SQLite database for data storage
- CORS enabled for frontend communication

## Key Features
- Patient registration and management
- Visit recording with diagnosis, medicines, lab tests, and X-ray tracking
- Vital signs recording (temperature, blood pressure, heart rate, etc.)
- AI-powered visit summaries for next visits
- Complete medical history tracking
- Admin authentication system

## Database Structure
- Users (authentication)
- Patients (personal and medical information)
- Visits (consultation records)
- Medicines (prescribed medications)
- Lab Tests (laboratory test orders and results)
- Imaging Tests (X-ray, CT, MRI, etc.)
- Vital Signs (patient vitals for each visit)

## Authentication
- Default admin credentials: Admin@gmail.com / Admin1234
- Session-based authentication with tokens

## API Endpoints
- `/api/login.php` - User authentication
- `/api/patients.php` - Patient CRUD operations
- `/api/visits.php` - Visit management with AI summary generation

## Development Notes
- Backend should be served from `http://localhost/clinic-backend/`
- Frontend runs on `http://localhost:3000`
- SQLite database is automatically created with tables
- CORS is configured for local development

When working with this codebase:
1. Maintain consistent error handling across components
2. Follow the established CSS naming conventions
3. Use the existing API structure for new features
4. Ensure responsive design for mobile devices
5. Keep the AI summary generation logic simple but informative
