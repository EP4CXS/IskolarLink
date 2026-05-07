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
$content = trim((string)($body['content'] ?? ''));
$authorId = trim((string)($body['authorId'] ?? ''));
$targetAudience = trim((string)($body['targetAudience'] ?? 'all'));
$category = trim((string)($body['category'] ?? 'general'));
$grantReleaseDate = isset($body['grantReleaseDate']) ? trim((string)$body['grantReleaseDate']) : null;

if ($title === '' || $content === '' || $authorId === '') json_error('Missing required fields', 400);
if (!in_array($category, ['general', 'grant-release'], true)) json_error('Invalid category', 400);

try {
  $id = uuid_v4();
  $release = null;
  if ($grantReleaseDate) {
    $release = (new DateTime($grantReleaseDate))->format('Y-m-d H:i:s');
  }

  $stmt = db()->prepare("
    INSERT INTO announcements (id, title, content, author_id, target_audience, category, grant_release_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([$id, $title, $content, $authorId, $targetAudience, $category, $release]);

  json_response([
    'ok' => true,
    'announcement' => [
      'id' => $id,
      'title' => $title,
      'content' => $content,
      'authorId' => $authorId,
      'targetAudience' => $targetAudience,
      'category' => $category,
      'grantReleaseDate' => $release ? (new DateTime($release))->format(DATE_ATOM) : null,
      'date' => (new DateTime())->format(DATE_ATOM),
    ]
  ], 201);
} catch (Throwable $e) {
  json_error('Failed to create announcement', 500);
}

