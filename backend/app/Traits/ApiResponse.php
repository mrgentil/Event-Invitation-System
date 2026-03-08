<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = ['message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    protected function successWithMeta(mixed $data, string $message = 'Success', array $meta = [], int $code = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ], $code);
    }

    protected function created(mixed $data = null, string $message = 'Created'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = ['message' => $message];
        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
