<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get specific patient
            $stmt = $db->prepare("SELECT * FROM patients WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $patient = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($patient) {
                echo json_encode($patient);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Patient not found']);
            }
        } else {
            // Get all patients
            $stmt = $db->query("SELECT * FROM patients ORDER BY created_at DESC");
            $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($patients);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required_fields = ['first_name', 'last_name'];
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                exit;
            }
        }
        
        try {
            $stmt = $db->prepare("
                INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, 
                                    gender, address, emergency_contact, emergency_phone, 
                                    medical_history, allergies) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['first_name'],
                $input['last_name'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['date_of_birth'] ?? null,
                $input['gender'] ?? null,
                $input['address'] ?? null,
                $input['emergency_contact'] ?? null,
                $input['emergency_phone'] ?? null,
                $input['medical_history'] ?? null,
                $input['allergies'] ?? null
            ]);
            
            $patient_id = $db->lastInsertId();
            echo json_encode(['success' => true, 'patient_id' => $patient_id, 'message' => 'Patient created successfully']);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Patient ID is required']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $db->prepare("
                UPDATE patients SET 
                    first_name = ?, last_name = ?, email = ?, phone = ?, 
                    date_of_birth = ?, gender = ?, address = ?, 
                    emergency_contact = ?, emergency_phone = ?, 
                    medical_history = ?, allergies = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $stmt->execute([
                $input['first_name'],
                $input['last_name'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['date_of_birth'] ?? null,
                $input['gender'] ?? null,
                $input['address'] ?? null,
                $input['emergency_contact'] ?? null,
                $input['emergency_phone'] ?? null,
                $input['medical_history'] ?? null,
                $input['allergies'] ?? null,
                $_GET['id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Patient updated successfully']);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Patient ID is required']);
            exit;
        }
        
        try {
            $stmt = $db->prepare("DELETE FROM patients WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Patient deleted successfully']);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
