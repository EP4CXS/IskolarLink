<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;

  $host = env_get('DB_HOST', '127.0.0.1');
  $port = env_get('DB_PORT', '3306');
  $name = env_get('DB_NAME', 'iskolarlink');
  $user = env_get('DB_USER', 'root');
  $pass = env_get('DB_PASS', '');

  $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  return $pdo;
}

