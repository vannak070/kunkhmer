<?php

use Illuminate\Support\Facades\Route;

// Fallback: Redirect all web requests (like /login or /home/fighters) to the React Admin Portal
Route::fallback(function () {
    return redirect('http://localhost:5175' . request()->getRequestUri());
});
