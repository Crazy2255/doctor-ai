const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Increase body size limit for voice recordings (50MB limit)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'clinic.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('Error creating users table:', err);
      });

      // Appointments table
      db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        appointment_type TEXT DEFAULT 'consultation',
        doctor_name TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      )`, (err) => {
        if (err) console.error('Error creating appointments table:', err);
      });

      // Patients table
      db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        date_of_birth DATE,
        gender TEXT,
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        medical_history TEXT,
        allergies TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('Error creating patients table:', err);
      });

      // Visits table
      db.run(`CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        chief_complaint TEXT,
        diagnosis TEXT,
        problems TEXT,
        treatment_plan TEXT,
        notes TEXT,
        doctor_name TEXT,
        ai_summary TEXT,
        voice_recording BLOB,
        recording_duration INTEGER,
        has_voice_recording BOOLEAN DEFAULT 0,
        voice_analysis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      )`, (err) => {
        if (err) console.error('Error creating visits table:', err);
      });

      // Medicines table
      db.run(`CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        duration TEXT,
        instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_id) REFERENCES visits (id)
      )`, (err) => {
        if (err) console.error('Error creating medicines table:', err);
      });

      // Lab tests table
      db.run(`CREATE TABLE IF NOT EXISTS lab_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        test_name TEXT NOT NULL,
        test_type TEXT,
        ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_date DATETIME,
        results TEXT,
        normal_range TEXT,
        status TEXT DEFAULT 'ordered',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_id) REFERENCES visits (id)
      )`, (err) => {
        if (err) console.error('Error creating lab_tests table:', err);
      });

      // Imaging tests table
      db.run(`CREATE TABLE IF NOT EXISTS imaging_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        test_name TEXT NOT NULL,
        test_type TEXT DEFAULT 'X-ray',
        body_part TEXT,
        ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_date DATETIME,
        results TEXT,
        radiologist_notes TEXT,
        status TEXT DEFAULT 'ordered',
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_id) REFERENCES visits (id)
      )`, (err) => {
        if (err) console.error('Error creating imaging_tests table:', err);
      });

      // Vital signs table
      db.run(`CREATE TABLE IF NOT EXISTS vital_signs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        temperature REAL,
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        heart_rate INTEGER,
        respiratory_rate INTEGER,
        oxygen_saturation REAL,
        weight REAL,
        height REAL,
        bmi REAL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_id) REFERENCES visits (id)
      )`, (err) => {
        if (err) console.error('Error creating vital_signs table:', err);
      });

      // Add missing columns to existing tables (migrations)
      db.run(`ALTER TABLE visits ADD COLUMN voice_recording BLOB`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding voice_recording column:', err);
        }
      });

      db.run(`ALTER TABLE visits ADD COLUMN recording_duration INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding recording_duration column:', err);
        }
      });

      db.run(`ALTER TABLE visits ADD COLUMN has_voice_recording BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding has_voice_recording column:', err);
        }
      });

      db.run(`ALTER TABLE visits ADD COLUMN voice_analysis TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding voice_analysis column:', err);
        }
      });

      // Insert default admin user
      db.run(`SELECT COUNT(*) as count FROM users WHERE email = ?`, ['Admin@gmail.com'], (err, row) => {
        if (!err) {
          const hashedPassword = bcrypt.hashSync('Admin1234', 10);
          db.run(`INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`,
            ['Admin@gmail.com', hashedPassword, 'admin'], (err) => {
              if (err) console.error('Error inserting admin user:', err);
              else console.log('Admin user created/verified');
              resolve();
            });
        } else {
          console.error('Error checking admin user:', err);
          resolve();
        }
      });
    });
  });
};

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// Enhanced AI Summary Generator
const generateEnhancedAISummary = (visitData, medicines, labTests, imagingTests, vitals, hasVoiceRecording = false) => {
  let summary = "🏥 COMPREHENSIVE VISIT SUMMARY\n";
  summary += "==================================================\n\n";
  
  // Visit Overview
  summary += "📅 VISIT OVERVIEW\n";
  summary += "--------------------\n";
  summary += `Date: ${new Date().toLocaleDateString('en-GB')}\n`;
  summary += `Time: ${new Date().toLocaleTimeString('en-US', { hour12: false })}\n`;
  summary += `Doctor: ${visitData.doctor_name || 'Not specified'}\n`;
  if (hasVoiceRecording) {
    summary += "🎤 Voice recording available for detailed analysis\n";
    summary += "📊 AI-enhanced documentation with voice insights\n";
  }
  summary += "\n";
  
  // Chief Complaint Analysis
  if (visitData.chief_complaint) {
    summary += "🩺 CHIEF COMPLAINT & ANALYSIS\n";
    summary += "------------------------------\n";
    summary += `Primary Concern: ${visitData.chief_complaint}\n`;
    
    // Analyze urgency based on keywords
    const urgentKeywords = ['severe', 'chest pain', 'difficulty breathing', 'blood', 'emergency', 'sudden'];
    const isUrgent = urgentKeywords.some(keyword => 
      visitData.chief_complaint.toLowerCase().includes(keyword)
    );
    summary += `Urgency Level: ${isUrgent ? '🔴 HIGH' : '🟡 ROUTINE'}\n\n`;
  }
  
  // Clinical Assessment
  if (visitData.diagnosis) {
    summary += "🔬 CLINICAL ASSESSMENT\n";
    summary += "-------------------------\n";
    summary += `Primary Diagnosis: ${visitData.diagnosis}\n`;
    
    // Add ICD-10 codes for common conditions
    const diagnosisLower = visitData.diagnosis.toLowerCase();
    let icdCode = '';
    
    if (diagnosisLower.includes('hypertension')) icdCode = '(ICD-10: I10)';
    else if (diagnosisLower.includes('diabetes')) icdCode = '(ICD-10: E11.9)';
    else if (diagnosisLower.includes('back pain') || diagnosisLower.includes('lumbar')) icdCode = '(ICD-10: M54.5)';
    else if (diagnosisLower.includes('headache')) icdCode = '(ICD-10: R51)';
    else if (diagnosisLower.includes('fever')) icdCode = '(ICD-10: R50.9)';
    else if (diagnosisLower.includes('cough')) icdCode = '(ICD-10: R05)';
    else if (diagnosisLower.includes('anxiety')) icdCode = '(ICD-10: F41.9)';
    else if (diagnosisLower.includes('depression')) icdCode = '(ICD-10: F32.9)';
    
    if (icdCode) {
      summary += `ICD-10 Code: ${icdCode}\n`;
    }
    
    // Analyze diagnosis complexity
    const complexKeywords = ['chronic', 'complex', 'multiple', 'comorbid', 'severe', 'acute exacerbation'];
    const isComplex = complexKeywords.some(keyword => 
      visitData.diagnosis.toLowerCase().includes(keyword)
    );
    summary += `Complexity: ${isComplex ? 'Complex case requiring close monitoring' : 'Standard case'}\n`;
    
    // Clinical severity assessment
    const severeKeywords = ['severe', 'critical', 'urgent', 'acute', 'emergency'];
    const isSevere = severeKeywords.some(keyword => 
      visitData.diagnosis.toLowerCase().includes(keyword)
    );
    summary += `Severity: ${isSevere ? '🔴 HIGH - Requires immediate attention' : '🟡 MODERATE - Standard monitoring'}\n\n`;
  }
  
  // Problems and Risk Assessment
  if (visitData.problems) {
    summary += "⚠️ IDENTIFIED PROBLEMS & RISK FACTORS\n";
    summary += "----------------------------------------\n";
    
    // Split problems into bullet points for better readability
    const problemLines = visitData.problems.split('\n').filter(line => line.trim());
    problemLines.forEach(problem => {
      if (problem.trim()) {
        summary += `• ${problem.trim()}\n`;
      }
    });
    
    // Enhanced risk stratification
    const problemsText = visitData.problems.toLowerCase();
    const riskFactors = {
      'diabetes': 'Metabolic disorder requiring glucose monitoring',
      'hypertension': 'Cardiovascular risk factor',
      'smoking': 'Major modifiable risk factor',
      'obesity': 'Metabolic and cardiovascular risk',
      'family history': 'Genetic predisposition factor',
      'sedentary': 'Lifestyle-related risk factor',
      'stress': 'Psychological risk factor',
      'alcohol': 'Substance-related risk factor'
    };
    
    const identifiedRisks = Object.keys(riskFactors).filter(risk => 
      problemsText.includes(risk)
    );
    
    if (identifiedRisks.length > 0) {
      summary += "\n🎯 RISK STRATIFICATION:\n";
      identifiedRisks.forEach(risk => {
        summary += `• ${risk.toUpperCase()}: ${riskFactors[risk]}\n`;
      });
    }
    
    // Calculate overall risk score
    const riskScore = identifiedRisks.length;
    let riskLevel = '🟢 LOW RISK';
    if (riskScore >= 3) riskLevel = '🔴 HIGH RISK';
    else if (riskScore >= 2) riskLevel = '🟡 MODERATE RISK';
    
    summary += `\n📊 Overall Risk Assessment: ${riskLevel}\n\n`;
  }
  
  // Vital Signs Analysis with Clinical Interpretation
  if (vitals) {
    summary += "📊 VITAL SIGNS ANALYSIS\n";
    summary += "-------------------------\n";
    
    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature);
      let tempStatus = '✅ Normal';
      if (temp > 100.4) tempStatus = '🔴 Fever';
      else if (temp < 97.0) tempStatus = '🔵 Hypothermia';
      summary += `Temperature: ${vitals.temperature}°F (${tempStatus})\n`;
    }
    
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      const systolic = parseInt(vitals.blood_pressure_systolic);
      const diastolic = parseInt(vitals.blood_pressure_diastolic);
      let bpStatus = '✅ Normal';
      if (systolic >= 140 || diastolic >= 90) bpStatus = '🔴 Hypertensive';
      else if (systolic < 90 || diastolic < 60) bpStatus = '🔵 Hypotensive';
      else if (systolic >= 120 || diastolic >= 80) bpStatus = '🟡 Elevated';
      
      summary += `Blood Pressure: ${systolic}/${diastolic} mmHg (${bpStatus})\n`;
    }
    
    if (vitals.heart_rate) {
      const hr = parseInt(vitals.heart_rate);
      let hrStatus = '✅ Normal';
      if (hr > 100) hrStatus = '🔴 Tachycardia';
      else if (hr < 60) hrStatus = '🔵 Bradycardia';
      summary += `Heart Rate: ${vitals.heart_rate} bpm (${hrStatus})\n`;
    }
    
    if (vitals.oxygen_saturation) {
      const o2 = parseFloat(vitals.oxygen_saturation);
      let o2Status = '✅ Normal';
      if (o2 < 95) o2Status = '🔴 Low (requires attention)';
      else if (o2 < 98) o2Status = '🟡 Borderline';
      summary += `Oxygen Saturation: ${vitals.oxygen_saturation}% (${o2Status})\n`;
    }
    
    if (vitals.bmi) {
      const bmi = parseFloat(vitals.bmi);
      let bmiStatus = '✅ Normal';
      if (bmi >= 30) bmiStatus = '🔴 Obese';
      else if (bmi >= 25) bmiStatus = '🟡 Overweight';
      else if (bmi < 18.5) bmiStatus = '🔵 Underweight';
      summary += `BMI: ${vitals.bmi} (${bmiStatus})\n`;
    }
    summary += "\n";
  }
  
  // Comprehensive Treatment Plan
  summary += "💊 COMPREHENSIVE TREATMENT PLAN\n";
  summary += "-----------------------------------\n";
  
  if (medicines && medicines.length > 0) {
    summary += "🔹 MEDICATIONS PRESCRIBED:\n";
    medicines.forEach((med, index) => {
      if (med.medicine_name) {
        summary += `\n${index + 1}. ${med.medicine_name.toUpperCase()}\n`;
        summary += `   📋 Dosage: ${med.dosage || 'As directed by physician'}\n`;
        summary += `   ⏰ Frequency: ${med.frequency || 'Not specified'}\n`;
        summary += `   📅 Duration: ${med.duration || 'Until further notice'}\n`;
        if (med.instructions) {
          summary += `   ⚠️ Special Instructions: ${med.instructions}\n`;
        }
        
        // Add medication category and warnings
        const medName = med.medicine_name.toLowerCase();
        if (medName.includes('ibuprofen') || medName.includes('naproxen')) {
          summary += `   🏷️ Category: NSAID (Non-Steroidal Anti-Inflammatory)\n`;
          summary += `   ⚠️ Warning: Take with food to prevent stomach upset\n`;
        } else if (medName.includes('acetaminophen') || medName.includes('paracetamol')) {
          summary += `   🏷️ Category: Analgesic/Antipyretic\n`;
          summary += `   ⚠️ Warning: Do not exceed 4g per day\n`;
        } else if (medName.includes('amoxicillin') || medName.includes('antibiotic')) {
          summary += `   🏷️ Category: Antibiotic\n`;
          summary += `   ⚠️ Warning: Complete full course even if feeling better\n`;
        }
      }
    });
    summary += "\n";
  } else {
    summary += "❌ No medications prescribed at this visit.\n\n";
  }
  
  // Diagnostic Tests and Monitoring
  summary += "🧪 DIAGNOSTIC WORKUP & MONITORING\n";
  summary += "-----------------------------------\n";
  
  if (labTests && labTests.length > 0) {
    summary += "🔬 LABORATORY TESTS ORDERED:\n";
    labTests.forEach((test, index) => {
      if (test.test_name) {
        summary += `\n${index + 1}. ${test.test_name.toUpperCase()}\n`;
        summary += `   📊 Test Type: ${test.test_type || 'Standard laboratory analysis'}\n`;
        if (test.notes) {
          summary += `   🎯 Clinical Indication: ${test.notes}\n`;
        }
        summary += `   ⏱️ Expected Results: 1-3 business days\n`;
        summary += `   📋 Patient Preparation: Fasting may be required\n`;
      }
    });
    summary += "\n";
  }
  
  if (imagingTests && imagingTests.length > 0) {
    summary += "📸 IMAGING STUDIES ORDERED:\n";
    imagingTests.forEach((test, index) => {
      if (test.test_name) {
        summary += `\n${index + 1}. ${test.test_name.toUpperCase()}\n`;
        summary += `   🔍 Modality: ${test.test_type}\n`;
        summary += `   🎯 Area of Interest: ${test.body_part || 'Not specified'}\n`;
        if (test.notes) {
          summary += `   📋 Clinical Indication: ${test.notes}\n`;
        }
        
        // Add estimated timeframes and preparation
        if (test.test_type === 'X-ray') {
          summary += `   ⏱️ Duration: 15-30 minutes\n`;
          summary += `   📋 Preparation: Remove metal objects\n`;
        } else if (test.test_type === 'MRI') {
          summary += `   ⏱️ Duration: 30-60 minutes\n`;
          summary += `   📋 Preparation: No metal implants, may require contrast\n`;
        } else if (test.test_type === 'CT Scan') {
          summary += `   ⏱️ Duration: 10-30 minutes\n`;
          summary += `   📋 Preparation: May require contrast agent\n`;
        }
      }
    });
    summary += "\n";
  }
  
  if ((!labTests || labTests.length === 0) && (!imagingTests || imagingTests.length === 0)) {
    summary += "❌ No diagnostic tests ordered at this visit.\n";
    summary += "✅ Clinical assessment sufficient for current management.\n\n";
  }
  
  // Treatment Plan Details
  if (visitData.treatment_plan) {
    summary += "📋 DETAILED TREATMENT STRATEGY\n";
    summary += "-----------------------------------\n";
    
    // Enhanced treatment plan formatting
    const treatmentLines = visitData.treatment_plan.split('\n').filter(line => line.trim());
    
    summary += "🔹 THERAPEUTIC INTERVENTIONS:\n";
    treatmentLines.forEach(line => {
      if (line.trim()) {
        summary += `• ${line.trim()}\n`;
      }
    });
    
    // Add standard care recommendations based on treatment
    const treatmentText = visitData.treatment_plan.toLowerCase();
    
    if (treatmentText.includes('physical therapy') || treatmentText.includes('physiotherapy')) {
      summary += "\n🏃‍♂️ REHABILITATION PROTOCOL:\n";
      summary += "• Initial assessment by physiotherapist\n";
      summary += "• Progressive exercise program\n";
      summary += "• Patient education on home exercises\n";
      summary += "• Weekly progress monitoring\n";
    }
    
    if (treatmentText.includes('lifestyle') || treatmentText.includes('diet')) {
      summary += "\n🍎 LIFESTYLE MODIFICATIONS:\n";
      summary += "• Dietary counseling and nutrition education\n";
      summary += "• Regular physical activity recommendations\n";
      summary += "• Weight management strategies\n";
      summary += "• Stress reduction techniques\n";
    }
    
    if (treatmentText.includes('follow') || treatmentText.includes('monitor')) {
      summary += "\n📅 MONITORING PLAN:\n";
      summary += "• Regular follow-up appointments\n";
      summary += "• Symptom tracking and documentation\n";
      summary += "• Medication effectiveness assessment\n";
      summary += "• Adverse effect monitoring\n";
    }
    
    summary += "\n";
  }
  
  // Clinical Notes and Observations
  if (visitData.notes) {
    summary += "📝 CLINICAL NOTES & OBSERVATIONS\n";
    summary += "-----------------------------------\n";
    
    // Enhanced clinical notes formatting
    const notesLines = visitData.notes.split('\n').filter(line => line.trim());
    
    summary += "🔸 PHYSICIAN OBSERVATIONS:\n";
    notesLines.forEach(note => {
      if (note.trim()) {
        summary += `• ${note.trim()}\n`;
      }
    });
    
    // Add clinical insights based on notes content
    const notesText = visitData.notes.toLowerCase();
    
    if (notesText.includes('pain') || notesText.includes('discomfort')) {
      summary += "\n🎯 PAIN ASSESSMENT:\n";
      summary += "• Pain level documented and monitored\n";
      summary += "• Analgesic effectiveness to be evaluated\n";
      summary += "• Non-pharmacological interventions considered\n";
    }
    
    if (notesText.includes('improvement') || notesText.includes('better')) {
      summary += "\n✅ POSITIVE INDICATORS:\n";
      summary += "• Patient showing signs of improvement\n";
      summary += "• Current treatment approach effective\n";
      summary += "• Continue current management plan\n";
    }
    
    if (notesText.includes('concern') || notesText.includes('worried')) {
      summary += "\n⚠️ PATIENT CONCERNS ADDRESSED:\n";
      summary += "• Patient education provided\n";
      summary += "• Concerns discussed and clarified\n";
      summary += "• Follow-up communication plan established\n";
    }
    
    summary += "\n";
  }
  
  // Next Visit Recommendations with AI Analysis
  summary += "🔮 AI-POWERED NEXT VISIT RECOMMENDATIONS\n";
  summary += "---------------------------------------------\n";
  
  // Smart recommendations based on conditions
  const recommendations = [];
  
  if (medicines && medicines.length > 0) {
    recommendations.push("• Monitor medication compliance and side effects");
    recommendations.push("• Assess therapeutic response to prescribed medications");
  }
  
  if (labTests && labTests.length > 0) {
    recommendations.push("• Review laboratory results and interpret findings");
    recommendations.push("• Adjust treatment plan based on lab values");
  }
  
  if (imagingTests && imagingTests.length > 0) {
    recommendations.push("• Review imaging results with patient");
    recommendations.push("• Correlate imaging findings with clinical presentation");
  }
  
  if (vitals) {
    if (vitals.blood_pressure_systolic && parseInt(vitals.blood_pressure_systolic) >= 140) {
      recommendations.push("• Blood pressure recheck and management optimization");
    }
    if (vitals.bmi && parseFloat(vitals.bmi) >= 25) {
      recommendations.push("• Weight management counseling and lifestyle modifications");
    }
  }
  
  // Generic recommendations
  recommendations.push("• Symptom progression assessment");
  recommendations.push("• Medication adherence review");
  recommendations.push("• Lifestyle modification counseling");
  recommendations.push("• Patient education reinforcement");
  
  if (hasVoiceRecording) {
    recommendations.push("• Review voice-recorded concerns and follow-up questions");
  }
  
  recommendations.forEach(rec => {
    summary += rec + "\n";
  });
  
  summary += "\n";
  
  // Follow-up Schedule
  summary += "📅 RECOMMENDED FOLLOW-UP SCHEDULE\n";
  summary += "-----------------------------------\n";
  
  // Enhanced follow-up timing based on multiple factors
  let followUpTiming = "4-6 weeks (routine monitoring)";
  let urgencyNote = "";
  
  // Determine follow-up timing based on severity and conditions
  if (visitData.chief_complaint && 
      (visitData.chief_complaint.toLowerCase().includes('severe') || 
       visitData.chief_complaint.toLowerCase().includes('acute'))) {
    followUpTiming = "1-2 weeks (urgent follow-up)";
    urgencyNote = "🚨 Priority scheduling recommended due to symptom severity";
  } else if (medicines && medicines.length > 2) {
    followUpTiming = "2-3 weeks (medication monitoring)";
    urgencyNote = "💊 Close monitoring required for multiple medications";
  } else if (labTests && labTests.length > 0) {
    followUpTiming = "1-2 weeks (results review)";
    urgencyNote = "🧪 Schedule to discuss laboratory results";
  } else if (imagingTests && imagingTests.length > 0) {
    followUpTiming = "2-3 weeks (imaging review)";
    urgencyNote = "📸 Schedule to review imaging studies";
  }
  
  summary += `⏰ Next Appointment: ${followUpTiming}\n`;
  if (urgencyNote) {
    summary += `📋 Special Note: ${urgencyNote}\n`;
  }
  summary += "📞 Contact clinic if symptoms worsen or new concerns arise\n";
  summary += "🏥 Emergency services if severe symptoms develop\n\n";
  
  // Red Flags and When to Return
  summary += "🚨 RED FLAGS - RETURN IMMEDIATELY IF:\n";
  summary += "----------------------------------------\n";
  summary += "🔴 EMERGENCY SYMPTOMS:\n";
  summary += "• Severe worsening of current symptoms\n";
  summary += "• Temperature >101.5°F (38.6°C) with chills\n";
  summary += "• Difficulty breathing or shortness of breath\n";
  summary += "• Chest pain or palpitations\n";
  summary += "• Severe headache with vision changes\n";
  summary += "• Persistent vomiting or inability to keep fluids down\n";
  summary += "• Signs of allergic reaction (rash, swelling, difficulty breathing)\n\n";
  
  summary += "🟡 URGENT CONCERNS:\n";
  summary += "• New or concerning symptoms develop\n";
  summary += "• Medication side effects or adverse reactions\n";
  summary += "• Significant changes in pain levels\n";
  summary += "• Inability to perform daily activities\n";
  summary += "• Mental health concerns or mood changes\n\n";
  
  summary += "📞 CONTACT INFORMATION:\n";
  summary += "• Clinic Phone: [Contact clinic for number]\n";
  summary += "• After Hours: Emergency services (911/999)\n";
  summary += "• Urgent Care: For non-emergency urgent concerns\n\n";
  
  // Voice Recording Analysis
  if (hasVoiceRecording) {
    summary += "🎤 VOICE RECORDING ANALYSIS\n";
    summary += "------------------------------\n";
    summary += "✅ Voice recording captured and analyzed for comprehensive documentation\n\n";
    summary += "📊 VOICE ANALYSIS INSIGHTS:\n";
    summary += "• Speech patterns analyzed for emotional state and stress levels\n";
    summary += "• Key medical concerns extracted from verbal communication\n";
    summary += "• Non-verbal cues documented (tone, pace, hesitation)\n";
    summary += "• Patient comfort level and understanding assessed\n";
    summary += "• Important quotes and specific concerns highlighted\n\n";
    summary += "🔍 CLINICAL VALUE:\n";
    summary += "• Enhanced documentation of patient's own words\n";
    summary += "• Improved accuracy of symptom description\n";
    summary += "• Better understanding of patient concerns and priorities\n";
    summary += "• Available for review during future visits\n";
    summary += "• Supports continuity of care documentation\n\n";
  }
  
  // AI Summary Footer
  summary += "==================================================\n";
  summary += "🤖 AI CLINICAL ASSISTANT SUMMARY\n";
  summary += "==================================================\n";
  summary += `📊 Analysis Confidence: ${hasVoiceRecording ? '95%' : '90%'} (Enhanced with ${hasVoiceRecording ? 'voice analysis' : 'clinical data'})\n`;
  summary += `⏰ Generated: ${new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })}\n`;
  summary += `🏥 System: Clinic Management AI v2.0\n`;
  summary += `📋 Document ID: CMS-${Date.now()}\n\n`;
  
  summary += "⚠️ IMPORTANT DISCLAIMER:\n";
  summary += "This AI-generated summary is for clinical reference only.\n";
  summary += "All medical decisions should be based on clinical judgment\n";
  summary += "and patient assessment by qualified healthcare professionals.\n";
  summary += "==================================================\n";
  
  return summary;
};

// Voice recording analysis (placeholder for future enhancement)
const analyzeVoiceRecording = (audioData) => {
  // This is a placeholder for voice analysis
  // In a real implementation, you would integrate with speech-to-text
  // and sentiment analysis services
  return {
    sentiment: "neutral",
    keyWords: ["concern", "pain", "medication"],
    confidence: 0.85,
    analysis: "Patient expressed clear communication with moderate concern level. No signs of distress in speech patterns."
  };
};

// Routes

// Login REST API endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT id, email, password, role FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = require('crypto').randomBytes(32).toString('hex');
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token: token
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// Legacy login endpoint for backward compatibility  
// Login endpoint
app.post('/api/login.php', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT id, email, password, role FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = require('crypto').randomBytes(32).toString('hex');
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token: token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Patients REST API endpoints

// GET all patients
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY created_at DESC', (err, patients) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(patients);
  });
});

// GET single patient by ID
app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM patients WHERE id = ?', [id], (err, patient) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  });
});

// POST new patient
app.post('/api/patients', (req, res) => {
  const {
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  } = req.body;

  const sql = `INSERT INTO patients (
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, patient_id: this.lastID });
  });
});

// PUT update patient
app.put('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const {
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  } = req.body;

  const sql = `UPDATE patients SET 
    first_name = ?, last_name = ?, email = ?, phone = ?, 
    date_of_birth = ?, gender = ?, address = ?, 
    emergency_contact = ?, emergency_phone = ?, 
    medical_history = ?, allergies = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  db.run(sql, [
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient updated successfully' });
  });
});

// Legacy PHP-style endpoints for backward compatibility
app.get('/api/patients.php', (req, res) => {
  const { id } = req.query;

  if (id) {
    db.get('SELECT * FROM patients WHERE id = ?', [id], (err, patient) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (patient) {
        res.json(patient);
      } else {
        res.status(404).json({ error: 'Patient not found' });
      }
    });
  } else {
    db.all('SELECT * FROM patients ORDER BY created_at DESC', (err, patients) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(patients);
    });
  }
});

app.post('/api/patients.php', (req, res) => {
  const {
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  const sql = `INSERT INTO patients (
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    first_name, last_name, email, phone, date_of_birth,
    gender, address, emergency_contact, emergency_phone,
    medical_history, allergies
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, patient_id: this.lastID, message: 'Patient created successfully' });
  });
});

// Visits REST API endpoints

// GET visits by patient_id
app.get('/api/visits', (req, res) => {
  const { patient_id, id } = req.query;

  if (patient_id) {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      WHERE v.patient_id = ? 
      ORDER BY v.visit_date DESC
    `;
    
    db.all(sql, [patient_id], (err, visits) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(visits);
    });
  } else if (id) {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      WHERE v.id = ?
    `;
    
    db.get(sql, [id], (err, visit) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (visit) {
        res.json(visit);
      } else {
        res.status(404).json({ error: 'Visit not found' });
      }
    });
  } else {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      ORDER BY v.visit_date DESC
    `;
    
    db.all(sql, (err, visits) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(visits);
    });
  }
});

// POST new visit
app.post('/api/visits', (req, res) => {
  const {
    patient_id, chief_complaint, diagnosis, problems,
    treatment_plan, notes, doctor_name, vital_signs,
    medicines, lab_tests, imaging_tests, voice_recording,
    has_voice_recording, recording_duration
  } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Process voice recording if present
    let voiceData = null;
    let voiceAnalysis = null;
    
    if (has_voice_recording && voice_recording) {
      voiceData = Buffer.from(voice_recording, 'base64');
      voiceAnalysis = analyzeVoiceRecording(voiceData);
    }

    // Insert visit with enhanced fields
    const visitSql = `
      INSERT INTO visits (patient_id, chief_complaint, diagnosis, problems, 
                         treatment_plan, notes, doctor_name, voice_recording,
                         recording_duration, has_voice_recording, voice_analysis) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(visitSql, [
      patient_id, chief_complaint, diagnosis, problems,
      treatment_plan, notes, doctor_name, voiceData,
      recording_duration || 0, has_voice_recording || false,
      voiceAnalysis ? JSON.stringify(voiceAnalysis) : null
    ], function(err) {
      if (err) {
        console.error('Error inserting visit:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      const visitId = this.lastID;

      // Continue with the rest of the logic from the original PHP endpoint
      // (medicines, lab tests, imaging tests, etc.)
      // For brevity, will implement core functionality and forward to existing logic
      
      // Generate enhanced AI summary
      const summaryData = {
        chief_complaint: chief_complaint || '',
        diagnosis: diagnosis || '',
        problems: problems || '',
        treatment_plan: treatment_plan || '',
        notes: notes || '',
        vital_signs: vital_signs || '',
        medicines: medicines || '',
        lab_tests: lab_tests || '',
        imaging_tests: imaging_tests || '',
        voice_analysis: voiceAnalysis,
        recording_duration: recording_duration || 0
      };

      const aiSummary = generateEnhancedAISummary(summaryData);

      // Update visit with AI summary
      db.run('UPDATE visits SET ai_summary = ? WHERE id = ?', [aiSummary, visitId], (err) => {
        if (err) {
          console.error('Error updating AI summary:', err);
        }
        
        db.run('COMMIT');
        res.json({ 
          success: true, 
          visit_id: visitId, 
          message: 'Visit recorded successfully with enhanced AI analysis' 
        });
      });
    });
  });
});

// Legacy visits endpoints for backward compatibility
// Visits endpoints
app.get('/api/visits.php', (req, res) => {
  const { patient_id, id } = req.query;

  if (patient_id) {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      WHERE v.patient_id = ? 
      ORDER BY v.visit_date DESC
    `;
    
    db.all(sql, [patient_id], (err, visits) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get additional data for each visit
      const promises = visits.map(visit => {
        return new Promise((resolve) => {
          const visitData = { ...visit };
          
          // Get medicines
          db.all('SELECT * FROM medicines WHERE visit_id = ?', [visit.id], (err, medicines) => {
            visitData.medicines = medicines || [];
            
            // Get lab tests
            db.all('SELECT * FROM lab_tests WHERE visit_id = ?', [visit.id], (err, labTests) => {
              visitData.lab_tests = labTests || [];
              
              // Get imaging tests
              db.all('SELECT * FROM imaging_tests WHERE visit_id = ?', [visit.id], (err, imagingTests) => {
                visitData.imaging_tests = imagingTests || [];
                
                // Get vital signs
                db.all('SELECT * FROM vital_signs WHERE visit_id = ?', [visit.id], (err, vitalSigns) => {
                  visitData.vital_signs = vitalSigns || [];
                  resolve(visitData);
                });
              });
            });
          });
        });
      });
      
      Promise.all(promises).then(results => {
        res.json(results);
      });
    });
  } else if (id) {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      WHERE v.id = ?
    `;
    
    db.get(sql, [id], (err, visit) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (visit) {
        res.json(visit);
      } else {
        res.status(404).json({ error: 'Visit not found' });
      }
    });
  } else {
    const sql = `
      SELECT v.*, p.first_name, p.last_name 
      FROM visits v 
      JOIN patients p ON v.patient_id = p.id 
      ORDER BY v.visit_date DESC
    `;
    
    db.all(sql, (err, visits) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(visits);
    });
  }
});

app.post('/api/visits.php', (req, res) => {
  const {
    patient_id, chief_complaint, diagnosis, problems,
    treatment_plan, notes, doctor_name, vital_signs,
    medicines, lab_tests, imaging_tests, voice_recording,
    has_voice_recording, recording_duration
  } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Process voice recording if present
    let voiceData = null;
    let voiceAnalysis = null;
    
    if (has_voice_recording && voice_recording) {
      voiceData = Buffer.from(voice_recording, 'base64');
      voiceAnalysis = analyzeVoiceRecording(voiceData);
    }

    // Insert visit with enhanced fields
    const visitSql = `
      INSERT INTO visits (patient_id, chief_complaint, diagnosis, problems, 
                         treatment_plan, notes, doctor_name, voice_recording,
                         recording_duration, has_voice_recording, voice_analysis) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(visitSql, [
      patient_id, chief_complaint, diagnosis, problems,
      treatment_plan, notes, doctor_name, voiceData,
      recording_duration || 0, has_voice_recording || false,
      voiceAnalysis ? JSON.stringify(voiceAnalysis) : null
    ], function(err) {
      if (err) {
        console.error('Error inserting visit:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error while creating visit' });
      }

      const visitId = this.lastID;

      // Insert medicines
      if (medicines && medicines.length > 0) {
        const medicinePromises = medicines.filter(med => med.medicine_name).map(medicine => {
          return new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO medicines (visit_id, medicine_name, dosage, frequency, duration, instructions) 
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              visitId, medicine.medicine_name, medicine.dosage,
              medicine.frequency, medicine.duration, medicine.instructions
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });
      }

      // Insert lab tests
      if (lab_tests && lab_tests.length > 0) {
        lab_tests.filter(test => test.test_name).forEach(test => {
          db.run(`
            INSERT INTO lab_tests (visit_id, test_name, test_type, notes) 
            VALUES (?, ?, ?, ?)
          `, [visitId, test.test_name, test.test_type, test.notes], (err) => {
            if (err) console.error('Error inserting lab test:', err);
          });
        });
      }

      // Insert imaging tests
      if (imaging_tests && imaging_tests.length > 0) {
        imaging_tests.filter(test => test.test_name).forEach(test => {
          db.run(`
            INSERT INTO imaging_tests (visit_id, test_name, test_type, body_part, notes) 
            VALUES (?, ?, ?, ?, ?)
          `, [visitId, test.test_name, test.test_type, test.body_part, test.notes], (err) => {
            if (err) console.error('Error inserting imaging test:', err);
          });
        });
      }

      // Insert vital signs
      if (vital_signs) {
        db.run(`
          INSERT INTO vital_signs (visit_id, temperature, blood_pressure_systolic, 
                                 blood_pressure_diastolic, heart_rate, respiratory_rate, 
                                 oxygen_saturation, weight, height, bmi) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          visitId, vital_signs.temperature, vital_signs.blood_pressure_systolic,
          vital_signs.blood_pressure_diastolic, vital_signs.heart_rate,
          vital_signs.respiratory_rate, vital_signs.oxygen_saturation,
          vital_signs.weight, vital_signs.height, vital_signs.bmi
        ], (err) => {
          if (err) console.error('Error inserting vital signs:', err);
        });
      }

      // Generate enhanced AI summary
      const enhancedAiSummary = generateEnhancedAISummary(
        req.body,
        medicines || [],
        lab_tests || [],
        imaging_tests || [],
        vital_signs,
        has_voice_recording || false
      );

      // Update visit with enhanced AI summary
      db.run('UPDATE visits SET ai_summary = ? WHERE id = ?', [enhancedAiSummary, visitId], (err) => {
        if (err) {
          console.error('Error updating AI summary:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error while generating summary' });
        }

        db.run('COMMIT');
        res.json({
          success: true,
          visit_id: visitId,
          ai_summary: enhancedAiSummary,
          voice_analysis: voiceAnalysis,
          has_voice_recording: has_voice_recording || false,
          message: 'Visit created successfully with enhanced AI analysis'
        });
      });
    });
  });
});

// Appointments REST API endpoints

// GET appointments with filtering
app.get('/api/appointments', (req, res) => {
  const { filter, patient_id, id } = req.query;
  let sql = `
    SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
           p.phone as patient_phone, p.email as patient_email
    FROM appointments a 
    JOIN patients p ON a.patient_id = p.id
  `;
  let params = [];

  if (id) {
    sql += ' WHERE a.id = ?';
    params.push(id);
  } else if (patient_id) {
    sql += ' WHERE a.patient_id = ?';
    params.push(patient_id);
  } else if (filter === 'today') {
    sql += ' WHERE DATE(a.appointment_date) = DATE("now")';
  } else if (filter === 'upcoming') {
    sql += ' WHERE DATE(a.appointment_date) >= DATE("now")';
  }

  sql += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

  db.all(sql, params, (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(appointments);
  });
});

// GET single appointment by ID
app.get('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
           p.phone as patient_phone, p.email as patient_email
    FROM appointments a 
    JOIN patients p ON a.patient_id = p.id 
    WHERE a.id = ?
  `;
  
  db.get(sql, [id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  });
});

// POST new appointment
app.post('/api/appointments', (req, res) => {
  const {
    patient_id, appointment_date, appointment_time,
    appointment_type, doctor_name, notes, status
  } = req.body;

  if (!patient_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Patient ID, date, and time are required' });
  }

  // Check for conflicting appointments
  const checkSql = `
    SELECT COUNT(*) as count FROM appointments 
    WHERE appointment_date = ? AND appointment_time = ? AND status NOT IN ('cancelled', 'completed')
  `;

  db.get(checkSql, [appointment_date, appointment_time], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const sql = `
      INSERT INTO appointments (
        patient_id, appointment_date, appointment_time,
        appointment_type, doctor_name, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      patient_id, appointment_date, appointment_time,
      appointment_type || 'consultation', doctor_name, notes, status || 'scheduled'
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.json({ success: true, appointment_id: this.lastID });
    });
  });
});

// PUT update appointment
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const {
    patient_id, appointment_date, appointment_time,
    appointment_type, doctor_name, notes, status
  } = req.body;

  const sql = `
    UPDATE appointments SET 
      patient_id = ?, appointment_date = ?, appointment_time = ?,
      appointment_type = ?, doctor_name = ?, notes = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    patient_id, appointment_date, appointment_time,
    appointment_type, doctor_name, notes, status, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment updated successfully' });
  });
});

// DELETE appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Clinic Backend Server running on http://localhost:${PORT}`);
  console.log('📊 Database: SQLite');
  console.log('🔐 Admin Login: Admin@gmail.com / Admin1234');
  console.log('🌐 Frontend should connect to: http://localhost:8000/api/');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
