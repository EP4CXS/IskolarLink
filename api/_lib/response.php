<?php
declare(strict_types=1);

function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void {
  json_response(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

