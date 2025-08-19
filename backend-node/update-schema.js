const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'clinic.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding missing columns to visits table...');

// Add lab_tests and imaging_tests columns to visits table
db.serialize(() => {
  // Check if lab_tests column exists
  db.all("PRAGMA table_info(visits)", (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return;
    }
    
    const hasLabTests = columns.some(col => col.name === 'lab_tests');
    const hasImagingTests = columns.some(col => col.name === 'imaging_tests');
    
    if (!hasLabTests) {
      console.log('Adding lab_tests column...');
      db.run('ALTER TABLE visits ADD COLUMN lab_tests TEXT', (err) => {
        if (err) {
          console.error('Error adding lab_tests column:', err);
        } else {
          console.log('✅ lab_tests column added successfully');
        }
      });
    } else {
      console.log('✅ lab_tests column already exists');
    }
    
    if (!hasImagingTests) {
      console.log('Adding imaging_tests column...');
      db.run('ALTER TABLE visits ADD COLUMN imaging_tests TEXT', (err) => {
        if (err) {
          console.error('Error adding imaging_tests column:', err);
        } else {
          console.log('✅ imaging_tests column added successfully');
        }
      });
    } else {
      console.log('✅ imaging_tests column already exists');
    }
    
    // Close database after operations
    setTimeout(() => {
      db.close(() => {
        console.log('Database schema update completed!');
        process.exit(0);
      });
    }, 1000);
  });
});
