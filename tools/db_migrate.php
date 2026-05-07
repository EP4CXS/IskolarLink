<?php
declare(strict_types=1);

// Usage: php tools/db_migrate.php

$host = $argv[1] ?? '127.0.0.1';
$port = $argv[2] ?? '3306';
$dbName = $argv[3] ?? 'iskolarlink';
$dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
$user = 'root';
$pass = 'ep@cs82005';

$pdo = new PDO($dsn, $user, $pass, [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

function column_exists(PDO $pdo, string $dbName, string $table, string $column): bool {
  $stmt = $pdo->prepare("
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    LIMIT 1
  ");
  $stmt->execute([$dbName, $table, $column]);
  return (bool)$stmt->fetchColumn();
}

function table_exists(PDO $pdo, string $dbName, string $table): bool {
  $stmt = $pdo->prepare("
    SELECT 1
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    LIMIT 1
  ");
  $stmt->execute([$dbName, $table]);
  return (bool)$stmt->fetchColumn();
}

echo "Running migrations on {$dbName}...\n";

if (!table_exists($pdo, $dbName, 'announcements')) {
  $pdo->exec("
    CREATE TABLE announcements (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      target_audience VARCHAR(100) NOT NULL DEFAULT 'all',
      category ENUM('general','grant-release') NOT NULL DEFAULT 'general',
      grant_release_date DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  echo "Created announcements table.\n";
}

if (!table_exists($pdo, $dbName, 'notifications')) {
  $pdo->exec("
    CREATE TABLE notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      link VARCHAR(255) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  echo "Created notifications table.\n";
}

$appTable = 'scholarship_applications';
$appColumns = [
  'timeline_json' => "ALTER TABLE scholarship_applications ADD COLUMN timeline_json JSON NULL AFTER submission_date",
  'grant_disbursement_json' => "ALTER TABLE scholarship_applications ADD COLUMN grant_disbursement_json JSON NULL AFTER rubric_json",
  'grant_transactions_json' => "ALTER TABLE scholarship_applications ADD COLUMN grant_transactions_json JSON NULL AFTER grant_disbursement_json",
  'reviewed_at' => "ALTER TABLE scholarship_applications ADD COLUMN reviewed_at DATETIME NULL AFTER timeline_json",
  'reviewed_by' => "ALTER TABLE scholarship_applications ADD COLUMN reviewed_by VARCHAR(36) NULL AFTER reviewed_at",
  'review_note' => "ALTER TABLE scholarship_applications ADD COLUMN review_note TEXT NULL AFTER reviewed_by",
];
foreach ($appColumns as $column => $sql) {
  if (!column_exists($pdo, $dbName, $appTable, $column)) {
    $pdo->exec($sql);
    echo "Added {$appTable}.{$column}\n";
  }
}

if (column_exists($pdo, $dbName, 'approved_applicants', 'note') && !column_exists($pdo, $dbName, 'approved_applicants', 'notes')) {
  $pdo->exec("ALTER TABLE approved_applicants ADD COLUMN notes TEXT NULL");
  $pdo->exec("UPDATE approved_applicants SET notes = note WHERE notes IS NULL");
  echo "Migrated approved_applicants.note -> notes\n";
}

echo "Migration done.\n";

