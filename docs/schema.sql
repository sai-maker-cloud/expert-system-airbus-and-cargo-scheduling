CREATE DATABASE IF NOT EXISTS airline_db;
USE airline_db;

CREATE TABLE aircraft (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    max_cargo_weight DOUBLE NOT NULL,
    max_cargo_volume DOUBLE NOT NULL,
    passenger_capacity INT NOT NULL,
    fuel_efficiency DOUBLE NOT NULL,
    status ENUM('AVAILABLE', 'IN_FLIGHT', 'MAINTENANCE', 'RETIRED') DEFAULT 'AVAILABLE',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE crew_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('PILOT', 'CO_PILOT', 'FLIGHT_ENGINEER', 'FLIGHT_ATTENDANT', 'PURSER') NOT NULL,
    license_number VARCHAR(30),
    license_expiry DATE,
    hours_flown_today DOUBLE DEFAULT 0.0,
    total_hours_flown DOUBLE DEFAULT 0.0,
    status ENUM('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'ON_LEAVE') DEFAULT 'AVAILABLE',
    base_station VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE flights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    distance_km DOUBLE NOT NULL,
    status ENUM('SCHEDULED', 'BOARDING', 'IN_FLIGHT', 'LANDED', 'DELAYED', 'CANCELLED') DEFAULT 'SCHEDULED',
    aircraft_id BIGINT,
    delay_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(id)
);

CREATE TABLE flight_crew (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_id BIGINT NOT NULL,
    crew_member_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_flight_crew (flight_id, crew_member_id),
    FOREIGN KEY (flight_id) REFERENCES flights(id),
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
);

CREATE TABLE cargo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(200),
    weight DOUBLE NOT NULL,
    volume DOUBLE NOT NULL,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'SPLIT') DEFAULT 'PENDING',
    customer_name VARCHAR(100),
    customer_contact VARCHAR(50),
    flight_id BIGINT,
    parent_cargo_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(id),
    FOREIGN KEY (parent_cargo_id) REFERENCES cargo(id)
);

CREATE TABLE system_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_category ENUM('CREW', 'AIRCRAFT', 'CARGO', 'FLIGHT', 'SAFETY') NOT NULL,
    rule_key VARCHAR(100) NOT NULL,
    rule_value VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_rules (rule_name, rule_category, rule_key, rule_value, description) VALUES
('Max Crew Duty Hours', 'CREW', 'MAX_CREW_DUTY_HOURS', '8', 'Maximum allowed duty hours for crew per day'),
('Min Pilot Rest Hours', 'CREW', 'MIN_PILOT_REST_HOURS', '10', 'Minimum rest hours required between duties'),
('Max Cargo Weight Per Flight', 'CARGO', 'MAX_CARGO_WEIGHT_PERCENT', '90', 'Maximum percentage of aircraft cargo capacity'),
('High Priority Window Hours', 'CARGO', 'HIGH_PRIORITY_WINDOW_HOURS', '4', 'High priority cargo must be on a flight within N hours'),
('Maintenance Buffer Days', 'AIRCRAFT', 'MAINTENANCE_BUFFER_DAYS', '3', 'Days before maintenance to flag aircraft'),
('Min Crew Size', 'FLIGHT', 'MIN_CREW_SIZE', '4', 'Minimum crew members required per flight');

INSERT INTO aircraft (registration_number, model, max_cargo_weight, max_cargo_volume, passenger_capacity, fuel_efficiency, status, last_maintenance_date, next_maintenance_date) VALUES
('VT-AIR101', 'Boeing 737-800', 20000, 150, 162, 8.5, 'AVAILABLE', '2024-12-01', '2025-06-01'),
('VT-AIR102', 'Airbus A320', 18000, 130, 150, 9.2, 'AVAILABLE', '2024-11-15', '2025-05-15'),
('VT-AIR103', 'Boeing 777-300', 65000, 500, 396, 7.1, 'AVAILABLE', '2024-10-20', '2025-04-20'),
('VT-AIR104', 'Airbus A380', 90000, 700, 555, 6.8, 'MAINTENANCE', '2025-01-10', '2025-07-10'),
('VT-AIR105', 'ATR 72-600', 7000, 60, 70, 10.5, 'AVAILABLE', '2024-09-05', '2025-03-05');

INSERT INTO crew_members (employee_id, first_name, last_name, role, license_number, license_expiry, status, base_station) VALUES
('EMP001', 'Rajesh', 'Kumar', 'PILOT', 'PIL-2024-001', '2026-12-31', 'AVAILABLE', 'BOM'),
('EMP002', 'Priya', 'Sharma', 'CO_PILOT', 'PIL-2024-002', '2026-06-30', 'AVAILABLE', 'BOM'),
('EMP003', 'Arjun', 'Patel', 'FLIGHT_ENGINEER', 'FE-2024-001', '2025-12-31', 'AVAILABLE', 'DEL'),
('EMP004', 'Sunita', 'Rao', 'FLIGHT_ATTENDANT', NULL, NULL, 'AVAILABLE', 'BOM'),
('EMP005', 'Vikram', 'Singh', 'FLIGHT_ATTENDANT', NULL, NULL, 'AVAILABLE', 'DEL'),
('EMP006', 'Meera', 'Nair', 'PURSER', NULL, NULL, 'AVAILABLE', 'BOM'),
('EMP007', 'Aditya', 'Verma', 'PILOT', 'PIL-2024-003', '2027-03-31', 'AVAILABLE', 'MAA'),
('EMP008', 'Kavya', 'Reddy', 'CO_PILOT', 'PIL-2024-004', '2026-09-30', 'AVAILABLE', 'MAA');

INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, distance_km, status) VALUES
('AI-101', 'BOM', 'DEL', '2025-04-20 06:00:00', '2025-04-20 08:30:00', 1148, 'SCHEDULED'),
('AI-102', 'DEL', 'BOM', '2025-04-20 10:00:00', '2025-04-20 12:30:00', 1148, 'SCHEDULED'),
('AI-201', 'BOM', 'MAA', '2025-04-20 07:00:00', '2025-04-20 08:45:00', 1032, 'SCHEDULED'),
('AI-301', 'DEL', 'CCU', '2025-04-20 09:00:00', '2025-04-20 11:15:00', 1305, 'SCHEDULED'),
('AI-401', 'BOM', 'HYD', '2025-04-20 11:00:00', '2025-04-20 12:15:00', 620, 'SCHEDULED');
