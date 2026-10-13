<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $id = $request->query('id');
        if (! is_string($id) || $id === '') {
            return ApiResponse::error('Missing id', 400);
        }

        $user = User::query()->find($id);
        if (! $user) {
            return ApiResponse::error('User not found', 404);
        }

        $auth = $request->user();
        if ($auth->id !== $user->id && ! $auth->isAdmin()) {
            return ApiResponse::error('Forbidden', 403);
        }

        return ApiResponse::success(['user' => $user->toApiArray()]);
    }

    public function index(): JsonResponse
    {
        $users = User::query()->orderBy('created_at', 'desc')->get();

        return ApiResponse::success([
            'users' => $users->map(fn (User $user) => $user->toApiArray())->values(),
        ]);
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        $user = User::query()->findOrFail($request->validated('id'));
        $auth = $request->user();

        if ($auth->id !== $user->id && ! $auth->isAdmin()) {
            return ApiResponse::error('Forbidden', 403);
        }

        $payload = [];
        if ($request->has('name')) {
            $payload['name'] = $request->validated('name');
        }
        if ($request->has('avatar')) {
            $payload['avatar'] = $request->input('avatar');
        }
        if ($request->has('ip_status')) {
            $payload['ip_status'] = $request->validated('ip_status');
        }
        if ($request->has('indigenous_group')) {
            $payload['indigenous_group'] = $request->validated('indigenous_group');
        }
        if ($request->has('profile')) {
            $profile = array_merge(
                $user->profile_json ?? [],
                $request->validated('profile')
            );

            $payload['profile_json'] = $profile;
            if (array_key_exists('ipStatus', $profile)) {
                $payload['ip_status'] = $profile['ipStatus'] ?? null;
            }
            if (array_key_exists('indigenousGroup', $profile)) {
                $payload['indigenous_group'] = $profile['indigenousGroup'] ?? null;
            }
        }

        $user->update($payload);

        return ApiResponse::success(['user' => $user->fresh()->toApiArray()]);
    }
}
