<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\UserController;

// Public Auth routes
Route::post('users/login', [UserController::class, 'login']);

// Protected User routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::post('users', [UserController::class, 'store']);
    Route::put('users/{id}', [UserController::class, 'update']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);
});
