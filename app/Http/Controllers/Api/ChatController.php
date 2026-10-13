<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\ChatGroqRequest;
use App\Services\GroqChatService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function __construct(
        private readonly GroqChatService $groqChatService,
    ) {}

    public function groq(ChatGroqRequest $request): JsonResponse
    {
        try {
            $message = $this->groqChatService->chat($request->validated('messages'));
        } catch (\RuntimeException $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 502;

            return ApiResponse::error($e->getMessage(), $code);
        }

        return ApiResponse::success(['message' => $message]);
    }
}
