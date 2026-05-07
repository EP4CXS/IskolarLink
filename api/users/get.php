<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$id = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
if ($id === '') json_error('Missing id', 400);

try {
  $stmt = db()->prepare("SELECT id, name, email, role, avatar, profile_json FROM users WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
  $r = $stmt->fetch();
  if (!$r) json_error('User not found', 404);

  $profile = null;
  if (!empty($r['profile_json'])) {
    $decoded = json_decode($r['profile_json'], true);
    $profile = is_array($decoded) ? $decoded : null;
  }

  json_response([
    'ok' => true,
    'user' => [
      'id' => (string)$r['id'],
      'name' => (string)$r['name'],
      'email' => (string)$r['email'],
      'role' => (string)$r['role'],
      'avatar' => $r['avatar'] ?? null,
      'profile' => $profile,
    ]
  ]);
} catch (Throwable $e) {
  json_error('Failed to load user', 500);
}

