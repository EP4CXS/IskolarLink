<?php
declare(strict_types=1);

require_once __DIR__ . '/../_lib/cors.php';
require_once __DIR__ . '/../_lib/env.php';
require_once __DIR__ . '/../_lib/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($body)) {
  json_error('Invalid JSON body', 400);
}

$messagesIn = $body['messages'] ?? null;
if (!is_array($messagesIn) || $messagesIn === []) {
  json_error('messages must be a non-empty array', 400);
}

$maxMessages = 40;
if (count($messagesIn) > $maxMessages) {
  json_error('Too many messages in history', 400);
}

$messages = [];
foreach ($messagesIn as $i => $m) {
  if (!is_array($m)) {
    json_error('Invalid message at index ' . $i, 400);
  }
  $role = (string)($m['role'] ?? '');
  $content = (string)($m['content'] ?? '');
  if (!in_array($role, ['system', 'user', 'assistant'], true)) {
    json_error('Invalid role at index ' . $i, 400);
  }
  if ($content === '') {
    json_error('Empty content at index ' . $i, 400);
  }
  if (strlen($content) > 12000) {
    json_error('Message too long at index ' . $i, 400);
  }
  $messages[] = ['role' => $role, 'content' => $content];
}

$apiKey = env_get('GROQ_API_KEY', '');
if ($apiKey === null || $apiKey === '') {
  json_error('Chat is not configured (missing GROQ_API_KEY)', 503);
}

$model = env_get('GROQ_MODEL', 'llama-3.3-70b-versatile');
if ($model === null || $model === '') {
  $model = 'llama-3.3-70b-versatile';
}

$payload = json_encode([
  'model' => $model,
  'messages' => $messages,
  'temperature' => 0.6,
  'max_tokens' => 1024,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($payload === false) {
  json_error('Failed to encode request', 500);
}

$url = 'https://api.groq.com/openai/v1/chat/completions';

$responseBody = null;
$httpCode = 0;

if (function_exists('curl_init')) {
  $ch = curl_init($url);
  if ($ch === false) {
    json_error('Could not start request', 500);
  }
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 90,
  ]);
  $responseBody = curl_exec($ch);
  $curlErr = curl_error($ch);
  $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($responseBody === false || $responseBody === '') {
    json_error($curlErr !== '' ? 'Upstream request failed' : 'Empty response from AI service', 502);
  }
} else {
  // Laragon / Windows PHP often ships without ext-curl; use streams instead.
  $headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
    'Connection: close',
  ];
  $ctx = stream_context_create([
    'http' => [
      'method' => 'POST',
      'header' => implode("\r\n", $headers) . "\r\n",
      'content' => $payload,
      'timeout' => 90,
      'ignore_errors' => true,
    ],
    'ssl' => [
      'verify_peer' => true,
      'verify_peer_name' => true,
    ],
  ]);
  $responseBody = @file_get_contents($url, false, $ctx);
  if ($responseBody === false || $responseBody === '') {
    json_error('Upstream request failed (enable php_curl or allow_openssl)', 502);
  }
  if (isset($http_response_header[0]) && preg_match('#\b(\d{3})\b#', $http_response_header[0], $m)) {
    $httpCode = (int)$m[1];
  }
}

$decoded = json_decode($responseBody, true);
if (!is_array($decoded)) {
  json_error('Invalid response from AI service', 502);
}

// stream wrapper does not always populate status; infer success from body.
if ($httpCode === 0 && isset($decoded['choices'][0])) {
  $httpCode = 200;
}

if ($httpCode < 200 || $httpCode >= 300) {
  $errMsg = 'AI request failed';
  if (isset($decoded['error']['message']) && is_string($decoded['error']['message'])) {
    $errMsg = $decoded['error']['message'];
  }
  json_error($errMsg, $httpCode >= 400 && $httpCode < 600 ? $httpCode : 502);
}

$choice = $decoded['choices'][0] ?? null;
$content = null;
if (is_array($choice)) {
  $msg = $choice['message'] ?? null;
  if (is_array($msg) && isset($msg['content'])) {
    $content = is_string($msg['content']) ? $msg['content'] : null;
  }
}

if ($content === null || trim($content) === '') {
  json_error('No reply content from AI service', 502);
}

json_response([
  'ok' => true,
  'message' => trim($content),
]);
