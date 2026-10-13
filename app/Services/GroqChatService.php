<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

final class GroqChatService
{
    /**
     * @param  list<array{role: string, content: string}>  $messages
     */
    public function chat(array $messages): string
    {
        $apiKey = config('iskolarlink.groq_api_key');
        if (! $apiKey) {
            throw new \RuntimeException('Chat is not configured (missing GROQ_API_KEY)', 503);
        }

        $model = config('iskolarlink.groq_model', 'llama-3.3-70b-versatile');

        $response = Http::timeout(90)
            ->withToken($apiKey)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.6,
                'max_tokens' => 1024,
            ]);

        if (! $response->successful()) {
            $message = $response->json('error.message') ?? 'AI request failed';
            throw new \RuntimeException($message, $response->status());
        }

        $content = $response->json('choices.0.message.content');
        if (! is_string($content) || trim($content) === '') {
            throw new \RuntimeException('No reply content from AI service', 502);
        }

        return trim($content);
    }
}
