<?php
// Simulate a GET request for lab tests
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once 'config/database.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    
    echo "=== TESTING LAB TESTS API ===\n";
    
    $query = "SELECT 
                v.id as visit_id,
                v.patient_id,
                v.visit_date,
                v.lab_tests,
                v.imaging_tests,
                p.first_name,
                p.last_name,
                p.phone,
                p.email
              FROM visits v
              LEFT JOIN patients p ON v.patient_id = p.id
              WHERE (v.lab_tests IS NOT NULL AND v.lab_tests != '' AND v.lab_tests != '[]') 
                 OR (v.imaging_tests IS NOT NULL AND v.imaging_tests != '' AND v.imaging_tests != '[]')
              ORDER BY v.visit_date DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labTests = [];
    
    foreach ($visits as $visit) {
        $patientName = trim($visit['first_name'] . ' ' . $visit['last_name']);
        
        // Process lab tests
        if (!empty($visit['lab_tests'])) {
            $labTestsData = json_decode($visit['lab_tests'], true);
            if (is_array($labTestsData)) {
                foreach ($labTestsData as $index => $test) {
                    if (!empty($test['test_name'])) {
                        $labTests[] = [
                            'id' => $visit['visit_id'] . '_lab_' . $index,
                            'visit_id' => $visit['visit_id'],
                            'patient_id' => $visit['patient_id'],
                            'patient_name' => $patientName,
                            'patient_phone' => $visit['phone'],
                            'patient_email' => $visit['email'],
                            'test_name' => $test['test_name'],
                            'test_type' => 'lab',
                            'status' => $test['status'] ?? 'pending',
                            'order_date' => $visit['visit_date'],
                            'results' => $test['results'] ?? '',
                            'notes' => $test['notes'] ?? '',
                            'normal_range' => $test['normal_range'] ?? '',
                            'priority' => $test['priority'] ?? 'normal',
                            'technician' => $test['technician'] ?? '',
                            'report_date' => $test['report_date'] ?? null
                        ];
                    }
                }
            }
        }
        
        // Process imaging tests
        if (!empty($visit['imaging_tests'])) {
            $imagingTestsData = json_decode($visit['imaging_tests'], true);
            if (is_array($imagingTestsData)) {
                foreach ($imagingTestsData as $index => $test) {
                    if (!empty($test['test_name'])) {
                        $labTests[] = [
                            'id' => $visit['visit_id'] . '_imaging_' . $index,
                            'visit_id' => $visit['visit_id'],
                            'patient_id' => $visit['patient_id'],
                            'patient_name' => $patientName,
                            'patient_phone' => $visit['phone'],
                            'patient_email' => $visit['email'],
                            'test_name' => $test['test_name'],
                            'test_type' => 'imaging',
                            'status' => $test['status'] ?? 'pending',
                            'order_date' => $visit['visit_date'],
                            'results' => $test['results'] ?? '',
                            'notes' => $test['notes'] ?? '',
                            'normal_range' => $test['normal_range'] ?? '',
                            'priority' => $test['priority'] ?? 'normal',
                            'technician' => $test['technician'] ?? '',
                            'report_date' => $test['report_date'] ?? null
                        ];
                    }
                }
            }
        }
    }
    
    // Sort by order date (newest first)
    usort($labTests, function($a, $b) {
        return strtotime($b['order_date']) - strtotime($a['order_date']);
    });
    
    echo "Found " . count($labTests) . " lab tests:\n\n";
    
    foreach ($labTests as $test) {
        echo "Test ID: " . $test['id'] . "\n";
        echo "Patient: " . $test['patient_name'] . "\n";
        echo "Test: " . $test['test_name'] . "\n";
        echo "Type: " . $test['test_type'] . "\n";
        echo "Status: " . $test['status'] . "\n";
        echo "Results: " . ($test['results'] ? $test['results'] : 'No results yet') . "\n";
        echo "---\n";
    }
    
    $response = [
        'success' => true,
        'data' => $labTests,
        'total' => count($labTests),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo "\nAPI Response would be:\n";
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
