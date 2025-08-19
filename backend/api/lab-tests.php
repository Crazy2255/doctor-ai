<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../config/database.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all lab tests with patient information
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
            
            echo json_encode([
                'success' => true,
                'data' => $labTests,
                'total' => count($labTests),
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            break;
            
        case 'PUT':
            // Update lab test status and results
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['test_id']) || !isset($input['status'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing required fields']);
                exit;
            }
            
            $testId = $input['test_id'];
            $status = $input['status'];
            $results = $input['results'] ?? '';
            $notes = $input['notes'] ?? '';
            
            // Parse test ID to get visit ID and test index
            $parts = explode('_', $testId);
            if (count($parts) < 3) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid test ID format']);
                exit;
            }
            
            $visitId = $parts[0];
            $testType = $parts[1]; // 'lab' or 'imaging'
            $testIndex = intval($parts[2]);
            
            // Get current visit data
            $stmt = $db->prepare("SELECT * FROM visits WHERE id = ?");
            $stmt->execute([$visitId]);
            $visit = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$visit) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Visit not found']);
                exit;
            }
            
            // Update the appropriate test array
            $fieldName = $testType === 'lab' ? 'lab_tests' : 'imaging_tests';
            $testsData = json_decode($visit[$fieldName], true) ?? [];
            
            if (!isset($testsData[$testIndex])) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Test not found']);
                exit;
            }
            
            // Update test data
            $testsData[$testIndex]['status'] = $status;
            $testsData[$testIndex]['results'] = $results;
            $testsData[$testIndex]['notes'] = $notes;
            $testsData[$testIndex]['report_date'] = $status === 'completed' ? date('Y-m-d') : null;
            
            // Update visit in database
            $stmt = $db->prepare("UPDATE visits SET {$fieldName} = ? WHERE id = ?");
            $success = $stmt->execute([json_encode($testsData), $visitId]);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Test updated successfully',
                    'test_id' => $testId,
                    'status' => $status
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to update test']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
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
