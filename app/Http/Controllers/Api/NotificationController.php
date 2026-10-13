<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\MarkNotificationReadRequest;
use App\Http\Requests\Notification\StoreNotificationRequest;
use App\Models\Notification;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::query()->newestFirst();

        if ($request->user()->isStudent()) {
            $query->where('user_id', $request->user()->id);
        }

        $notifications = $query->get()->map(fn (Notification $n) => $n->toApiArray())->values();

        return ApiResponse::success(['notifications' => $notifications]);
    }

    public function store(StoreNotificationRequest $request): JsonResponse
    {
        $auth = $request->user();
        if ($auth->isStudent() && $auth->id !== $request->validated('userId')) {
            return ApiResponse::error('Forbidden', 403);
        }

        $notification = Notification::query()->create([
            'id' => Notification::newId(),
            'user_id' => $request->validated('userId'),
            'title' => $request->validated('title'),
            'message' => $request->validated('message'),
            'link' => $request->input('link'),
            'is_read' => false,
            'created_at' => now(),
        ]);

        $notification->refresh();

        return ApiResponse::success(['notification' => $notification->toApiArray()], 201);
    }

    public function markRead(MarkNotificationReadRequest $request): JsonResponse
    {
        $notification = Notification::query()->findOrFail($request->validated('id'));

        if ($request->user()->isStudent() && $notification->user_id !== $request->user()->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        $notification->update(['is_read' => true]);

        return ApiResponse::success();
    }
}
