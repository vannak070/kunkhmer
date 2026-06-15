<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Fighters\Controllers\FighterController;

// Public routes
Route::get('fighters', [FighterController::class, 'index']);
Route::get('fighters/{id}', [FighterController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('fighters', [FighterController::class, 'store']);
    Route::put('fighters/{id}', [FighterController::class, 'update']);
    Route::post('fighters/{id}/verify', [FighterController::class, 'verify']);
    Route::delete('fighters/{id}', [FighterController::class, 'destroy']);
});
