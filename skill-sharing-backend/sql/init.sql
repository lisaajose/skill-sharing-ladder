-- sql/init.sql

CREATE DATABASE IF NOT EXISTS skill_sharing_ladder;
USE skill_sharing_ladder;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    current_level INT DEFAULT 1, -- Starts at level 1
    reputation INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UserSkills Table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS UserSkills (
    user_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    role ENUM('teach', 'learn') NOT NULL, -- Can a user teach this skill, learn this skill, or both
    proficiency_level INT DEFAULT 0, -- 0 = beginner, 1 = intermediate, 2 = expert (for teaching)
    is_verified BOOLEAN DEFAULT FALSE, -- Has this skill been verified by an expert?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE,
    UNIQUE (user_id, skill_id, role) -- A user can teach and learn the same skill, but not teach it twice
);

-- Matches Table
CREATE TABLE IF NOT EXISTS Matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_user_id INT NOT NULL,
    learner_user_id INT NOT NULL,
    skill_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (learner_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS Sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    session_date DATETIME NOT NULL,
    duration_minutes INT,
    notes TEXT,
    teacher_feedback_rating INT CHECK (teacher_feedback_rating BETWEEN 1 AND 5), -- Rating given by learner to teacher
    learner_feedback_rating INT CHECK (learner_feedback_rating BETWEEN 1 AND 5), -- Rating given by teacher to learner
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE
);

-- Progress Table (tracks learning progress for a specific skill by a specific user)
CREATE TABLE IF NOT EXISTS Progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    current_stage VARCHAR(255) DEFAULT 'Initiated', -- e.g., 'Initiated', 'Module 1 Complete', 'Practicing', 'Ready for Verification'
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    sessions_completed INT DEFAULT 0,
    required_sessions_to_advance INT DEFAULT 3, -- Example: need to complete 3 sessions to advance on this skill
    can_advance_ladder BOOLEAN DEFAULT FALSE, -- Flag if this skill contributes to ladder advancement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE,
    UNIQUE (user_id, skill_id) -- A user has only one progress record per skill
);