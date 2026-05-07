<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$id = trim((string)($body['id'] ?? ''));
$adminId = trim((string)($body['adminId'] ?? ''));
if ($id === '') json_error('Missing id', 400);

function detect_program_type(string $title): ?string {
  $upper = strtoupper($title);
  if (strpos($upper, 'CHED-CUSCHO') !== false) return 'CHED-CUSCHO';
  if (strpos($upper, 'CHED - TES') !== false || strpos($upper, 'TERTIARY EDUCATION SUBSIDY') !== false) return 'CHED - TES';
  if (strpos($upper, 'CHED-TDP') !== false || strpos($upper, 'TULONG DUNONG') !== false) return 'CHED-TDP';
  return null;
}

try {
  $pdo = db();
  $pdo->beginTransaction();

  $exists = $pdo->prepare("SELECT id, title FROM scholarships WHERE id = ? LIMIT 1");
  $exists->execute([$id]);
  $scholarship = $exists->fetch();
  if (!$scholarship) {
    $pdo->rollBack();
    json_error('Scholarship not found', 404);
  }

  // "Delete" action means scholarship ended/expired, not hard deletion.
  $stmt = $pdo->prepare("UPDATE scholarships SET status = 'Closed' WHERE id = ?");
  $stmt->execute([$id]);

  // Clear grant disbursement records for this ended scholarship program.
  $clearGrants = $pdo->prepare("
    UPDATE scholarship_applications
    SET grant_disbursement_json = NULL, grant_transactions_json = JSON_ARRAY()
    WHERE scholarship_id = ?
  ");
  $clearGrants->execute([$id]);

  $appsStmt = $pdo->prepare("
    SELECT a.id, a.student_id, a.status, a.submission_date, a.answers_json, u.name AS user_name, u.email AS user_email
    FROM scholarship_applications a
    LEFT JOIN users u ON u.id = a.student_id
    WHERE a.scholarship_id = ?
    ORDER BY a.submission_date DESC
  ");
  $appsStmt->execute([$id]);
  $applications = $appsStmt->fetchAll();

  $totalApplicants = count($applications);
  $grantedApplicants = 0;
  foreach ($applications as $app) {
    if ((string)$app['status'] === 'Approved') $grantedApplicants++;
  }

  $programType = detect_program_type((string)$scholarship['title']);
  $now = (new DateTime())->format('Y-m-d H:i:s');

  $upsertHistory = $pdo->prepare("
    INSERT INTO scholarship_history (scholarship_id, title, program_type, ended_at, ended_by, total_applicants, granted_applicants)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      program_type = VALUES(program_type),
      ended_at = VALUES(ended_at),
      ended_by = VALUES(ended_by),
      total_applicants = VALUES(total_applicants),
      granted_applicants = VALUES(granted_applicants)
  ");
  $upsertHistory->execute([
    $id,
    (string)$scholarship['title'],
    $programType,
    $now,
    $adminId !== '' ? $adminId : null,
    $totalApplicants,
    $grantedApplicants,
  ]);

  $historyIdStmt = $pdo->prepare("SELECT id FROM scholarship_history WHERE scholarship_id = ? LIMIT 1");
  $historyIdStmt->execute([$id]);
  $historyId = (int)$historyIdStmt->fetchColumn();

  if ($historyId > 0) {
    $pdo->prepare("DELETE FROM scholarship_history_applicants WHERE history_id = ?")->execute([$historyId]);
    $insertApplicant = $pdo->prepare("
      INSERT INTO scholarship_history_applicants (
        history_id, application_id, student_id, applicant_name, applicant_email, status, submission_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    foreach ($applications as $app) {
      $answers = json_decode((string)($app['answers_json'] ?? '{}'), true);
      if (!is_array($answers)) $answers = [];
      $insertApplicant->execute([
        $historyId,
        (string)$app['id'],
        (string)$app['student_id'],
        trim((string)($answers['fullName'] ?? '')) !== '' ? (string)$answers['fullName'] : (string)($app['user_name'] ?? ''),
        trim((string)($answers['email'] ?? '')) !== '' ? (string)$answers['email'] : (string)($app['user_email'] ?? ''),
        (string)$app['status'],
        $app['submission_date'] ? (new DateTime((string)$app['submission_date']))->format('Y-m-d H:i:s') : null,
      ]);
    }
  }

  $studentHistoryUpsert = $pdo->prepare("
    INSERT INTO student_application_history
    (application_id, student_id, scholarship_id, scholarship_title, program_type, status, submission_date, archived_at, archived_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      student_id = VALUES(student_id),
      scholarship_id = VALUES(scholarship_id),
      scholarship_title = VALUES(scholarship_title),
      program_type = VALUES(program_type),
      status = VALUES(status),
      submission_date = VALUES(submission_date),
      archived_at = VALUES(archived_at),
      archived_reason = VALUES(archived_reason)
  ");
  foreach ($applications as $app) {
    $studentHistoryUpsert->execute([
      (string)$app['id'],
      (string)$app['student_id'],
      $id,
      (string)$scholarship['title'],
      $programType,
      (string)$app['status'],
      (string)$app['submission_date'],
      $now,
      'Scholarship Ended'
    ]);
  }

  $pdo->commit();
  json_response(['ok' => true]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  if ($e instanceof PDOException && $e->getCode() === '23000') {
    json_error('Cannot end scholarship due to linked records.', 409);
  }
  json_error('Failed to end scholarship', 500);
}

