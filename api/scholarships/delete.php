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

try {
  $pdo = db();
  $exists = $pdo->prepare("SELECT id FROM scholarships WHERE id = ? LIMIT 1");
  $exists->execute([$id]);
  if (!$exists->fetch()) {
    json_error('Scholarship not found', 404);
  }

  // "Delete" action means scholarship ended/expired, not hard deletion.
  $stmt = $pdo->prepare("UPDATE scholarships SET status = 'Closed' WHERE id = ?");
  $stmt->execute([$id]);
  json_response(['ok' => true]);
} catch (Throwable $e) {
  if ($e instanceof PDOException && $e->getCode() === '23000') {
    json_error('Cannot end scholarship due to linked records.', 409);
  }
  json_error('Failed to end scholarship', 500);
}

