<?php
declare(strict_types=1);

function env_load(string $path): array {
  if (!is_file($path)) return [];
  $lines = file($path, FILE_IGNORE_NEW_LINES);
  if ($lines === false) return [];

  $vars = [];
  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) continue;
    if (!str_contains($line, '=')) continue;

    [$k, $v] = explode('=', $line, 2);
    $k = trim($k);
    $v = trim($v);

    // Strip optional surrounding quotes
    if ((str_starts_with($v, '"') && str_ends_with($v, '"')) || (str_starts_with($v, "'") && str_ends_with($v, "'"))) {
      $v = substr($v, 1, -1);
    }
    $vars[$k] = $v;
  }
  return $vars;
}

function env_get(string $key, ?string $default = null): ?string {
  static $cache = null;
  if ($cache === null) {
    $root = dirname(__DIR__, 2);
    $cache = env_load($root . DIRECTORY_SEPARATOR . '.env');
  }
  return $cache[$key] ?? $default;
}

