<?php
require_once 'config/database.php';

try {
    $db = new Database();
    $conn = $db->connect();
    
    echo "=== CREATING SAMPLE DATA ===\n";
    
    // First, create a sample patient if none exists
    $stmt = $conn->query('SELECT COUNT(*) as count FROM patients');
    $patientCount = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($patientCount['count'] == 0) {
        echo "Creating sample patients...\n";
        
        $patients = [
            ['John', 'Doe', 'john.doe@email.com', '+1234567890', '1985-06-15', 'Male', '123 Main St, City', 'Jane Doe', '+1234567891', 'No significant medical history', 'None known'],
            ['Jane', 'Smith', 'jane.smith@email.com', '+1234567892', '1990-03-22', 'Female', '456 Oak Ave, City', 'John Smith', '+1234567893', 'Diabetes Type 2', 'Penicillin'],
            ['Michael', 'Johnson', 'michael.j@email.com', '+1234567894', '1978-11-08', 'Male', '789 Pine St, City', 'Sarah Johnson', '+1234567895', 'Hypertension', 'None known']
        ];
        
        foreach ($patients as $patient) {
            $stmt = $conn->prepare("INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, medical_history, allergies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute($patient);
            echo "Created patient: " . $patient[0] . " " . $patient[1] . "\n";
        }
    }
    
    // Now create sample visits with lab tests
    echo "\nCreating sample visits with lab tests...\n";
    
    $patients = $conn->query('SELECT id, first_name, last_name FROM patients LIMIT 3')->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($patients as $patient) {
        // Create visit with lab tests
        $visitData = [
            'patient_id' => $patient['id'],
            'visit_date' => date('Y-m-d H:i:s'),
            'chief_complaint' => 'Routine checkup and lab work',
            'diagnosis' => 'General health assessment',
            'problems' => 'Patient reports feeling tired recently',
            'treatment_plan' => 'Lab tests ordered to check overall health status',
            'notes' => 'Patient appears healthy, ordered routine blood work',
            'doctor_name' => 'Dr. Smith',
            'lab_tests' => json_encode([
                [
                    'test_name' => 'Complete Blood Count (CBC)',
                    'test_type' => 'Blood Test',
                    'notes' => 'Routine blood work to check overall health',
                    'status' => 'pending',
                    'priority' => 'normal',
                    'normal_range' => 'WBC: 4.5-11.0, RBC: 4.7-6.1',
                    'results' => '',
                    'report_date' => null
                ],
                [
                    'test_name' => 'Lipid Panel',
                    'test_type' => 'Blood Test',
                    'notes' => 'Check cholesterol levels',
                    'status' => 'pending',
                    'priority' => 'normal',
                    'normal_range' => 'Total Cholesterol: <200 mg/dL',
                    'results' => '',
                    'report_date' => null
                ]
            ]),
            'imaging_tests' => json_encode([
                [
                    'test_name' => 'Chest X-Ray',
                    'test_type' => 'X-ray',
                    'body_part' => 'Chest',
                    'notes' => 'Routine chest examination',
                    'status' => 'pending',
                    'priority' => 'normal',
                    'results' => '',
                    'report_date' => null
                ]
            ])
        ];
        
        $stmt = $conn->prepare("INSERT INTO visits (patient_id, visit_date, chief_complaint, diagnosis, problems, treatment_plan, notes, doctor_name, lab_tests, imaging_tests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $visitData['patient_id'],
            $visitData['visit_date'],
            $visitData['chief_complaint'],
            $visitData['diagnosis'],
            $visitData['problems'],
            $visitData['treatment_plan'],
            $visitData['notes'],
            $visitData['doctor_name'],
            $visitData['lab_tests'],
            $visitData['imaging_tests']
        ]);
        
        echo "Created visit for patient: " . $patient['first_name'] . " " . $patient['last_name'] . "\n";
    }
    
    // Create one visit with completed lab results
    if (count($patients) > 0) {
        $patient = $patients[0];
        $visitData = [
            'patient_id' => $patient['id'],
            'visit_date' => date('Y-m-d H:i:s', strtotime('-2 days')),
            'chief_complaint' => 'Follow-up on previous lab results',
            'diagnosis' => 'Lab results review',
            'problems' => 'Patient had elevated cholesterol',
            'treatment_plan' => 'Dietary changes and medication',
            'notes' => 'Lab results show improvement',
            'doctor_name' => 'Dr. Smith',
            'lab_tests' => json_encode([
                [
                    'test_name' => 'Liver Function Test',
                    'test_type' => 'Blood Test',
                    'notes' => 'Check liver enzymes',
                    'status' => 'completed',
                    'priority' => 'high',
                    'normal_range' => 'ALT: 7-56 U/L, AST: 10-40 U/L',
                    'results' => 'ALT: 45 U/L (Normal), AST: 32 U/L (Normal). Liver function within normal limits.',
                    'report_date' => date('Y-m-d', strtotime('-1 day'))
                ],
                [
                    'test_name' => 'Thyroid Function Test',
                    'test_type' => 'Blood Test',
                    'notes' => 'Check thyroid hormones',
                    'status' => 'completed',
                    'priority' => 'normal',
                    'normal_range' => 'TSH: 0.4-4.0 mIU/L',
                    'results' => 'TSH: 2.5 mIU/L (Normal). Thyroid function normal.',
                    'report_date' => date('Y-m-d', strtotime('-1 day'))
                ]
            ])
        ];
        
        $stmt = $conn->prepare("INSERT INTO visits (patient_id, visit_date, chief_complaint, diagnosis, problems, treatment_plan, notes, doctor_name, lab_tests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $visitData['patient_id'],
            $visitData['visit_date'],
            $visitData['chief_complaint'],
            $visitData['diagnosis'],
            $visitData['problems'],
            $visitData['treatment_plan'],
            $visitData['notes'],
            $visitData['doctor_name'],
            $visitData['lab_tests']
        ]);
        
        echo "Created visit with completed lab results for: " . $patient['first_name'] . " " . $patient['last_name'] . "\n";
    }
    
    echo "\n=== SAMPLE DATA CREATED SUCCESSFULLY ===\n";
    
    // Show summary
    $stmt = $conn->query('SELECT COUNT(*) as count FROM patients');
    $patientCount = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $stmt = $conn->query('SELECT COUNT(*) as count FROM visits');
    $visitCount = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $stmt = $conn->query('SELECT COUNT(*) as count FROM visits WHERE lab_tests IS NOT NULL AND lab_tests != ""');
    $labTestCount = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Total patients: " . $patientCount['count'] . "\n";
    echo "Total visits: " . $visitCount['count'] . "\n";
    echo "Visits with lab tests: " . $labTestCount['count'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
