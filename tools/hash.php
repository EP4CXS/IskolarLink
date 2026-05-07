<?php
declare(strict_types=1);

// Usage:
// php tools/hash.php "plainPassword"

$plain = $argv[1] ?? '';
if ($plain === '') {
  fwrite(STDERR, "Missing password argument.\n");
  exit(1);
}

echo password_hash($plain, PASSWORD_DEFAULT) . PHP_EOL;

