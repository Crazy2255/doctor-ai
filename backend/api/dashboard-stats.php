<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    
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
    
    // Get today's visits count
    $today = date('Y-m-d');
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM visits WHERE DATE(visit_date) = ?");
    $stmt->execute([$today]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['data']['todaysVisits'] = (int)$result['count'];
    
    // Get pending lab tests count (count from visits JSON data)
    $stmt = $db->prepare("SELECT lab_tests, imaging_tests FROM visits WHERE (lab_tests IS NOT NULL AND lab_tests != '' AND lab_tests != '[]') OR (imaging_tests IS NOT NULL AND imaging_tests != '' AND imaging_tests != '[]')");
    $stmt->execute();
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $pendingLabTests = 0;
    $pendingXrays = 0;
    
    foreach ($visits as $visit) {
        // Count pending lab tests
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
        
        // Count pending imaging tests
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
    
    // Get today's appointments count (if appointments table exists)
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status != 'cancelled'");
        $stmt->execute([$today]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['data']['todaysAppointments'] = (int)$result['count'];
    } catch (PDOException $e) {
        // If appointments table doesn't exist, default to 0
        $response['data']['todaysAppointments'] = 0;
    }
    
    // Add additional statistics
    $response['data']['timestamp'] = date('Y-m-d H:i:s');
    $response['data']['last_updated'] = time();
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
