<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Champions\Controllers\ChampionController;

// Public routes
Route::get('champions', [ChampionController::class, 'index']);
Route::get('champions/{id}', [ChampionController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('champions', [ChampionController::class, 'store']);
    Route::put('champions/{id}', [ChampionController::class, 'update']);
    Route::delete('champions/{id}', [ChampionController::class, 'destroy']);
});
