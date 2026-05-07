<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/uuid.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$studentId = trim((string)($body['studentId'] ?? ''));
$scholarshipId = trim((string)($body['scholarshipId'] ?? ''));
$documents = $body['documents'] ?? [];
$answers = $body['answers'] ?? [];

if ($studentId === '' || $scholarshipId === '') json_error('Missing required fields', 400);
if (!is_array($documents) || !is_array($answers)) json_error('Invalid payload', 400);

try {
  $pdo = db();
  $checkStudent = $pdo->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
  $checkStudent->execute([$studentId]);
  if (!$checkStudent->fetch()) {
    json_error('Student account not found. Please log in again.', 404);
  }

  $checkScholarship = $pdo->prepare("SELECT id FROM scholarships WHERE id = ? LIMIT 1");
  $checkScholarship->execute([$scholarshipId]);
  if (!$checkScholarship->fetch()) {
    json_error('Scholarship not found or already removed.', 404);
  }

  $id = uuid_v4();
  $submission = new DateTime();
  $timeline = [[
    'id' => uuid_v4(),
    'status' => 'Pending',
    'date' => $submission->format(DATE_ATOM),
    'note' => 'Application submitted successfully.',
  ]];

  $stmt = $pdo->prepare("
    INSERT INTO scholarship_applications
    (id, student_id, scholarship_id, status, submission_date, timeline_json, documents_json, answers_json, rubric_json, grant_disbursement_json, grant_transactions_json)
    VALUES
    (?, ?, ?, 'Pending', ?, ?, ?, ?, NULL, NULL, ?)
  ");
  $stmt->execute([
    $id,
    $studentId,
    $scholarshipId,
    $submission->format('Y-m-d H:i:s'),
    json_encode($timeline, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    json_encode($documents, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
  ]);

  json_response([
    'ok' => true,
    'application' => [
      'id' => $id,
      'studentId' => $studentId,
      'scholarshipId' => $scholarshipId,
      'status' => 'Pending',
      'submissionDate' => $submission->format(DATE_ATOM),
      'timeline' => $timeline,
      'documents' => $documents,
      'answers' => $answers,
      'grantTransactions' => [],
    ]
  ], 201);
} catch (PDOException $e) {
  $msg = $e->getMessage();
  if (
    $e->getCode() === '23000' &&
    (str_contains($msg, 'uq_application_student_scholarship') || str_contains($msg, 'Duplicate entry'))
  ) {
    json_error('You already applied for this scholarship', 409);
  }
  if ($e->getCode() === '23000') {
    json_error('Application cannot be saved because related student/scholarship record is missing.', 409);
  }
  json_error('Failed to create application', 500);
} catch (Throwable $e) {
  json_error('Failed to create application', 500);
}

