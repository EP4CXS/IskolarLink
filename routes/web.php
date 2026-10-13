<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $index = public_path('index.html');

    if (! is_file($index)) {
        abort(503, 'Frontend assets are missing. Run: cd frontend && npm ci && npm run build');
    }

    return response(file_get_contents($index), 200, [
        'Content-Type' => 'text/html; charset=UTF-8',
    ]);
})->where('any', '^(?!api|sanctum|up).*$');
