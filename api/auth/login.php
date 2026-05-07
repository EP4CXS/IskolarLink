<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');
if ($email === '' || $password === '') json_error('Email and password are required', 400);

try {
  $stmt = db()->prepare("SELECT id, name, email, role, password, avatar, profile_json FROM users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  $r = $stmt->fetch();
  if (!$r) json_error('Invalid credentials', 401);

  $stored = (string)($r['password'] ?? '');
  $ok = false;

  // Prefer secure hash verification (Laravel / standard PHP password_hash)
  if ($stored !== '' && password_verify($password, $stored)) {
    $ok = true;
  } elseif ($stored !== '' && $stored === $password) {
    // Dev fallback if an account was stored in plaintext
    $ok = true;
  }

  if (!$ok) json_error('Invalid credentials', 401);

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
  json_error('Login failed', 500);
}

