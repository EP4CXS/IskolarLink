<?php
declare(strict_types=1);

/**
 * Resolve approved beneficiaries for announcement targeting.
 * Matches frontend logic in student Announcements / Dashboard.
 *
 * @return list<array{id: string, name: string, email: string}>
 */
function beneficiaries_for_audience(PDO $pdo, string $targetAudience): array {
  $target = trim($targetAudience);
  if (strtolower($target) === 'all-students') {
    return students_all_with_email($pdo);
  }

  $stmt = $pdo->query("
    SELECT DISTINCT u.id, u.name, u.email, s.title AS scholarship_title
    FROM scholarship_applications a
    INNER JOIN users u ON u.id = a.student_id
    INNER JOIN scholarships s ON s.id = a.scholarship_id
    WHERE a.status = 'Approved'
      AND u.role = 'student'
      AND TRIM(u.email) <> ''
  ");
  $rows = $stmt->fetchAll();
  if (!is_array($rows)) {
    return [];
  }

  if ($target === '' || strtolower($target) === 'all') {
    return beneficiaries_dedupe_by_id($rows);
  }

  $filtered = [];
  foreach ($rows as $row) {
    $program = scholarship_detect_program((string)($row['scholarship_title'] ?? ''));
    if ($program === $target) {
      $filtered[] = $row;
    }
  }

  return beneficiaries_dedupe_by_id($filtered);
}

function scholarship_detect_program(string $title): ?string {
  $upper = strtoupper($title);
  if (str_contains($upper, 'CHED-CUSCHO') || str_contains($upper, 'CUSCHO')) {
    return 'CHED-CUSCHO';
  }
  if (
    str_contains($upper, 'CHED - TES') ||
    str_contains($upper, 'CHED-TES') ||
    str_contains($upper, 'TERTIARY EDUCATION SUBSIDY') ||
    str_contains($upper, 'TES')
  ) {
    return 'CHED - TES';
  }
  if (
    str_contains($upper, 'CHED-TDP') ||
    str_contains($upper, 'TULONG DUNONG') ||
    str_contains($upper, 'TDP')
  ) {
    return 'CHED-TDP';
  }
  return null;
}

/**
 * @return list<array{id: string, name: string, email: string}>
 */
function students_all_with_email(PDO $pdo): array {
  $stmt = $pdo->query("
    SELECT id, name, email
    FROM users
    WHERE role = 'student'
      AND TRIM(email) <> ''
  ");
  $rows = $stmt->fetchAll();
  if (!is_array($rows)) {
    return [];
  }
  return beneficiaries_dedupe_by_id($rows);
}

/**
 * @param list<array<string, mixed>> $rows
 * @return list<array{id: string, name: string, email: string}>
 */
function beneficiaries_dedupe_by_id(array $rows): array {
  $seen = [];
  $out = [];
  foreach ($rows as $row) {
    $id = (string)($row['id'] ?? '');
    if ($id === '' || isset($seen[$id])) {
      continue;
    }
    $seen[$id] = true;
    $out[] = [
      'id' => $id,
      'name' => (string)($row['name'] ?? 'Student'),
      'email' => trim((string)($row['email'] ?? '')),
    ];
  }
  return $out;
}

/**
 * @return array{id: string, name: string, email: string}|null
 */
function beneficiary_user_by_id(PDO $pdo, string $studentId): ?array {
  $stmt = $pdo->prepare("
    SELECT id, name, email
    FROM users
    WHERE id = ? AND role = 'student'
    LIMIT 1
  ");
  $stmt->execute([$studentId]);
  $row = $stmt->fetch();
  if (!$row) {
    return null;
  }
  $email = trim((string)($row['email'] ?? ''));
  if ($email === '') {
    return null;
  }
  return [
    'id' => (string)$row['id'],
    'name' => (string)($row['name'] ?? 'Student'),
    'email' => $email,
  ];
}
