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
  db()->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?")->execute([$id]);
  json_response(['ok' => true]);
} catch (Throwable $e) {
  json_error('Failed to mark notification as read', 500);
}

