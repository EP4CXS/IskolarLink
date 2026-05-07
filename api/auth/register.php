<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) json_error('Invalid JSON body', 400);

$name = trim((string)($body['name'] ?? ''));
$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');
if ($name === '' || $email === '' || $password === '') json_error('Name, email, and password are required', 400);

try {
  $pdo = db();

  $check = $pdo->prepare("SELECT 1 FROM users WHERE email = ? LIMIT 1");
  $check->execute([$email]);
  if ($check->fetch()) json_error('Email already in use', 409);

  $hashed = password_hash($password, PASSWORD_DEFAULT);
  $id = bin2hex(random_bytes(16));
  $profile = [
    'course' => '',
    'yearLevel' => 1,
    'gpa' => 0,
    'income' => 0,
    'phone' => '',
    'address' => '',
  ];

  $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, profile_json) VALUES (?, ?, ?, ?, 'student', ?)");
  $stmt->execute([$id, $name, $email, $hashed, json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

  json_response([
    'ok' => true,
    'user' => [
      'id' => (string)$id,
      'name' => $name,
      'email' => $email,
      'role' => 'student',
      'avatar' => null,
      'profile' => $profile,
    ]
  ], 201);
} catch (Throwable $e) {
  json_error('Registration failed', 500);
}

