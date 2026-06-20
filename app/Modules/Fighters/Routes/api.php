<?php

/**
 * Fighter Routes
 * Base prefix: /api/fighters
 */

use Illuminate\Support\Facades\Route;
use App\Modules\Fighters\Controllers\FighterController;

// ─── Public ───────────────────────────────────────────────
Route::get('fighters',       [FighterController::class, 'index']);
Route::get('fighters/{id}',  [FighterController::class, 'show']);

// ─── Protected ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('fighters',              [FighterController::class, 'store']);
    Route::put('fighters/{id}',          [FighterController::class, 'update']);
    Route::delete('fighters/{id}',       [FighterController::class, 'destroy']);
    Route::post('fighters/{id}/verify',  [FighterController::class, 'verify']);
});
