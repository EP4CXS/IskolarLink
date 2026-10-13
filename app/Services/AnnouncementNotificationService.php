<?php

namespace App\Services;

use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

final class AnnouncementNotificationService
{
    public function __construct(
        private readonly BeneficiaryResolver $beneficiaryResolver,
    ) {}

    /**
     * Create in-app notifications immediately; send emails after the HTTP response.
     *
     * @return array{notifications: int, emailsSent: int, emailsFailed: int, emailsQueued: bool}
     */
    public function notify(
        string $title,
        string $content,
        string $targetAudience,
        ?Carbon $postedAt = null,
    ): array
    {
        $recipients = $this->beneficiaryResolver->forAudience($targetAudience);
        $stats = [
            'notifications' => 0,
            'emailsSent' => 0,
            'emailsFailed' => 0,
            'emailsQueued' => false,
        ];

        if ($recipients->isEmpty()) {
            return $stats;
        }

        $stats['notifications'] = $this->createInAppNotifications(
            $title,
            $content,
            $recipients,
            $postedAt ?? now(),
        );

        if (config('iskolarlink.mail_enabled', true)) {
            $stats['emailsQueued'] = true;
            $this->queueEmailsAfterResponse(
                $recipients,
                $title,
                $content,
                $this->audienceLabel($targetAudience),
            );
        }

        return $stats;
    }

    /**
     * @param  Collection<int, array{id: string, name: string, email: string}>  $recipients
     */
    private function createInAppNotifications(
        string $title,
        string $content,
        Collection $recipients,
        Carbon $postedAt,
    ): int {
        $notifTitle = 'New announcement: '.$title;
        $notifMessage = Str::limit($content, 200);
        $rows = [];

        foreach ($recipients as $recipient) {
            $rows[] = [
                'id' => Notification::newId(),
                'user_id' => $recipient['id'],
                'title' => $notifTitle,
                'message' => $notifMessage,
                'link' => '/student/announcements',
                'is_read' => false,
                'created_at' => $postedAt,
            ];
        }

        foreach (array_chunk($rows, 250) as $chunk) {
            Notification::query()->insert($chunk);
        }

        return count($rows);
    }

    /**
     * @param  Collection<int, array{id: string, name: string, email: string}>  $recipients
     */
    private function queueEmailsAfterResponse(
        Collection $recipients,
        string $title,
        string $content,
        string $audienceLabel,
    ): void {
        $payload = [
            'recipients' => $recipients->values()->all(),
            'title' => $title,
            'content' => $content,
            'audienceLabel' => $audienceLabel,
        ];

        $send = function () use ($payload): void {
            $this->sendQueuedEmails($payload);
        };

        if (function_exists('defer')) {
            defer($send);

            return;
        }

        app()->terminating($send);
    }

    /**
     * @param  array{recipients: list<array{id: string, name: string, email: string}>, title: string, content: string, audienceLabel: string}  $payload
     */
    private function sendQueuedEmails(array $payload): void
    {
        foreach ($payload['recipients'] as $recipient) {
            $this->sendEmail(
                $recipient,
                $payload['title'],
                $payload['content'],
                $payload['audienceLabel'],
            );
        }
    }

    private function audienceLabel(string $targetAudience): string
    {
        $audienceKey = strtolower(trim($targetAudience));

        return match ($audienceKey) {
            'all-students' => 'all students',
            'all' => 'all beneficiaries',
            default => trim($targetAudience),
        };
    }

    /**
     * @param  array{id: string, name: string, email: string}  $recipient
     */
    private function sendEmail(array $recipient, string $title, string $content, string $audienceLabel): bool
    {
        try {
            Mail::raw(
                "Hello {$recipient['name']},\n\n"
                ."A new announcement has been posted for {$audienceLabel}.\n\n"
                ."{$title}\n"
                .str_repeat('-', 40)."\n"
                .$content."\n\n"
                ."Sign in to IskolarLink to read more.\n",
                function ($message) use ($recipient, $title) {
                    $message->to($recipient['email'], $recipient['name'])
                        ->subject('IskolarLink — '.$title);
                }
            );

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
