<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/uuid.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$userId = trim((string)($body['userId'] ?? ''));
$title = trim((string)($body['title'] ?? ''));
$message = trim((string)($body['message'] ?? ''));
$link = isset($body['link']) ? trim((string)$body['link']) : null;

if ($userId === '' || $title === '' || $message === '') json_error('Missing required fields', 400);

try {
  $id = uuid_v4();
  $stmt = db()->prepare("
    INSERT INTO notifications (id, user_id, title, message, link, is_read)
    VALUES (?, ?, ?, ?, ?, 0)
  ");
  $stmt->execute([$id, $userId, $title, $message, $link ?: null]);

  json_response([
    'ok' => true,
    'notification' => [
      'id' => $id,
      'userId' => $userId,
      'title' => $title,
      'message' => $message,
      'link' => $link ?: null,
      'read' => false,
      'date' => (new DateTime())->format(DATE_ATOM),
    ]
  ], 201);
} catch (Throwable $e) {
  json_error('Failed to create notification', 500);
}

