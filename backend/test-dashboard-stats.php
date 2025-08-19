<?php
// Simulate a GET request
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once 'config/database.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    
    echo "=== TESTING DASHBOARD STATS ===\n";
    
    $response = [
        'success' => true,
        'data' => [
            'totalPatients' => 0,
            'todaysVisits' => 0,
            'pendingLabTests' => 0,
            'pendingXrays' => 0,
            'todaysAppointments' => 0
        ]
    ];
    
    // Get total patients count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM patients");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['data']['totalPatients'] = (int)$result['count'];
    echo "Total patients: " . $response['data']['totalPatients'] . "\n";
    
    // Get today's visits count
    $today = date('Y-m-d');
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM visits WHERE DATE(visit_date) = ?");
    $stmt->execute([$today]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['data']['todaysVisits'] = (int)$result['count'];
    echo "Today's visits: " . $response['data']['todaysVisits'] . "\n";
    
    // Count lab tests from visits
    $stmt = $db->prepare("SELECT lab_tests, imaging_tests FROM visits WHERE (lab_tests IS NOT NULL AND lab_tests != '' AND lab_tests != '[]') OR (imaging_tests IS NOT NULL AND imaging_tests != '' AND imaging_tests != '[]')");
    $stmt->execute();
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $pendingLabTests = 0;
    $pendingXrays = 0;
    
    foreach ($visits as $visit) {
        // Count lab tests
        if (!empty($visit['lab_tests'])) {
            $labTests = json_decode($visit['lab_tests'], true);
            if (is_array($labTests)) {
                foreach ($labTests as $test) {
                    if (!empty($test['test_name'])) {
                        if (($test['status'] ?? 'pending') === 'pending') {
                            $pendingLabTests++;
                        }
                    }
                }
            }
        }
        
        // Count imaging tests
        if (!empty($visit['imaging_tests'])) {
            $imagingTests = json_decode($visit['imaging_tests'], true);
            if (is_array($imagingTests)) {
                foreach ($imagingTests as $test) {
                    if (!empty($test['test_name'])) {
                        if (($test['status'] ?? 'pending') === 'pending') {
                            $pendingXrays++;
                        }
                    }
                }
            }
        }
    }
    
    $response['data']['pendingLabTests'] = $pendingLabTests;
    $response['data']['pendingXrays'] = $pendingXrays;
    
    echo "Pending lab tests: " . $pendingLabTests . "\n";
    echo "Pending imaging tests: " . $pendingXrays . "\n";
    
    // Appointments (will be 0 since we don't have appointments table with proper structure)
    echo "Today's appointments: 0 (no appointments table)\n";
    
    echo "\nDashboard stats response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
