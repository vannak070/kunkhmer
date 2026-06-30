<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Video\Controllers\VideoController;

Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/{id}', [VideoController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/videos', [VideoController::class, 'store']);
    Route::put('/videos/{id}', [VideoController::class, 'update']);
    Route::delete('/videos/{id}', [VideoController::class, 'destroy']);
});
