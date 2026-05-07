-- Create DB (optional):
-- CREATE DATABASE iskolarlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE iskolarlink;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  avatar LONGTEXT NULL,
  profile_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scholarships (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  deadline DATETIME NOT NULL,
  slots INT NOT NULL DEFAULT 0,
  benefits_json JSON NULL,
  criteria_json JSON NULL,
  status ENUM('Active','Closed','Draft') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scholarship_applications (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  scholarship_id VARCHAR(36) NOT NULL,
  status ENUM('Pending','Under Review','Screened','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  submission_date DATETIME NOT NULL,
  timeline_json JSON NULL,
  documents_json JSON NULL,
  answers_json JSON NULL,
  rubric_json JSON NULL,
  grant_disbursement_json JSON NULL,
  grant_transactions_json JSON NULL,
  reviewed_at DATETIME NULL,
  reviewed_by VARCHAR(36) NULL,
  review_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_application_student_scholarship (student_id, scholarship_id),
  CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_scholarship FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approved_applicants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL UNIQUE,
  student_id VARCHAR(36) NOT NULL,
  scholarship_id VARCHAR(36) NOT NULL,
  approved_at DATETIME NOT NULL,
  notes TEXT NULL,
  approved_by VARCHAR(36) NULL,
  CONSTRAINT fk_approved_application FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_approved_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_approved_scholarship FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rejected_applicants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL UNIQUE,
  student_id VARCHAR(36) NOT NULL,
  scholarship_id VARCHAR(36) NOT NULL,
  rejected_at DATETIME NOT NULL,
  reason TEXT NULL,
  rejected_by VARCHAR(36) NULL,
  CONSTRAINT fk_rejected_application FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_rejected_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rejected_scholarship FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  target_audience VARCHAR(100) NOT NULL DEFAULT 'all',
  category ENUM('general','grant-release') NOT NULL DEFAULT 'general',
  grant_release_date DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed an admin user (uses password_hash for '#nemsu_2026!')
INSERT IGNORE INTO users (id, name, email, password, role)
VALUES (
  'admin-1',
  'Admin Director',
  'admin@nemsu.edu.ph',
  '$2y$10$SEhGTvaBKskL8HCnDExlfubprpNW1LR33LFk5W7HvCseDkybJvTZi',
  'admin'
);


