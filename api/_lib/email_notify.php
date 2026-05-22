<?php
declare(strict_types=1);

require_once __DIR__ . '/beneficiaries.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/uuid.php';

/**
 * @return array{notifications: int, emailsSent: int, emailsFailed: int}
 */
function email_notify_announcement(
  PDO $pdo,
  string $title,
  string $content,
  string $targetAudience
): array {
  $recipients = beneficiaries_for_audience($pdo, $targetAudience);
  $stats = ['notifications' => 0, 'emailsSent' => 0, 'emailsFailed' => 0];

  $audienceKey = strtolower(trim($targetAudience));
  $audienceLabel = match ($audienceKey) {
    'all-students' => 'all students',
    'all' => 'all beneficiaries',
    default => trim($targetAudience),
  };

  $notifTitle = 'New announcement: ' . $title;
  $contentLen = function_exists('mb_strlen') ? mb_strlen($content) : strlen($content);
  $notifMessage = $contentLen > 200
    ? ((function_exists('mb_substr') ? mb_substr($content, 0, 197) : substr($content, 0, 197)) . '...')
    : $content;

  foreach ($recipients as $recipient) {
    try {
      $notifId = uuid_v4();
      $stmt = $pdo->prepare("
        INSERT INTO notifications (id, user_id, title, message, link, is_read)
        VALUES (?, ?, ?, ?, '/student/announcements', 0)
      ");
      $stmt->execute([
        $notifId,
        $recipient['id'],
        $notifTitle,
        $notifMessage,
      ]);
      $stats['notifications']++;
    } catch (Throwable $e) {
      // Continue with email even if in-app notification insert fails.
    }

    $subject = 'IskolarLink — ' . $title;
    $text = "Hello {$recipient['name']},\n\n"
      . "A new announcement has been posted for {$audienceLabel}.\n\n"
      . "{$title}\n"
      . str_repeat('-', 40) . "\n"
      . $content . "\n\n"
      . "Sign in to IskolarLink to read more.\n";

    $html = '<p>Hello <strong>' . htmlspecialchars($recipient['name'], ENT_QUOTES, 'UTF-8') . '</strong>,</p>'
      . '<p>A new announcement has been posted for <strong>'
      . htmlspecialchars($audienceLabel, ENT_QUOTES, 'UTF-8')
      . '</strong>.</p>'
      . '<h2 style="color:#0284c7;margin:16px 0 8px;">'
      . htmlspecialchars($title, ENT_QUOTES, 'UTF-8')
      . '</h2>'
      . '<div style="white-space:pre-wrap;">'
      . nl2br(htmlspecialchars($content, ENT_QUOTES, 'UTF-8'))
      . '</div>';

    $result = mail_send($recipient['email'], $recipient['name'], $subject, $text, $html);
    if ($result['ok']) {
      $stats['emailsSent']++;
    } else {
      $stats['emailsFailed']++;
    }
  }

  return $stats;
}

/**
 * @param array<string, mixed> $details
 * @return array{notification: bool, emailSent: bool}
 */
function email_notify_grant_disbursement(
  PDO $pdo,
  string $studentId,
  string $applicationId,
  array $details,
  ?string $scholarshipTitle = null
): array {
  $result = ['notification' => false, 'emailSent' => false];

  $recipient = beneficiary_user_by_id($pdo, $studentId);
  if ($recipient === null) {
    return $result;
  }

  $amount = isset($details['amount']) ? (float)$details['amount'] : 0.0;
  $method = trim((string)($details['method'] ?? 'N/A'));
  $reference = trim((string)($details['reference'] ?? ''));
  $note = trim((string)($details['note'] ?? ''));
  $formattedAmount = '₱' . number_format($amount, 2);

  $notifTitle = 'Scholarship Grant Released';
  $notifMessage = "Your grant of {$formattedAmount} has been released via {$method}."
    . ($reference !== '' ? " Reference: {$reference}." : '');

  try {
    $notifId = uuid_v4();
    $stmt = $pdo->prepare("
      INSERT INTO notifications (id, user_id, title, message, link, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    ");
    $link = '/student/applications/' . $applicationId;
    $stmt->execute([$notifId, $recipient['id'], $notifTitle, $notifMessage, $link]);
    $result['notification'] = true;
  } catch (Throwable $e) {
    // Client may also create notification; continue to email.
  }

  $scholarshipLine = $scholarshipTitle !== null && $scholarshipTitle !== ''
    ? "Scholarship: {$scholarshipTitle}\n"
    : '';

  $subject = 'IskolarLink — Grant released';
  $text = "Hello {$recipient['name']},\n\n"
    . "Your scholarship grant has been released.\n\n"
    . $scholarshipLine
    . "Amount: {$formattedAmount}\n"
    . "Method: {$method}\n"
    . "Reference: {$reference}\n"
    . ($note !== '' ? "Note: {$note}\n" : '')
    . "\nSign in to IskolarLink to view your application details.\n";

  $html = '<p>Hello <strong>' . htmlspecialchars($recipient['name'], ENT_QUOTES, 'UTF-8') . '</strong>,</p>'
    . '<p>Your scholarship grant has been released.</p>'
    . '<ul style="padding-left:20px;">'
    . ($scholarshipTitle ? '<li><strong>Scholarship:</strong> ' . htmlspecialchars($scholarshipTitle, ENT_QUOTES, 'UTF-8') . '</li>' : '')
    . '<li><strong>Amount:</strong> ' . htmlspecialchars($formattedAmount, ENT_QUOTES, 'UTF-8') . '</li>'
    . '<li><strong>Method:</strong> ' . htmlspecialchars($method, ENT_QUOTES, 'UTF-8') . '</li>'
    . '<li><strong>Reference:</strong> ' . htmlspecialchars($reference, ENT_QUOTES, 'UTF-8') . '</li>'
    . ($note !== '' ? '<li><strong>Note:</strong> ' . htmlspecialchars($note, ENT_QUOTES, 'UTF-8') . '</li>' : '')
    . '</ul>';

  $mailResult = mail_send($recipient['email'], $recipient['name'], $subject, $text, $html);
  $result['emailSent'] = $mailResult['ok'];

  return $result;
}
