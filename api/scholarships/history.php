<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

try {
  $pdo = db();
  $rows = $pdo->query("
    SELECT id, scholarship_id, title, program_type, ended_at, ended_by, total_applicants, granted_applicants
    FROM scholarship_history
    ORDER BY ended_at DESC
  ")->fetchAll();

  $history = [];
  $appStmt = $pdo->prepare("
    SELECT application_id, student_id, applicant_name, applicant_email, status, submission_date
    FROM scholarship_history_applicants
    WHERE history_id = ?
    ORDER BY submission_date DESC
  ");

  foreach ($rows as $r) {
    $historyId = (int)$r['id'];
    $appStmt->execute([$historyId]);
    $apps = $appStmt->fetchAll();
    $applicants = array_map(function ($a) {
      return [
        'applicationId' => (string)$a['application_id'],
        'studentId' => (string)($a['student_id'] ?? ''),
        'name' => (string)($a['applicant_name'] ?? ''),
        'email' => (string)($a['applicant_email'] ?? ''),
        'status' => (string)$a['status'],
        'submissionDate' => $a['submission_date'] ? (new DateTime((string)$a['submission_date']))->format(DATE_ATOM) : null,
      ];
    }, $apps);

    $history[] = [
      'id' => (string)$historyId,
      'scholarshipId' => (string)$r['scholarship_id'],
      'title' => (string)$r['title'],
      'programType' => (string)($r['program_type'] ?? ''),
      'endedAt' => (new DateTime((string)$r['ended_at']))->format(DATE_ATOM),
      'endedBy' => (string)($r['ended_by'] ?? ''),
      'totalApplicants' => (int)$r['total_applicants'],
      'grantedApplicants' => (int)$r['granted_applicants'],
      'applicants' => $applicants,
    ];
  }

  json_response(['ok' => true, 'history' => $history]);
} catch (Throwable $e) {
  json_error('Failed to load scholarship history', 500);
}

