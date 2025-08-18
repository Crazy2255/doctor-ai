# 🏥 Clinic Management System

A comprehensive clinic management system built with **React.js** and **Node.js**, featuring patient management, appointment scheduling, visit recording with AI-powered summaries, and voice recording capabilities.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-lightgrey)](https://www.sqlite.org/)

## 🚀 Features

### 👥 Patient Management
- Complete patient registration and profile management
- Patient search and filtering capabilities
- Comprehensive medical history tracking
- Emergency contact information management
- Edit and update patient information with validation

### 📅 Advanced Appointment System
- **Smart scheduling** with time slot management (8 AM - 5:30 PM)
- **Today's appointments view** with real-time status updates
- **Appointment status tracking**: Scheduled → Confirmed → Completed → Cancelled
- **Conflict detection** to prevent double-booking
- **Multiple appointment types**: Consultation, Follow-up, Checkup, Vaccination, Emergency, etc.
- Edit, cancel, and reschedule appointments
- Appointment filtering and search functionality

### 🏥 Comprehensive Visit Management
- **Detailed visit forms** with diagnosis and treatment plans
- **Vital signs recording** (temperature, blood pressure, heart rate, SpO2, etc.)
- **Medicine prescription tracking** with dosage and frequency
- **Lab test orders** (Blood, Urine, Stool, Culture tests)
- **Imaging test requests** (X-ray, CT, MRI, Ultrasound) with body part specification
- **Voice recording capabilities** (up to 10MB, auto-stop at 5 minutes)
- **AI-powered visit summaries** with clinical interpretation

### 🤖 AI-Powered Medical Intelligence
- **Automatic visit summary generation** with clinical context
- **Previous visit correlation** for comprehensive patient care
- **Treatment recommendation system**
- **Voice recording analysis** integration
- **Medical history interpretation**
- **Follow-up suggestions** based on patient data

### 🎙️ Voice Recording Integration
- **High-quality voice recording** during consultations
- **Automatic file size management** with quality optimization
- **Cross-browser support** using MediaRecorder API
- **Voice analysis integration** with AI summaries
- **Secure voice file storage** and playback

### 🔐 Robust Authentication & Security
- **Secure login system** with bcrypt password hashing
- **Session-based authentication** with automatic logout
- **Protected routes** and API endpoints
- **User role management** (Admin access)
- **Default credentials**: `Admin@gmail.com` / `Admin1234`

## 🛠️ Technology Stack

### Frontend (React.js)
- **React.js 18.2.0** with React Router for seamless navigation
- **Axios** for robust API communication
- **CSS Modules** with responsive design principles
- **MediaRecorder API** for voice recording functionality
- **Progressive Web App** features for mobile experience

### Backend (Node.js)
- **Node.js** with Express.js 4.18.2 framework
- **SQLite** database with automatic schema creation
- **bcrypt** for secure password hashing
- **CORS** configuration for secure cross-origin requests
- **RESTful API** architecture with comprehensive error handling
- **Enhanced payload handling** (50MB limit for voice files)

### Database Architecture
- **Users** table (authentication and user management)
- **Patients** table (comprehensive personal and medical information)
- **Visits** table (detailed consultation records with AI summaries)
- **Appointments** table (advanced scheduling system)
- **Medicines** table (prescription tracking and management)
- **Lab Tests** table (laboratory test orders and results)
- **Imaging Tests** table (X-ray, CT, MRI, Ultrasound records)
- **Vital Signs** table (patient vitals for each visit)

### AI & Advanced Features
- **Natural Language Processing** for medical summary generation
- **Voice Analysis** integration with consultation records
- **Clinical Decision Support** with treatment recommendations
- **Automated Medical Coding** and interpretation

## 📦 Quick Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

### 🚀 One-Command Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/clinic-management-system.git
cd clinic-management-system

# Install all dependencies (frontend + backend)
npm run install-all

# Start both frontend and backend simultaneously
npm run dev
```

### Manual Setup (Alternative)

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/clinic-management-system.git
cd clinic-management-system
```

#### 2. Backend Setup (Node.js)
```bash
cd backend-node
npm install
npm start
```
✅ Backend server runs on `http://localhost:8000`

#### 3. Frontend Setup (React)
```bash
cd frontend
npm install
npm start
```
✅ Frontend runs on `http://localhost:3000`

### 🎯 Quick Start Guide

1. **Access the Application**
   - Open `http://localhost:3000` in your browser
   - Login with: `Admin@gmail.com` / `Admin1234`

2. **Start Managing Your Clinic**
   - Add patients → Schedule appointments → Record visits
   - Experience AI-powered summaries and voice recording features

## API Endpoints

### Authentication
- `POST /api/login.php` - User login

### Patients
- `GET /api/patients.php` - Get all patients
- `GET /api/patients.php?id={id}` - Get specific patient
- `POST /api/patients.php` - Create new patient
- `PUT /api/patients.php?id={id}` - Update patient
- `DELETE /api/patients.php?id={id}` - Delete patient

### Visits
- `GET /api/visits.php` - Get all visits
- `GET /api/visits.php?patient_id={id}` - Get patient visits
- `GET /api/visits.php?id={id}` - Get specific visit
- `POST /api/visits.php` - Create new visit with AI summary

## Usage Guide

### 1. Login
- Use the default admin credentials to access the system
- The system will remember your login session

### 2. Add Patients
- Click "Add New Patient" from dashboard or patient list
- Fill in patient information including:
  - Personal details (name, age, contact)
  - Emergency contact information
  - Medical history and allergies

### 3. Record Visits
- Select a patient and click "New Visit"
- Record vital signs (temperature, blood pressure, etc.)
- Enter chief complaint and diagnosis
- Prescribe medicines with dosage and instructions
- Order lab tests and imaging studies
- Add doctor's notes and treatment plan
- Submit to generate AI summary

### 4. View Patient History
- Click on any patient to view their complete profile
- See all previous visits with details
- Review AI-generated summaries for context
- Track medications, tests, and treatments

### 5. AI Summaries
- Automatically generated after each visit
- Provides context for next appointments
- Includes medication reviews and follow-up recommendations
- Helps doctors understand patient's medical journey

## Project Structure

```
clinic-management-system/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main application component
│   │   └── App.css         # Global styles
│   └── package.json        # Frontend dependencies
├── backend/                 # PHP backend
│   ├── api/                # API endpoints
│   │   ├── login.php       # Authentication
│   │   ├── patients.php    # Patient management
│   │   └── visits.php      # Visit management
│   ├── config/             # Configuration files
│   │   └── database.php    # Database connection
│   └── clinic.db          # SQLite database (auto-created)
└── README.md               # This file
```

## Development Notes

### Database
- SQLite database is automatically created on first API call
- Tables are created with proper relationships
- Default admin user is inserted automatically

### CORS Configuration
- Backend is configured for `http://localhost:3000`
- Modify API files to change allowed origins

### Error Handling
- Frontend displays user-friendly error messages
- Backend returns proper HTTP status codes
- Validation on both client and server sides

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly buttons and forms

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend allows requests from frontend URL
   - Check web server CORS configuration

2. **Database Connection:**
   - Verify SQLite extension is enabled in PHP
   - Check file permissions for database creation

3. **API Not Found:**
   - Confirm backend is accessible at correct URL
   - Check web server configuration

4. **Login Issues:**
   - Use exact credentials: Admin@gmail.com / Admin1234
   - Check browser console for error messages

### Browser Compatibility
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Future Enhancements

- [ ] Appointment scheduling system
- [ ] Multi-doctor support with roles
- [ ] Real-time notifications
- [ ] Integration with external lab systems
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Telemedicine features
- [ ] Insurance and billing management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Note:** This is a demonstration system. For production use, implement additional security measures, proper error handling, and backup systems.
