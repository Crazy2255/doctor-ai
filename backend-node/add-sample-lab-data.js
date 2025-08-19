const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'clinic.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding sample lab test data to existing visits...');

// Sample lab tests data to add to existing visits
const sampleLabTests = [
  {
    test_name: "Complete Blood Count (CBC)",
    status: "pending",
    normal_range: "4.5-11.0 x10³/µL",
    priority: "normal",
    results: "",
    notes: ""
  },
  {
    test_name: "Lipid Panel",
    status: "completed",
    normal_range: "Total: <200 mg/dL",
    priority: "high",
    results: "Total Cholesterol: 185 mg/dL, LDL: 110 mg/dL, HDL: 45 mg/dL, Triglycerides: 150 mg/dL",
    notes: "Slightly elevated LDL, recommend dietary changes"
  },
  {
    test_name: "Thyroid Function Test",
    status: "in-progress",
    normal_range: "TSH: 0.4-4.0 mIU/L",
    priority: "normal",
    results: "",
    notes: "Patient reports fatigue and weight gain"
  }
];

const sampleImagingTests = [
  {
    test_name: "Chest X-Ray",
    status: "pending",
    normal_range: "Clear lung fields",
    priority: "urgent",
    results: "",
    notes: "Patient has persistent cough"
  },
  {
    test_name: "Abdominal Ultrasound",
    status: "completed",
    normal_range: "Normal organ structure",
    priority: "normal",
    results: "All organs appear normal in size and structure. No masses or fluid collections detected.",
    notes: "Follow-up in 6 months if symptoms persist"
  }
];

db.serialize(() => {
  // Get all visits
  db.all("SELECT id, patient_id FROM visits", (err, visits) => {
    if (err) {
      console.error('Error fetching visits:', err);
      return;
    }
    
    console.log(`Found ${visits.length} visits to update`);
    
    let updatedCount = 0;
    
    visits.forEach((visit, index) => {
      // Assign different combinations of tests to different visits
      let labTestsToAssign = [];
      let imagingTestsToAssign = [];
      
      // Distribute tests across visits
      if (index % 3 === 0) {
        labTestsToAssign = [sampleLabTests[0], sampleLabTests[1]];
        imagingTestsToAssign = [sampleImagingTests[0]];
      } else if (index % 3 === 1) {
        labTestsToAssign = [sampleLabTests[2]];
        imagingTestsToAssign = [sampleImagingTests[1]];
      } else {
        labTestsToAssign = [sampleLabTests[0]];
        imagingTestsToAssign = [];
      }
      
      // Update visit with lab tests and imaging tests
      if (labTestsToAssign.length > 0 || imagingTestsToAssign.length > 0) {
        const labTestsJson = JSON.stringify(labTestsToAssign);
        const imagingTestsJson = JSON.stringify(imagingTestsToAssign);
        
        db.run(
          "UPDATE visits SET lab_tests = ?, imaging_tests = ? WHERE id = ?",
          [labTestsJson, imagingTestsJson, visit.id],
          function(err) {
            if (err) {
              console.error(`Error updating visit ${visit.id}:`, err);
            } else {
              updatedCount++;
              console.log(`✅ Updated visit ${visit.id} with ${labTestsToAssign.length} lab tests and ${imagingTestsToAssign.length} imaging tests`);
            }
            
            // Check if all updates are done
            if (updatedCount + (visits.length - updatedCount) === visits.length) {
              setTimeout(() => {
                console.log(`\n🎉 Successfully updated ${updatedCount} visits with lab test data!`);
                db.close(() => {
                  console.log('Database connection closed.');
                  process.exit(0);
                });
              }, 500);
            }
          }
        );
      }
    });
  });
});
