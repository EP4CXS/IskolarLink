<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardStatsService $dashboardStatsService,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = $user->isAdmin()
            ? $this->dashboardStatsService->forAdmin()
            : $this->dashboardStatsService->forStudent($user->id);

        return ApiResponse::success(['stats' => $stats]);
    }
}
