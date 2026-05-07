<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/uuid.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$id = trim((string)($body['id'] ?? ''));
$status = trim((string)($body['status'] ?? ''));
$note = array_key_exists('note', $body) ? (string)$body['note'] : null;
$author = array_key_exists('author', $body) ? (string)$body['author'] : null;
$rubric = array_key_exists('rubric', $body) ? $body['rubric'] : null;

if ($id === '' || $status === '') json_error('Missing required fields', 400);
if (!in_array($status, ['Pending', 'Under Review', 'Screened', 'Approved', 'Rejected'], true)) {
  json_error('Invalid status', 400);
}
if ($rubric !== null && !is_array($rubric)) json_error('Invalid rubric', 400);

try {
  $pdo = db();
  $pdo->beginTransaction();

  $stmt = $pdo->prepare("SELECT * FROM scholarship_applications WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $app = $stmt->fetch();
  if (!$app) {
    $pdo->rollBack();
    json_error('Application not found', 404);
  }

  $timeline = json_decode((string)($app['timeline_json'] ?? '[]'), true);
  if (!is_array($timeline)) $timeline = [];
  $event = [
    'id' => uuid_v4(),
    'status' => $status,
    'date' => (new DateTime())->format(DATE_ATOM),
    'note' => $note,
    'author' => $author,
  ];
  $timeline[] = $event;

  $rubricToSave = $rubric !== null ? $rubric : json_decode((string)($app['rubric_json'] ?? 'null'), true);
  if (!is_array($rubricToSave)) $rubricToSave = null;
  $now = (new DateTime())->format('Y-m-d H:i:s');

  $update = $pdo->prepare("
    UPDATE scholarship_applications
    SET status = ?, timeline_json = ?, rubric_json = ?, reviewed_at = ?, reviewed_by = ?, review_note = ?
    WHERE id = ?
  ");
  $update->execute([
    $status,
    json_encode($timeline, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    $rubricToSave ? json_encode($rubricToSave, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
    $now,
    $author ?: null,
    $note ?: null,
    $id,
  ]);

  $studentId = (string)$app['student_id'];
  $scholarshipId = (string)$app['scholarship_id'];

  if ($status === 'Approved') {
    $pdo->prepare("DELETE FROM rejected_applicants WHERE application_id = ?")->execute([$id]);
    $pdo->prepare("
      INSERT INTO approved_applicants (application_id, student_id, scholarship_id, approved_at, notes, approved_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE approved_at = VALUES(approved_at), notes = VALUES(notes), approved_by = VALUES(approved_by)
    ")->execute([$id, $studentId, $scholarshipId, $now, $note, $author]);
  } elseif ($status === 'Rejected') {
    $pdo->prepare("DELETE FROM approved_applicants WHERE application_id = ?")->execute([$id]);
    $pdo->prepare("
      INSERT INTO rejected_applicants (application_id, student_id, scholarship_id, rejected_at, reason, rejected_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rejected_at = VALUES(rejected_at), reason = VALUES(reason), rejected_by = VALUES(rejected_by)
    ")->execute([$id, $studentId, $scholarshipId, $now, $note, $author]);
  }

  $pdo->commit();

  json_response([
    'ok' => true,
    'application' => [
      'id' => $id,
      'studentId' => $studentId,
      'scholarshipId' => $scholarshipId,
      'status' => $status,
      'submissionDate' => (new DateTime((string)$app['submission_date']))->format(DATE_ATOM),
      'timeline' => $timeline,
      'documents' => json_decode((string)($app['documents_json'] ?? '[]'), true) ?: [],
      'answers' => json_decode((string)($app['answers_json'] ?? '{}'), true) ?: [],
      'rubricScore' => $rubricToSave,
      'grantDisbursement' => json_decode((string)($app['grant_disbursement_json'] ?? 'null'), true) ?: null,
      'grantTransactions' => json_decode((string)($app['grant_transactions_json'] ?? '[]'), true) ?: [],
    ],
  ]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  json_error('Failed to update application status', 500);
}

