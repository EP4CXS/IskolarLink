<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

try {
  $rows = db()->query("SELECT id, name, email, role, avatar, profile_json FROM users ORDER BY created_at DESC")->fetchAll();
  $users = array_map(function ($r) {
    $profile = null;
    if (!empty($r['profile_json'])) {
      $decoded = json_decode($r['profile_json'], true);
      $profile = is_array($decoded) ? $decoded : null;
    }
    return [
      'id' => (string)$r['id'],
      'name' => (string)$r['name'],
      'email' => (string)$r['email'],
      'role' => (string)$r['role'],
      'avatar' => $r['avatar'] ?? null,
      'profile' => $profile,
    ];
  }, $rows);

  json_response(['ok' => true, 'users' => $users]);
} catch (Throwable $e) {
  json_error('Failed to load users', 500);
}

