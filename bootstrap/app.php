<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);

        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonApiResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return \App\Support\ApiResponse::validationError(
                'Validation failed',
                $e->errors()
            );
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return \App\Support\ApiResponse::error('Unauthenticated', 401);
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $message = $e->getMessage() !== '' ? $e->getMessage() : 'Request failed';

            return \App\Support\ApiResponse::error($message, $e->getStatusCode());
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return \App\Support\ApiResponse::error('Resource not found', 404);
        });

        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return \App\Support\ApiResponse::error(
                'CSRF token mismatch. API routes use Bearer token authentication only.',
                419
            );
        });
    })->create();
