<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$id = trim((string)($body['id'] ?? ''));
$title = trim((string)($body['title'] ?? ''));
$content = trim((string)($body['content'] ?? ''));
$targetAudience = trim((string)($body['targetAudience'] ?? 'all'));
$category = trim((string)($body['category'] ?? 'general'));
$grantReleaseDate = isset($body['grantReleaseDate']) ? trim((string)$body['grantReleaseDate']) : null;

if ($id === '' || $title === '' || $content === '') json_error('Missing required fields', 400);
if (!in_array($category, ['general', 'grant-release'], true)) json_error('Invalid category', 400);

try {
  $pdo = db();
  $release = null;
  if ($grantReleaseDate) {
    $release = (new DateTime($grantReleaseDate))->format('Y-m-d H:i:s');
  }

  $stmt = $pdo->prepare("
    UPDATE announcements
    SET title = ?, content = ?, target_audience = ?, category = ?, grant_release_date = ?
    WHERE id = ?
  ");
  $stmt->execute([$title, $content, $targetAudience, $category, $release, $id]);

  $fetch = $pdo->prepare("
    SELECT id, title, content, author_id, target_audience, category, grant_release_date, created_at
    FROM announcements
    WHERE id = ?
    LIMIT 1
  ");
  $fetch->execute([$id]);
  $r = $fetch->fetch();
  if (!$r) json_error('Announcement not found', 404);

  json_response([
    'ok' => true,
    'announcement' => [
      'id' => (string)$r['id'],
      'title' => (string)$r['title'],
      'content' => (string)$r['content'],
      'authorId' => (string)$r['author_id'],
      'targetAudience' => (string)$r['target_audience'],
      'category' => (string)$r['category'],
      'grantReleaseDate' => $r['grant_release_date'] ? (new DateTime((string)$r['grant_release_date']))->format(DATE_ATOM) : null,
      'date' => (new DateTime((string)$r['created_at']))->format(DATE_ATOM),
    ]
  ]);
} catch (Throwable $e) {
  json_error('Failed to update announcement', 500);
}

