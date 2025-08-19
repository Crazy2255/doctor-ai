<?php
// Simple test to check lab-tests API
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

echo "Testing lab-tests API...\n";

try {
    require_once 'config/database.php';
    echo "Database config loaded\n";
    
    $database = new Database();
    $db = $database->connect();
    echo "Database connected\n";
    
    // Test query
    $query = "SELECT COUNT(*) as count FROM visits WHERE (lab_tests IS NOT NULL AND lab_tests != '' AND lab_tests != '[]') OR (imaging_tests IS NOT NULL AND imaging_tests != '' AND imaging_tests != '[]')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Found " . $result['count'] . " visits with lab/imaging tests\n";
    
    // Test the actual lab-tests API logic
    include 'api/lab-tests.php';
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
