<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$id = trim((string)($body['id'] ?? ''));
$details = $body['details'] ?? null;
if ($id === '' || !is_array($details)) json_error('Missing required fields', 400);

try {
  $pdo = db();
  $stmt = $pdo->prepare("SELECT * FROM scholarship_applications WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $app = $stmt->fetch();
  if (!$app) json_error('Application not found', 404);

  $existingTransactions = json_decode((string)($app['grant_transactions_json'] ?? '[]'), true);
  if (!is_array($existingTransactions)) $existingTransactions = [];
  $existingTransactions[] = $details;

  $update = $pdo->prepare("
    UPDATE scholarship_applications
    SET grant_disbursement_json = ?, grant_transactions_json = ?
    WHERE id = ?
  ");
  $update->execute([
    json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    json_encode($existingTransactions, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    $id,
  ]);

  $timeline = json_decode((string)($app['timeline_json'] ?? '[]'), true);
  $documents = json_decode((string)($app['documents_json'] ?? '[]'), true);
  $answers = json_decode((string)($app['answers_json'] ?? '{}'), true);
  $rubric = json_decode((string)($app['rubric_json'] ?? 'null'), true);

  json_response([
    'ok' => true,
    'application' => [
      'id' => (string)$app['id'],
      'studentId' => (string)$app['student_id'],
      'scholarshipId' => (string)$app['scholarship_id'],
      'status' => (string)$app['status'],
      'submissionDate' => (new DateTime((string)$app['submission_date']))->format(DATE_ATOM),
      'timeline' => is_array($timeline) ? $timeline : [],
      'documents' => is_array($documents) ? $documents : [],
      'answers' => is_array($answers) ? $answers : [],
      'rubricScore' => is_array($rubric) ? $rubric : null,
      'grantDisbursement' => $details,
      'grantTransactions' => $existingTransactions,
    ]
  ]);
} catch (Throwable $e) {
  json_error('Failed to record disbursement', 500);
}

