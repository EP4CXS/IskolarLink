<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

function decode_json_array($value): array {
  $decoded = json_decode((string)$value, true);
  return is_array($decoded) ? $decoded : [];
}

function safe_iso_datetime($value): string {
  $raw = trim((string)$value);
  if ($raw === '') return gmdate('c', 0);
  try {
    return (new DateTime($raw))->format(DATE_ATOM);
  } catch (Throwable $e) {
    return gmdate('c', 0);
  }
}

try {
  $rows = db()->query("
    SELECT id, student_id, scholarship_id, status, submission_date, timeline_json, documents_json, answers_json, rubric_json, grant_disbursement_json, grant_transactions_json
    FROM scholarship_applications
    ORDER BY submission_date DESC
  ")->fetchAll();

  $applications = [];
  foreach ($rows as $r) {
    $rubric = json_decode((string)($r['rubric_json'] ?? 'null'), true);
    if (!is_array($rubric)) $rubric = null;
    $grant = json_decode((string)($r['grant_disbursement_json'] ?? 'null'), true);
    if (!is_array($grant)) $grant = null;
    $applications[] = [
      'id' => (string)($r['id'] ?? ''),
      'studentId' => (string)($r['student_id'] ?? ''),
      'scholarshipId' => (string)($r['scholarship_id'] ?? ''),
      'status' => (string)($r['status'] ?? 'Pending'),
      'submissionDate' => safe_iso_datetime($r['submission_date'] ?? ''),
      'timeline' => decode_json_array($r['timeline_json'] ?? '[]'),
      'documents' => decode_json_array($r['documents_json'] ?? '[]'),
      'answers' => decode_json_array($r['answers_json'] ?? '{}'),
      'rubricScore' => $rubric,
      'grantDisbursement' => $grant,
      'grantTransactions' => decode_json_array($r['grant_transactions_json'] ?? '[]'),
    ];
  }

  json_response(['ok' => true, 'applications' => $applications]);
} catch (Throwable $e) {
  json_error('Failed to load applications', 500);
}

