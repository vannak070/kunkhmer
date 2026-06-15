<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Settings\Controllers\SettingController;

// Public routes
Route::get('settings/sponsors', [SettingController::class, 'indexSponsors']);
Route::get('settings/broadcast-stations', [SettingController::class, 'indexBroadcastStations']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('settings/sponsors', [SettingController::class, 'storeSponsor']);
    Route::put('settings/sponsors/{id}', [SettingController::class, 'updateSponsor']);
    Route::delete('settings/sponsors/{id}', [SettingController::class, 'destroySponsor']);

    Route::post('settings/broadcast-stations', [SettingController::class, 'storeBroadcastStation']);
    Route::put('settings/broadcast-stations/{id}', [SettingController::class, 'updateBroadcastStation']);
    Route::delete('settings/broadcast-stations/{id}', [SettingController::class, 'destroyBroadcastStation']);
});
