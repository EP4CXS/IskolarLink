<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

try {
  $rows = db()->query("
    SELECT id, title, content, author_id, target_audience, category, grant_release_date, created_at
    FROM announcements
    ORDER BY created_at DESC
  ")->fetchAll();

  $announcements = array_map(function ($r) {
    return [
      'id' => (string)$r['id'],
      'title' => (string)$r['title'],
      'content' => (string)$r['content'],
      'authorId' => (string)$r['author_id'],
      'targetAudience' => (string)$r['target_audience'],
      'category' => (string)$r['category'],
      'grantReleaseDate' => $r['grant_release_date'] ? (new DateTime((string)$r['grant_release_date']))->format(DATE_ATOM) : null,
      'date' => (new DateTime((string)$r['created_at']))->format(DATE_ATOM),
    ];
  }, $rows);

  json_response(['ok' => true, 'announcements' => $announcements]);
} catch (Throwable $e) {
  json_error('Failed to load announcements', 500);
}

