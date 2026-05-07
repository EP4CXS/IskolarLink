<?php
declare(strict_types=1);

// Quick DB inspection helper for Windows environments without mysql CLI.
// Usage: php tools/db_inspect.php

$host = $argv[1] ?? '127.0.0.1';
$port = $argv[2] ?? '3306';
$dbName = $argv[3] ?? 'iskolarlink';
$dsnBase = "mysql:host={$host};port={$port};charset=utf8mb4";
$user = 'root';
$pass = 'ep@cs82005';

$pdo = new PDO($dsnBase, $user, $pass, [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

echo "== DATABASES ==\n";
$dbs = $pdo->query('SHOW DATABASES')->fetchAll(PDO::FETCH_NUM);
foreach ($dbs as $d) {
  echo $d[0] . "\n";
}

echo "\n== USING DATABASE ==\n{$dbName}\n";
$pdo->exec("USE `{$dbName}`");

function describe(PDO $pdo, string $table): void {
  echo "\n== DESCRIBE {$table} ==\n";
  try {
    $rows = $pdo->query("DESCRIBE `{$table}`")->fetchAll();
    foreach ($rows as $r) {
      echo "{$r['Field']}\t{$r['Type']}\t{$r['Null']}\t{$r['Key']}\t{$r['Default']}\t{$r['Extra']}\n";
    }
  } catch (Throwable $e) {
    echo "(table not found)\n";
  }
}

$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
echo "== TABLES ==\n";
foreach ($tables as $t) {
  echo $t[0] . "\n";
}

describe($pdo, 'users');
describe($pdo, 'scholarships');
describe($pdo, 'announcements');
describe($pdo, 'scholarship_applications');
describe($pdo, 'approved_applicants');
describe($pdo, 'rejected_applicants');
describe($pdo, 'notifications');

