<?php
require_once 'config/database.php';

try {
    $db = new Database();
    $conn = $db->connect();
    
    echo "=== CHECKING DATABASE STRUCTURE ===\n";
    
    // Check if visits table has lab_tests and imaging_tests columns
    $stmt = $conn->query("PRAGMA table_info(visits)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Visits table columns:\n";
    foreach ($columns as $column) {
        echo "- " . $column['name'] . " (" . $column['type'] . ")\n";
    }
    echo "\n";
    
    // Check if we need to add missing columns
    $hasLabTests = false;
    $hasImagingTests = false;
    
    foreach ($columns as $column) {
        if ($column['name'] === 'lab_tests') $hasLabTests = true;
        if ($column['name'] === 'imaging_tests') $hasImagingTests = true;
    }
    
    // Add missing columns if needed
    if (!$hasLabTests) {
        echo "Adding lab_tests column...\n";
        $conn->exec("ALTER TABLE visits ADD COLUMN lab_tests TEXT");
    }
    
    if (!$hasImagingTests) {
        echo "Adding imaging_tests column...\n";
        $conn->exec("ALTER TABLE visits ADD COLUMN imaging_tests TEXT");
    }
    
    echo "=== CHECKING VISITS WITH LAB TESTS ===\n";
    
    $stmt = $conn->query('SELECT id, patient_id, visit_date, lab_tests, imaging_tests FROM visits LIMIT 10');
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total visits found: " . count($visits) . "\n\n";
    
    foreach ($visits as $visit) {
        echo "Visit ID: " . $visit['id'] . "\n";
        echo "Patient ID: " . $visit['patient_id'] . "\n";
        echo "Visit Date: " . $visit['visit_date'] . "\n";
        echo "Lab Tests: " . ($visit['lab_tests'] ? $visit['lab_tests'] : 'None') . "\n";
        echo "Imaging Tests: " . ($visit['imaging_tests'] ? $visit['imaging_tests'] : 'None') . "\n";
        echo "---\n";
    }
    
    // Count lab tests
    $stmt = $conn->query('SELECT COUNT(*) as count FROM visits WHERE lab_tests IS NOT NULL AND lab_tests != ""');
    $labCount = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nVisits with lab tests: " . $labCount['count'] . "\n";
    
    // Count imaging tests
    $stmt = $conn->query('SELECT COUNT(*) as count FROM visits WHERE imaging_tests IS NOT NULL AND imaging_tests != ""');
    $imagingCount = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Visits with imaging tests: " . $imagingCount['count'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
