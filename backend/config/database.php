<?php
class Database {
    private $db_file = __DIR__ . '/../clinic.db';
    private $conn;

    public function connect() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO("sqlite:" . $this->db_file);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create tables if they don't exist
            $this->createTables();
            
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        
        return $this->conn;
    }
    
    private function createTables() {
        // Users table for authentication
        $users_table = "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        
        // Patients table
        $patients_table = "CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            date_of_birth DATE,
            gender TEXT,
            address TEXT,
            emergency_contact TEXT,
            emergency_phone TEXT,
            medical_history TEXT,
            allergies TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        
        // Visits table
        $visits_table = "CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            chief_complaint TEXT,
            diagnosis TEXT,
            problems TEXT,
            treatment_plan TEXT,
            notes TEXT,
            doctor_name TEXT,
            ai_summary TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients (id)
        )";
        
        // Medicines table
        $medicines_table = "CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            medicine_name TEXT NOT NULL,
            dosage TEXT,
            frequency TEXT,
            duration TEXT,
            instructions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )";
        
        // Lab tests table
        $lab_tests_table = "CREATE TABLE IF NOT EXISTS lab_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            test_name TEXT NOT NULL,
            test_type TEXT,
            ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_date DATETIME,
            results TEXT,
            normal_range TEXT,
            status TEXT DEFAULT 'ordered',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )";
        
        // X-ray and imaging tests table
        $imaging_table = "CREATE TABLE IF NOT EXISTS imaging_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            test_name TEXT NOT NULL,
            test_type TEXT DEFAULT 'X-ray',
            body_part TEXT,
            ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_date DATETIME,
            results TEXT,
            radiologist_notes TEXT,
            status TEXT DEFAULT 'ordered',
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )";
        
        // Vital signs table
        $vitals_table = "CREATE TABLE IF NOT EXISTS vital_signs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            temperature REAL,
            blood_pressure_systolic INTEGER,
            blood_pressure_diastolic INTEGER,
            heart_rate INTEGER,
            respiratory_rate INTEGER,
            oxygen_saturation REAL,
            weight REAL,
            height REAL,
            bmi REAL,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (visit_id) REFERENCES visits (id)
        )";
        
        try {
            $this->conn->exec($users_table);
            $this->conn->exec($patients_table);
            $this->conn->exec($visits_table);
            $this->conn->exec($medicines_table);
            $this->conn->exec($lab_tests_table);
            $this->conn->exec($imaging_table);
            $this->conn->exec($vitals_table);
            
            // Insert default admin user if not exists
            $check_admin = $this->conn->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
            $check_admin->execute(['Admin@gmail.com']);
            
            if ($check_admin->fetchColumn() == 0) {
                $insert_admin = $this->conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
                $hashed_password = password_hash('Admin1234', PASSWORD_DEFAULT);
                $insert_admin->execute(['Admin@gmail.com', $hashed_password, 'admin']);
            }
            
        } catch(PDOException $e) {
            echo "Table Creation Error: " . $e->getMessage();
        }
    }
}
?>
