<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

try {
  $rows = db()->query("
    SELECT id, user_id, title, message, link, is_read, created_at
    FROM notifications
    ORDER BY created_at DESC
  ")->fetchAll();

  $notifications = array_map(function ($r) {
    return [
      'id' => (string)$r['id'],
      'userId' => (string)$r['user_id'],
      'title' => (string)$r['title'],
      'message' => (string)$r['message'],
      'link' => $r['link'] !== null ? (string)$r['link'] : null,
      'read' => (bool)$r['is_read'],
      'date' => (new DateTime((string)$r['created_at']))->format(DATE_ATOM),
    ];
  }, $rows);

  json_response(['ok' => true, 'notifications' => $notifications]);
} catch (Throwable $e) {
  json_error('Failed to load notifications', 500);
}

