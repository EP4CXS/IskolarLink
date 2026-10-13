<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function success(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json(['ok' => true] + $data, $status);
    }

    public static function error(string $message, int $status = 400, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'ok' => false,
            'error' => $message,
        ], $extra), $status);
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    public static function validationError(string $message, array $errors, int $status = 422): JsonResponse
    {
        return response()->json([
            'ok' => false,
            'error' => $message,
            'errors' => $errors,
        ], $status);
    }
}
