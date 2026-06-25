<?php

use Illuminate\Support\Facades\Route;

// Fallback: Redirect web requests to the React admin portal
Route::fallback(function () {
    $adminUrl = env('FRONTEND_ADMIN_URL', env('FRONTEND_URL', 'http://localhost:5175'));

    return redirect($adminUrl . request()->getRequestUri());
});
