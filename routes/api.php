<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ScholarshipApplicationController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| IskolarLink API — Laravel conversion of the legacy PHP backend
|--------------------------------------------------------------------------
| Modern REST paths and legacy .php aliases (for React migration) map to the
| same controller actions. All protected routes require Sanctum Bearer token.
|
| Auth (stateless Bearer tokens, no CSRF): POST /api/auth/login → { ok, user, token }
| Header: Authorization: Bearer {token}
*/

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login.php', [AuthController::class, 'login']);
    Route::post('/register.php', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Users
    Route::get('/users', [UserController::class, 'index'])->middleware('role:admin');
    Route::get('/users/list.php', [UserController::class, 'index'])->middleware('role:admin');
    Route::get('/users/show', [UserController::class, 'show']);
    Route::get('/users/get.php', [UserController::class, 'show']);
    Route::post('/users/update', [UserController::class, 'update']);
    Route::post('/users/update.php', [UserController::class, 'update']);

    // Scholarships
    Route::get('/scholarships', [ScholarshipController::class, 'index']);
    Route::get('/scholarships/list.php', [ScholarshipController::class, 'index']);
    Route::get('/scholarships/active', [ScholarshipController::class, 'active']);
    Route::get('/scholarships/active.php', [ScholarshipController::class, 'active']);
    Route::post('/scholarships', [ScholarshipController::class, 'store'])->middleware('role:admin');
    Route::post('/scholarships/create.php', [ScholarshipController::class, 'store'])->middleware('role:admin');
    Route::post('/scholarships/update', [ScholarshipController::class, 'update'])->middleware('role:admin');
    Route::post('/scholarships/update.php', [ScholarshipController::class, 'update'])->middleware('role:admin');
    Route::post('/scholarships/close', [ScholarshipController::class, 'close'])->middleware('role:admin');
    Route::post('/scholarships/delete', [ScholarshipController::class, 'close'])->middleware('role:admin');
    Route::post('/scholarships/delete.php', [ScholarshipController::class, 'close'])->middleware('role:admin');
    Route::get('/scholarships/history', [ScholarshipController::class, 'history']);
    Route::get('/scholarships/history.php', [ScholarshipController::class, 'history']);

    // Applications
    Route::get('/applications', [ScholarshipApplicationController::class, 'index']);
    Route::get('/applications/list.php', [ScholarshipApplicationController::class, 'index']);
    Route::post('/applications', [ScholarshipApplicationController::class, 'store'])->middleware('role:student');
    Route::post('/applications/create.php', [ScholarshipApplicationController::class, 'store'])->middleware('role:student');
    Route::post('/applications/status', [ScholarshipApplicationController::class, 'updateStatus'])->middleware('role:admin');
    Route::post('/applications/update_status.php', [ScholarshipApplicationController::class, 'updateStatus'])->middleware('role:admin');
    Route::get('/applications/history', [ScholarshipApplicationController::class, 'studentHistory']);
    Route::get('/applications/history.php', [ScholarshipApplicationController::class, 'studentHistory']);

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/list.php', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store'])->middleware('role:admin');
    Route::post('/announcements/create.php', [AnnouncementController::class, 'store'])->middleware('role:admin');
    Route::post('/announcements/update', [AnnouncementController::class, 'update'])->middleware('role:admin');
    Route::post('/announcements/update.php', [AnnouncementController::class, 'update'])->middleware('role:admin');
    Route::post('/announcements/delete', [AnnouncementController::class, 'destroy'])->middleware('role:admin');
    Route::post('/announcements/delete.php', [AnnouncementController::class, 'destroy'])->middleware('role:admin');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/list.php', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/create.php', [NotificationController::class, 'store']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark_read.php', [NotificationController::class, 'markRead']);

    // Chatbot (Groq)
    Route::post('/chat/groq', [ChatController::class, 'groq'])->middleware('role:student');
    Route::post('/chat/groq.php', [ChatController::class, 'groq'])->middleware('role:student');
});
