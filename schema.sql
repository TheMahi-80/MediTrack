-- ============================================================
-- MediTrack Bangladesh - MySQL Database Schema & Initial Data
-- Prepared for University Project & Local MySQL Workbench Setup
-- ============================================================

CREATE DATABASE IF NOT EXISTS meditrack_db;
USE meditrack_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'DOCTOR_PENDING', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    photo_url TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    institution_id VARCHAR(100) DEFAULT 'dhaka-care-clinic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Doctor Profiles Table
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    bmdc_reg_no VARCHAR(100) NOT NULL UNIQUE, -- BM&DC (Bangladesh Medical & Dental Council) Registration
    specialization VARCHAR(255) NOT NULL,
    degrees VARCHAR(255) NOT NULL,
    chamber_address TEXT NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    available_hours VARCHAR(255) DEFAULT '05:00 PM - 09:00 PM',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    emergency_contact VARCHAR(20),
    allergies TEXT,
    medical_conditions TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    prescription_number VARCHAR(50) NOT NULL UNIQUE,
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    patient_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT,
    diagnosis TEXT NOT NULL,
    lab_tests TEXT,
    instructions TEXT,
    institution_id VARCHAR(100) DEFAULT 'dhaka-care-clinic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Medicines Table (Child of Prescriptions)
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id VARCHAR(64) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,        -- e.g. "1+0+1" or "500mg"
    duration VARCHAR(100) NOT NULL,      -- e.g. "7 days"
    instructions TEXT,                    -- e.g. "After meal"
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 6. Live Queue Table
CREATE TABLE IF NOT EXISTS queues (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(100) DEFAULT 'dhaka-care-clinic',
    patient_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(64) NOT NULL,
    queue_number INT NOT NULL,
    status ENUM('WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA FOR DEMO & TESTING
-- ============================================================

-- Insert Admin User
INSERT INTO users (id, email, display_name, role, is_approved)
VALUES ('usr_admin_01', 'admin@meditrack.bd', 'System Admin', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- Insert Demo Doctor Users
INSERT INTO users (id, email, display_name, role, is_approved)
VALUES 
('usr_doc_01', 'dr.rahman@meditrack.bd', 'Dr. M. Rahman', 'DOCTOR', TRUE),
('usr_doc_02', 'dr.chowdhury@meditrack.bd', 'Dr. Farhana Chowdhury', 'DOCTOR', TRUE)
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- Insert Doctor Details
INSERT INTO doctor_profiles (id, user_id, bmdc_reg_no, specialization, degrees, chamber_address, consultation_fee)
VALUES 
('doc_p_01', 'usr_doc_01', 'BMDC-A12894', 'Cardiology & Internal Medicine', 'MBBS, FCPS (Cardiology)', 'Green Road, Dhanmondi, Dhaka', 1000.00),
('doc_p_02', 'usr_doc_02', 'BMDC-A34901', 'Gynecology & Obstetrics', 'MBBS, MS (Gynae)', 'Labaid Specialized Hospital, Dhaka', 1200.00)
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- Insert Demo Patients
INSERT INTO users (id, email, display_name, role, is_approved)
VALUES 
('usr_pat_01', 'tanvir@gmail.com', 'Tanvir Ahmed', 'PATIENT', TRUE),
('usr_pat_02', 'sharmistha@gmail.com', 'Sharmistha Roy', 'PATIENT', TRUE)
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

INSERT INTO patient_profiles (id, user_id, age, gender, blood_group, emergency_contact, medical_conditions)
VALUES 
('pat_p_01', 'usr_pat_01', 34, 'Male', 'B+', '+8801711223344', 'Hypertension, Asthma'),
('pat_p_02', 'usr_pat_02', 28, 'Female', 'O+', '+8801811556677', 'Migraine')
ON DUPLICATE KEY UPDATE age=VALUES(age);

-- Insert Sample Prescription
INSERT INTO prescriptions (id, prescription_number, doctor_id, doctor_name, patient_id, patient_name, patient_age, diagnosis, lab_tests, instructions)
VALUES 
('rx_1001', 'RX-2026-0801', 'usr_doc_01', 'Dr. M. Rahman', 'usr_pat_01', 'Tanvir Ahmed', 34, 'Mild Hypertension & Seasonal Allergy', 'CBC, Blood Pressure Log', 'Take rest and reduce salt intake.')
ON DUPLICATE KEY UPDATE diagnosis=VALUES(diagnosis);

INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, duration, instructions)
VALUES 
('rx_1001', 'Tab. Napa Extra 500mg', '1+0+1', '5 days', 'After meals when headache occurs'),
('rx_1001', 'Tab. Osartil 50mg', '0+0+1', '30 days', 'At bedtime regularly'),
('rx_1001', 'Tab. Fexo 120mg', '1+0+0', '7 days', 'Morning after breakfast');

-- Insert Sample Live Queue
INSERT INTO queues (id, patient_id, patient_name, doctor_id, queue_number, status)
VALUES 
('q_01', 'usr_pat_01', 'Tanvir Ahmed', 'usr_doc_01', 1, 'IN_CONSULTATION'),
('q_02', 'usr_pat_02', 'Sharmistha Roy', 'usr_doc_01', 2, 'WAITING');
