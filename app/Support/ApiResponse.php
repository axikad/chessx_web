<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    /** @param array<string, mixed>|null $meta */
    public static function success(
        mixed $data,
        string $message,
        int $status = 200,
        ?array $meta = null,
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($meta !== null && $meta !== []) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    /** @param array<string, array<int, string>>|null $errors */
    public static function error(
        string $message,
        string $code,
        int $status,
        ?array $errors = null,
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'code' => $code,
        ];

        if ($errors !== null && $errors !== []) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}
