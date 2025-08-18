# Clinic Management System

A comprehensive clinic management system built with React.js frontend and PHP backend using SQLite database. This system allows doctors to manage patient records, record visits with diagnosis, medicines, lab tests, X-ray reports, and generates AI-powered visit summaries.

## Features

### 🏥 Patient Management
- Register new patients with complete personal and medical information
- View patient list with search functionality
- Patient profiles with complete medical history
- Emergency contact information

### 🩺 Visit Management
- Record patient visits with detailed information
- Capture vital signs (temperature, blood pressure, heart rate, etc.)
- Diagnosis and problem identification
- Treatment plan documentation

### 💊 Medicine Prescription
- Prescribe multiple medicines per visit
- Dosage, frequency, and duration tracking
- Special instructions for medications

### 🧪 Lab Tests & Imaging
- Order various lab tests (blood, urine, etc.)
- Schedule imaging tests (X-ray, CT, MRI, Ultrasound)
- Track test status and results
- Body part specification for imaging

### 🤖 AI-Powered Summaries
- Automatic generation of visit summaries
- Previous visit context for doctors
- Treatment recommendations
- Follow-up suggestions

### 🔐 Authentication
- Secure admin login system
- Session management
- Protected routes

## Technology Stack

### Frontend
- **React.js** - User interface
- **React Router** - Navigation
- **Axios** - API communication
- **CSS3** - Styling with responsive design

### Backend
- **PHP** - REST API server
- **SQLite** - Database storage
- **CORS** - Cross-origin resource sharing

### Database Schema
- Users (authentication)
- Patients (personal information)
- Visits (consultation records)
- Medicines (prescriptions)
- Lab Tests (laboratory orders)
- Imaging Tests (X-ray, CT, MRI)
- Vital Signs (patient vitals)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- Web server (Apache/Nginx) or XAMPP/WAMP
- Modern web browser

### Backend Setup

1. **Copy backend files to web server:**
   ```bash
   # Copy the backend folder to your web server directory
   # For XAMPP: C:/xampp/htdocs/clinic-backend/
   # For WAMP: C:/wamp64/www/clinic-backend/
   ```

2. **Ensure PHP SQLite extension is enabled:**
   - Check that `php_sqlite3.dll` is enabled in `php.ini`
   - Restart your web server

3. **Test backend API:**
   - Open `http://localhost/clinic-backend/api/login.php` in browser
   - You should see an error message (expected for GET request)

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Open `http://localhost:3000` in your browser

## Default Login Credentials

- **Email:** Admin@gmail.com
- **Password:** Admin1234

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
