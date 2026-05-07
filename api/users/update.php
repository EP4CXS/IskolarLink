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

$hasName = array_key_exists('name', $body);
$hasAvatar = array_key_exists('avatar', $body);
$hasProfile = array_key_exists('profile', $body);

$name = $hasName ? trim((string)$body['name']) : null;
$avatar = $hasAvatar ? $body['avatar'] : null;
$profile = $hasProfile ? $body['profile'] : null;

if ($hasName && $name === '') json_error('Name cannot be empty', 400);
if ($hasAvatar && $avatar !== null && !is_string($avatar)) json_error('Invalid avatar value', 400);
if ($hasProfile && !is_array($profile)) json_error('Invalid profile value', 400);

if (!$hasName && !$hasAvatar && !$hasProfile) {
  json_error('No updates provided', 400);
}

try {
  $pdo = db();

  $check = $pdo->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
  $check->execute([$id]);
  if (!$check->fetch()) json_error('User not found', 404);

  $fields = [];
  $params = [];

  if ($hasName) {
    $fields[] = 'name = ?';
    $params[] = $name;
  }

  if ($hasAvatar) {
    $fields[] = 'avatar = ?';
    $params[] = $avatar;
  }

  if ($hasProfile) {
    $fields[] = 'profile_json = ?';
    $params[] = json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  }

  $params[] = $id;
  $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  $fetch = $pdo->prepare("SELECT id, name, email, role, avatar, profile_json FROM users WHERE id = ? LIMIT 1");
  $fetch->execute([$id]);
  $r = $fetch->fetch();
  if (!$r) json_error('User not found after update', 404);

  $decoded = null;
  if (!empty($r['profile_json'])) {
    $tmp = json_decode((string)$r['profile_json'], true);
    $decoded = is_array($tmp) ? $tmp : null;
  }

  json_response([
    'ok' => true,
    'user' => [
      'id' => (string)$r['id'],
      'name' => (string)$r['name'],
      'email' => (string)$r['email'],
      'role' => (string)$r['role'],
      'avatar' => $r['avatar'] ?? null,
      'profile' => $decoded,
    ]
  ]);
} catch (Throwable $e) {
  json_error('Failed to update user', 500);
}

