<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$studentId = trim((string)($_GET['studentId'] ?? ''));
if ($studentId === '') json_error('Missing studentId', 400);

try {
  $stmt = db()->prepare("
    SELECT application_id, student_id, scholarship_id, scholarship_title, program_type, status, submission_date, archived_at, archived_reason
    FROM student_application_history
    WHERE student_id = ?
    ORDER BY archived_at DESC
  ");
  $stmt->execute([$studentId]);
  $rows = $stmt->fetchAll();
  $history = array_map(function ($r) {
    return [
      'applicationId' => (string)$r['application_id'],
      'studentId' => (string)$r['student_id'],
      'scholarshipId' => (string)$r['scholarship_id'],
      'scholarshipTitle' => (string)$r['scholarship_title'],
      'programType' => (string)($r['program_type'] ?? ''),
      'status' => (string)$r['status'],
      'submissionDate' => $r['submission_date'] ? (new DateTime((string)$r['submission_date']))->format(DATE_ATOM) : null,
      'archivedAt' => (new DateTime((string)$r['archived_at']))->format(DATE_ATOM),
      'archivedReason' => (string)$r['archived_reason'],
    ];
  }, $rows);

  json_response(['ok' => true, 'history' => $history]);
} catch (Throwable $e) {
  json_error('Failed to load application history', 500);
}

