<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Matches\Controllers\MatchController;

// Public routes
Route::get('matches/batches', [MatchController::class, 'indexSubEvents']);
Route::get('matches/batches/{id}', [MatchController::class, 'showSubEvent']);
Route::get('matches', [MatchController::class, 'index']);
Route::get('matches/{id}', [MatchController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('matches/batches', [MatchController::class, 'storeSubEvent']);
    Route::put('matches/batches/{id}', [MatchController::class, 'updateSubEvent']);
    Route::delete('matches/batches/{id}', [MatchController::class, 'destroySubEvent']);

    Route::post('matches', [MatchController::class, 'store']);
    Route::put('matches/{id}', [MatchController::class, 'update']);
    Route::delete('matches/{id}', [MatchController::class, 'destroy']);
    
    Route::post('matches/{id}/result', [MatchController::class, 'setMatchResult']);
});
