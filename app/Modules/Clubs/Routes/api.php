<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Clubs\Controllers\ClubController;

// Public routes
Route::get('clubs', [ClubController::class, 'index']);
Route::get('clubs/{id}', [ClubController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('clubs', [ClubController::class, 'store']);
    Route::put('clubs/{id}', [ClubController::class, 'update']);
    Route::delete('clubs/{id}', [ClubController::class, 'destroy']);
});
