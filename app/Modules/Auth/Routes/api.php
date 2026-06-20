<?php

/**
 * Auth / User Management Routes
 * Base prefix: /api/users
 */

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\UserController;

// ─── Public: Login / Logout ───────────────────────────────
Route::post('users/login',  [UserController::class, 'login']);

// ─── Protected ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Current user profile
    Route::get('users/me',          [UserController::class, 'me']);
    Route::post('users/logout',     [UserController::class, 'logout']);

    // User CRUD (Super Admin only in controller)
    Route::get('users',             [UserController::class, 'index']);
    Route::post('users',            [UserController::class, 'store']);
    Route::get('users/{id}',        [UserController::class, 'show']);
    Route::put('users/{id}',        [UserController::class, 'update']);
    Route::delete('users/{id}',     [UserController::class, 'destroy']);
});
