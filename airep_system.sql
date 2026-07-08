-- phpMyAdmin SQL Dump
-- ==========================================================
-- AIREP SYSTEM DATABASE
-- Final Version
-- ==========================================================

DROP DATABASE IF EXISTS airep_system;

CREATE DATABASE airep_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE airep_system;

-- ==========================================================
-- MAIN TABLE
-- ==========================================================

CREATE TABLE airep_messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    file_name VARCHAR(255) NOT NULL,

    parsed_message_type VARCHAR(10),

    parsed_date_in_utc DATE,

    parsed_aircraft_id VARCHAR(10),

    parsed_lat_long VARCHAR(50),

    parsed_hour_and_min_in_utc TIME,

    parsed_flight_level_in_ft INT,

    parsed_temp_in_c INT,

    parsed_wind_dir INT,

    parsed_wind_speed_in_kt INT,

    content_line LONGTEXT,

    entire_unparsed_message LONGTEXT,

    message_entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_airep_record
    (
        parsed_date_in_utc,
        parsed_aircraft_id,
        parsed_lat_long,
        parsed_hour_and_min_in_utc,
        parsed_flight_level_in_ft
    )

);

-- ==========================================================
-- FAILED MESSAGES
-- ==========================================================

CREATE TABLE failed_airep_messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    file_name VARCHAR(255),

    error_reason VARCHAR(255),

    raw_message LONGTEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_date
ON airep_messages(parsed_date_in_utc);

CREATE INDEX idx_time
ON airep_messages(parsed_hour_and_min_in_utc);

CREATE INDEX idx_aircraft
ON airep_messages(parsed_aircraft_id);

CREATE INDEX idx_latlon
ON airep_messages(parsed_lat_long);

CREATE INDEX idx_fl
ON airep_messages(parsed_flight_level_in_ft);

CREATE INDEX idx_temp
ON airep_messages(parsed_temp_in_c);

CREATE INDEX idx_wind
ON airep_messages(parsed_wind_speed_in_kt);