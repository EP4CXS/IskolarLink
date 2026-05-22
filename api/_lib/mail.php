<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

function mail_is_configured(): bool {
  if (env_get('MAIL_ENABLED', 'true') === 'false') {
    return false;
  }
  $host = trim((string)env_get('MAIL_HOST', ''));
  $user = trim((string)env_get('MAIL_USERNAME', ''));
  $pass = (string)env_get('MAIL_PASSWORD', '');
  $from = trim((string)env_get('MAIL_FROM', ''));
  return $host !== '' && $from !== '' && $user !== '' && $pass !== '';
}

/**
 * @return array{ok: bool, error?: string}
 */
function mail_send(
  string $toEmail,
  string $toName,
  string $subject,
  string $textBody,
  ?string $htmlBody = null
): array {
  if (!mail_is_configured()) {
    return ['ok' => false, 'error' => 'Mail is not configured'];
  }

  $host = trim((string)env_get('MAIL_HOST', ''));
  $port = (int)env_get('MAIL_PORT', '587');
  $user = trim((string)env_get('MAIL_USERNAME', ''));
  $pass = (string)env_get('MAIL_PASSWORD', '');
  $from = trim((string)env_get('MAIL_FROM', ''));
  $fromName = trim((string)env_get('MAIL_FROM_NAME', 'IskolarLink'));
  $encryption = strtolower(trim((string)env_get('MAIL_ENCRYPTION', 'tls')));

  if ($htmlBody === null) {
    $htmlBody = nl2br(htmlspecialchars($textBody, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
  }

  $boundary = 'b_' . bin2hex(random_bytes(8));
  $messageId = '<' . bin2hex(random_bytes(12)) . '@iskolarlink.local>';

  $headers = [
    'From: ' . mail_format_address($from, $fromName),
    'To: ' . mail_format_address($toEmail, $toName),
    'Subject: ' . mail_encode_header($subject),
    'MIME-Version: 1.0',
    'Message-ID: ' . $messageId,
    'Date: ' . date('r'),
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
  ];

  $body = "--{$boundary}\r\n";
  $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
  $body .= $textBody . "\r\n\r\n";
  $body .= "--{$boundary}\r\n";
  $body .= "Content-Type: text/html; charset=UTF-8\r\n";
  $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
  $body .= mail_html_wrap($subject, $htmlBody) . "\r\n\r\n";
  $body .= "--{$boundary}--\r\n";

  try {
    mail_smtp_send($host, $port, $encryption, $user, $pass, $from, $toEmail, $headers, $body);
    return ['ok' => true];
  } catch (Throwable $e) {
    return ['ok' => false, 'error' => $e->getMessage()];
  }
}

function mail_format_address(string $email, string $name): string {
  $email = trim($email);
  $name = trim($name);
  if ($name === '') {
    return $email;
  }
  return mail_encode_header($name) . " <{$email}>";
}

function mail_encode_header(string $value): string {
  if (preg_match('/[^\x20-\x7E]/', $value)) {
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
  }
  return $value;
}

function mail_html_wrap(string $title, string $innerHtml): string {
  $safeTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'
    . $safeTitle
    . '</title></head><body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#1f2937;">'
    . $innerHtml
    . '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">'
    . '<p style="font-size:12px;color:#6b7280;">This message was sent by IskolarLink. Please do not reply to this email.</p>'
    . '</body></html>';
}

/**
 * @param list<string> $headers
 */
function mail_smtp_send(
  string $host,
  int $port,
  string $encryption,
  string $username,
  string $password,
  string $fromEmail,
  string $toEmail,
  array $headers,
  string $body
): void {
  $remote = $host;
  if ($encryption === 'ssl') {
    $remote = 'ssl://' . $host;
  }

  $socket = @stream_socket_client(
    "{$remote}:{$port}",
    $errno,
    $errstr,
    30,
    STREAM_CLIENT_CONNECT
  );
  if ($socket === false) {
    throw new RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
  }

  stream_set_timeout($socket, 30);

  mail_smtp_expect($socket, [220]);
  mail_smtp_cmd($socket, 'EHLO iskolarlink.local', [250]);

  if ($encryption === 'tls') {
    mail_smtp_cmd($socket, 'STARTTLS', [220]);
    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
      throw new RuntimeException('SMTP STARTTLS failed');
    }
    mail_smtp_cmd($socket, 'EHLO iskolarlink.local', [250]);
  }

  mail_smtp_cmd($socket, 'AUTH LOGIN', [334]);
  mail_smtp_cmd($socket, base64_encode($username), [334]);
  mail_smtp_cmd($socket, base64_encode($password), [235]);

  mail_smtp_cmd($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
  mail_smtp_cmd($socket, 'RCPT TO:<' . $toEmail . '>', [250, 251]);
  mail_smtp_cmd($socket, 'DATA', [354]);

  $data = implode("\r\n", $headers) . "\r\n\r\n" . $body;
  $data = preg_replace("/\r\n\./", "\r\n..", $data) ?? $data;
  fwrite($socket, $data . "\r\n.\r\n");
  mail_smtp_expect($socket, [250]);

  mail_smtp_cmd($socket, 'QUIT', [221]);
  fclose($socket);
}

function mail_smtp_cmd($socket, string $cmd, array $okCodes): void {
  fwrite($socket, $cmd . "\r\n");
  mail_smtp_expect($socket, $okCodes);
}

function mail_smtp_expect($socket, array $okCodes): void {
  $response = '';
  while (($line = fgets($socket, 515)) !== false) {
    $response .= $line;
    if (isset($line[3]) && $line[3] === ' ') {
      break;
    }
  }
  if ($response === '') {
    throw new RuntimeException('SMTP empty response');
  }
  $code = (int)substr($response, 0, 3);
  if (!in_array($code, $okCodes, true)) {
    throw new RuntimeException('SMTP error: ' . trim($response));
  }
}
