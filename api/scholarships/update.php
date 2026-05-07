<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$id = trim((string)($body['id'] ?? ''));
if ($id === '') json_error('Missing id', 400);

$allowed = ['title', 'description', 'deadline', 'slots', 'benefits', 'criteria', 'status'];
$fields = [];
$params = [];

foreach ($allowed as $k) {
  if (!array_key_exists($k, $body)) continue;
  if ($k === 'deadline') {
    $fields[] = 'deadline = ?';
    $params[] = (new DateTime((string)$body[$k]))->format('Y-m-d H:i:s');
  } elseif ($k === 'benefits') {
    if (!is_array($body[$k])) json_error('Invalid benefits', 400);
    $fields[] = 'benefits_json = ?';
    $params[] = json_encode(array_values($body[$k]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  } elseif ($k === 'criteria') {
    if (!is_array($body[$k])) json_error('Invalid criteria', 400);
    $fields[] = 'criteria_json = ?';
    $params[] = json_encode($body[$k], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  } elseif ($k === 'status') {
    $status = (string)$body[$k];
    if (!in_array($status, ['Active', 'Closed', 'Draft'], true)) json_error('Invalid status', 400);
    $fields[] = 'status = ?';
    $params[] = $status;
  } elseif ($k === 'slots') {
    $fields[] = 'slots = ?';
    $params[] = (int)$body[$k];
  } else {
    $fields[] = "{$k} = ?";
    $params[] = trim((string)$body[$k]);
  }
}

if (count($fields) === 0) json_error('No updates provided', 400);

try {
  $params[] = $id;
  $stmt = db()->prepare("UPDATE scholarships SET " . implode(', ', $fields) . " WHERE id = ?");
  $stmt->execute($params);

  $fetch = db()->prepare("SELECT id, title, description, deadline, slots, benefits_json, criteria_json, status FROM scholarships WHERE id = ? LIMIT 1");
  $fetch->execute([$id]);
  $r = $fetch->fetch();
  if (!$r) json_error('Scholarship not found', 404);

  $benefits = json_decode((string)($r['benefits_json'] ?? '[]'), true);
  $criteria = json_decode((string)($r['criteria_json'] ?? '{}'), true);
  if (!is_array($benefits)) $benefits = [];
  if (!is_array($criteria)) $criteria = [];

  json_response([
    'ok' => true,
    'scholarship' => [
      'id' => (string)$r['id'],
      'title' => (string)$r['title'],
      'description' => (string)$r['description'],
      'deadline' => (new DateTime((string)$r['deadline']))->format(DATE_ATOM),
      'slots' => (int)$r['slots'],
      'benefits' => $benefits,
      'criteria' => $criteria,
      'status' => (string)$r['status'],
    ]
  ]);
} catch (Throwable $e) {
  json_error('Failed to update scholarship', 500);
}

