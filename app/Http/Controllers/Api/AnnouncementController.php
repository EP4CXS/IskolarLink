<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\DeleteAnnouncementRequest;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Services\AnnouncementNotificationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function __construct(
        private readonly AnnouncementNotificationService $notificationService,
    ) {}

    public function index(): JsonResponse
    {
        $announcements = Announcement::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $a) => $a->toApiArray());

        return ApiResponse::success(['announcements' => $announcements]);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::query()->create([
            'id' => (string) Str::uuid(),
            'title' => $request->validated('title'),
            'content' => $request->validated('content'),
            'author_id' => $request->validated('authorId'),
            'target_audience' => $request->validated('targetAudience'),
            'category' => 'general',
            'grant_release_date' => null,
            'created_at' => now(),
        ]);

        $notify = $this->notificationService->notify(
            $announcement->title,
            $announcement->content,
            $announcement->target_audience,
            $announcement->created_at,
        );

        return ApiResponse::success([
            'message' => 'Announcement posted successfully.',
            'announcement' => $announcement->fresh()->toApiArray(),
            'notify' => $notify,
        ], 201);
    }

    public function update(UpdateAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::query()->findOrFail($request->validated('id'));

        $announcement->update([
            'title' => $request->validated('title'),
            'content' => $request->validated('content'),
            'target_audience' => $request->validated('targetAudience'),
            'category' => 'general',
            'grant_release_date' => null,
        ]);

        return ApiResponse::success(['announcement' => $announcement->fresh()->toApiArray()]);
    }

    public function destroy(DeleteAnnouncementRequest $request): JsonResponse
    {
        Announcement::query()->where('id', $request->validated('id'))->delete();

        return ApiResponse::success();
    }
}
