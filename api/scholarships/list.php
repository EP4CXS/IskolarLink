<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/db.php';
require_once __DIR__ . '/../_lib/response.php';

try {
  $rows = db()->query("SELECT id, title, description, deadline, slots, benefits_json, criteria_json, status FROM scholarships ORDER BY created_at DESC")->fetchAll();
  $scholarships = array_map(function ($r) {
    $benefits = json_decode((string)($r['benefits_json'] ?? '[]'), true);
    if (!is_array($benefits)) $benefits = [];
    $criteria = json_decode((string)($r['criteria_json'] ?? '{}'), true);
    if (!is_array($criteria)) $criteria = [];
    return [
      'id' => (string)$r['id'],
      'title' => (string)$r['title'],
      'description' => (string)$r['description'],
      'deadline' => (new DateTime((string)$r['deadline']))->format(DATE_ATOM),
      'slots' => (int)$r['slots'],
      'benefits' => $benefits,
      'criteria' => $criteria,
      'status' => (string)$r['status'],
    ];
  }, $rows);

  json_response(['ok' => true, 'scholarships' => $scholarships]);
} catch (Throwable $e) {
  json_error('Failed to load scholarships', 500);
}

