<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/uuid.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$title = trim((string)($body['title'] ?? ''));
$description = trim((string)($body['description'] ?? ''));
$deadline = trim((string)($body['deadline'] ?? ''));
$slots = (int)($body['slots'] ?? 0);
$benefits = $body['benefits'] ?? [];
$criteria = $body['criteria'] ?? [];
$status = trim((string)($body['status'] ?? 'Draft'));

if ($title === '' || $description === '' || $deadline === '') {
  json_error('Missing required fields', 400);
}
if (!in_array($status, ['Active', 'Closed', 'Draft'], true)) json_error('Invalid status', 400);
if (!is_array($benefits) || !is_array($criteria)) json_error('Invalid payload', 400);

try {
  $id = uuid_v4();
  $deadlineDt = new DateTime($deadline);

  $stmt = db()->prepare("
    INSERT INTO scholarships (id, title, description, deadline, slots, benefits_json, criteria_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
    $id,
    $title,
    $description,
    $deadlineDt->format('Y-m-d H:i:s'),
    $slots,
    json_encode(array_values($benefits), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    json_encode($criteria, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    $status,
  ]);

  json_response([
    'ok' => true,
    'scholarship' => [
      'id' => $id,
      'title' => $title,
      'description' => $description,
      'deadline' => $deadlineDt->format(DATE_ATOM),
      'slots' => $slots,
      'benefits' => array_values($benefits),
      'criteria' => $criteria,
      'status' => $status,
    ]
  ], 201);
} catch (Throwable $e) {
  json_error('Failed to create scholarship', 500);
}

