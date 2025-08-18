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

// Simple AI summary generator (in production, integrate with real AI API)
function generateAISummary($visit_data, $medicines, $lab_tests, $imaging_tests, $vitals) {
    $summary = "Visit Summary:\n\n";
    
    if (!empty($visit_data['chief_complaint'])) {
        $summary .= "Chief Complaint: " . $visit_data['chief_complaint'] . "\n";
    }
    
    if (!empty($visit_data['diagnosis'])) {
        $summary .= "Diagnosis: " . $visit_data['diagnosis'] . "\n";
    }
    
    if (!empty($visit_data['problems'])) {
        $summary .= "Problems Identified: " . $visit_data['problems'] . "\n";
    }
    
    if (!empty($medicines)) {
        $summary .= "\nMedications Prescribed:\n";
        foreach ($medicines as $med) {
            $summary .= "- " . $med['medicine_name'] . " (" . $med['dosage'] . ") - " . $med['frequency'] . " for " . $med['duration'] . "\n";
        }
    }
    
    if (!empty($lab_tests)) {
        $summary .= "\nLab Tests Ordered:\n";
        foreach ($lab_tests as $test) {
            $summary .= "- " . $test['test_name'] . " (" . $test['status'] . ")\n";
        }
    }
    
    if (!empty($imaging_tests)) {
        $summary .= "\nImaging Tests:\n";
        foreach ($imaging_tests as $test) {
            $summary .= "- " . $test['test_name'] . " of " . $test['body_part'] . " (" . $test['status'] . ")\n";
        }
    }
    
    if (!empty($vitals)) {
        $summary .= "\nVital Signs:\n";
        $v = $vitals[0]; // Latest vitals
        if ($v['temperature']) $summary .= "- Temperature: " . $v['temperature'] . "°F\n";
        if ($v['blood_pressure_systolic'] && $v['blood_pressure_diastolic']) {
            $summary .= "- Blood Pressure: " . $v['blood_pressure_systolic'] . "/" . $v['blood_pressure_diastolic'] . " mmHg\n";
        }
        if ($v['heart_rate']) $summary .= "- Heart Rate: " . $v['heart_rate'] . " bpm\n";
        if ($v['weight']) $summary .= "- Weight: " . $v['weight'] . " kg\n";
    }
    
    if (!empty($visit_data['treatment_plan'])) {
        $summary .= "\nTreatment Plan: " . $visit_data['treatment_plan'] . "\n";
    }
    
    $summary .= "\nRecommendations for next visit:\n";
    $summary .= "- Follow up on prescribed medications\n";
    $summary .= "- Review lab test results if pending\n";
    $summary .= "- Monitor symptoms and vital signs\n";
    
    return $summary;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['patient_id'])) {
            // Get all visits for a patient
            $stmt = $db->prepare("
                SELECT v.*, p.first_name, p.last_name 
                FROM visits v 
                JOIN patients p ON v.patient_id = p.id 
                WHERE v.patient_id = ? 
                ORDER BY v.visit_date DESC
            ");
            $stmt->execute([$_GET['patient_id']]);
            $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get additional data for each visit
            foreach ($visits as &$visit) {
                // Get medicines
                $med_stmt = $db->prepare("SELECT * FROM medicines WHERE visit_id = ?");
                $med_stmt->execute([$visit['id']]);
                $visit['medicines'] = $med_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get lab tests
                $lab_stmt = $db->prepare("SELECT * FROM lab_tests WHERE visit_id = ?");
                $lab_stmt->execute([$visit['id']]);
                $visit['lab_tests'] = $lab_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get imaging tests
                $img_stmt = $db->prepare("SELECT * FROM imaging_tests WHERE visit_id = ?");
                $img_stmt->execute([$visit['id']]);
                $visit['imaging_tests'] = $img_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get vital signs
                $vital_stmt = $db->prepare("SELECT * FROM vital_signs WHERE visit_id = ?");
                $vital_stmt->execute([$visit['id']]);
                $visit['vital_signs'] = $vital_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($visits);
        } else if (isset($_GET['id'])) {
            // Get specific visit
            $stmt = $db->prepare("
                SELECT v.*, p.first_name, p.last_name 
                FROM visits v 
                JOIN patients p ON v.patient_id = p.id 
                WHERE v.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $visit = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($visit) {
                // Get additional data
                $med_stmt = $db->prepare("SELECT * FROM medicines WHERE visit_id = ?");
                $med_stmt->execute([$visit['id']]);
                $visit['medicines'] = $med_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $lab_stmt = $db->prepare("SELECT * FROM lab_tests WHERE visit_id = ?");
                $lab_stmt->execute([$visit['id']]);
                $visit['lab_tests'] = $lab_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $img_stmt = $db->prepare("SELECT * FROM imaging_tests WHERE visit_id = ?");
                $img_stmt->execute([$visit['id']]);
                $visit['imaging_tests'] = $img_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $vital_stmt = $db->prepare("SELECT * FROM vital_signs WHERE visit_id = ?");
                $vital_stmt->execute([$visit['id']]);
                $visit['vital_signs'] = $vital_stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($visit);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Visit not found']);
            }
        } else {
            // Get all visits
            $stmt = $db->query("
                SELECT v.*, p.first_name, p.last_name 
                FROM visits v 
                JOIN patients p ON v.patient_id = p.id 
                ORDER BY v.visit_date DESC
            ");
            $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($visits);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['patient_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Patient ID is required']);
            exit;
        }
        
        try {
            $db->beginTransaction();
            
            // Insert visit
            $visit_stmt = $db->prepare("
                INSERT INTO visits (patient_id, chief_complaint, diagnosis, problems, 
                                  treatment_plan, notes, doctor_name) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $visit_stmt->execute([
                $input['patient_id'],
                $input['chief_complaint'] ?? null,
                $input['diagnosis'] ?? null,
                $input['problems'] ?? null,
                $input['treatment_plan'] ?? null,
                $input['notes'] ?? null,
                $input['doctor_name'] ?? null
            ]);
            
            $visit_id = $db->lastInsertId();
            
            // Insert medicines
            if (isset($input['medicines']) && is_array($input['medicines'])) {
                $med_stmt = $db->prepare("
                    INSERT INTO medicines (visit_id, medicine_name, dosage, frequency, duration, instructions) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                foreach ($input['medicines'] as $medicine) {
                    $med_stmt->execute([
                        $visit_id,
                        $medicine['medicine_name'],
                        $medicine['dosage'] ?? null,
                        $medicine['frequency'] ?? null,
                        $medicine['duration'] ?? null,
                        $medicine['instructions'] ?? null
                    ]);
                }
            }
            
            // Insert lab tests
            if (isset($input['lab_tests']) && is_array($input['lab_tests'])) {
                $lab_stmt = $db->prepare("
                    INSERT INTO lab_tests (visit_id, test_name, test_type, notes) 
                    VALUES (?, ?, ?, ?)
                ");
                
                foreach ($input['lab_tests'] as $test) {
                    $lab_stmt->execute([
                        $visit_id,
                        $test['test_name'],
                        $test['test_type'] ?? null,
                        $test['notes'] ?? null
                    ]);
                }
            }
            
            // Insert imaging tests
            if (isset($input['imaging_tests']) && is_array($input['imaging_tests'])) {
                $img_stmt = $db->prepare("
                    INSERT INTO imaging_tests (visit_id, test_name, test_type, body_part, notes) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                foreach ($input['imaging_tests'] as $test) {
                    $img_stmt->execute([
                        $visit_id,
                        $test['test_name'],
                        $test['test_type'] ?? 'X-ray',
                        $test['body_part'] ?? null,
                        $test['notes'] ?? null
                    ]);
                }
            }
            
            // Insert vital signs
            if (isset($input['vital_signs'])) {
                $vital_stmt = $db->prepare("
                    INSERT INTO vital_signs (visit_id, temperature, blood_pressure_systolic, 
                                           blood_pressure_diastolic, heart_rate, respiratory_rate, 
                                           oxygen_saturation, weight, height, bmi) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $vs = $input['vital_signs'];
                $vital_stmt->execute([
                    $visit_id,
                    $vs['temperature'] ?? null,
                    $vs['blood_pressure_systolic'] ?? null,
                    $vs['blood_pressure_diastolic'] ?? null,
                    $vs['heart_rate'] ?? null,
                    $vs['respiratory_rate'] ?? null,
                    $vs['oxygen_saturation'] ?? null,
                    $vs['weight'] ?? null,
                    $vs['height'] ?? null,
                    $vs['bmi'] ?? null
                ]);
            }
            
            // Generate AI summary
            $medicines = $input['medicines'] ?? [];
            $lab_tests = $input['lab_tests'] ?? [];
            $imaging_tests = $input['imaging_tests'] ?? [];
            $vitals = isset($input['vital_signs']) ? [$input['vital_signs']] : [];
            
            $ai_summary = generateAISummary($input, $medicines, $lab_tests, $imaging_tests, $vitals);
            
            // Update visit with AI summary
            $summary_stmt = $db->prepare("UPDATE visits SET ai_summary = ? WHERE id = ?");
            $summary_stmt->execute([$ai_summary, $visit_id]);
            
            $db->commit();
            
            echo json_encode([
                'success' => true, 
                'visit_id' => $visit_id, 
                'ai_summary' => $ai_summary,
                'message' => 'Visit created successfully'
            ]);
            
        } catch(PDOException $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
