<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return ApiResponse::error('Invalid email or password.', 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return ApiResponse::success([
            'success' => true,
            'user' => $user->toApiArray(),
            'role' => $user->role,
            'token' => $token,
            'access_token' => $token,
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $profile = [
            'course' => '',
            'yearLevel' => 1,
            'gpa' => 0,
            'income' => 0,
            'phone' => '',
            'address' => '',
            'ipStatus' => '',
            'indigenousGroup' => '',
        ];

        $user = User::query()->create([
            'id' => bin2hex(random_bytes(16)),
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => 'student',
            'profile_json' => $profile,
            'ip_status' => null,
            'indigenous_group' => null,
            'created_at' => now(),
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return ApiResponse::success([
            'success' => true,
            'user' => $user->toApiArray(),
            'role' => $user->role,
            'token' => $token,
            'access_token' => $token,
        ], 201);
    }

    public function me(): JsonResponse
    {
        return ApiResponse::success([
            'user' => request()->user()->toApiArray(),
        ]);
    }

    public function logout(): JsonResponse
    {
        request()->user()->currentAccessToken()?->delete();

        return ApiResponse::success();
    }
}
