<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\WebAuthController;
use App\Http\Controllers\Web\WebHomeController;
use App\Http\Controllers\Web\WebFighterController;
use App\Http\Controllers\Web\WebClubController;
use App\Http\Controllers\Web\WebEventController;
use App\Http\Controllers\Web\WebMatchController;
use App\Http\Controllers\Web\WebChampionController;
use App\Http\Controllers\Web\WebPartnerController;

// Auth Routes
Route::get('login', [WebAuthController::class, 'showLogin'])->name('login');
Route::post('login', [WebAuthController::class, 'login']);
Route::post('logout', [WebAuthController::class, 'logout'])->name('logout');

// Root Route
Route::get('/', function () {
    return redirect()->route('web.home');
});

// Protected Dashboard Routes
Route::middleware(['auth'])->prefix('home')->group(function () {
    // Dashboard
    Route::get('/', [WebHomeController::class, 'index'])->name('web.home');

    // Fighters
    Route::get('fighters', [WebFighterController::class, 'index'])->name('web.fighters.index');
    Route::get('fighters/create', [WebFighterController::class, 'create'])->name('web.fighters.create');
    Route::post('fighters', [WebFighterController::class, 'store'])->name('web.fighters.store');
    Route::get('fighters/{id}', [WebFighterController::class, 'show'])->name('web.fighters.show');

    // Clubs
    Route::get('clubs', [WebClubController::class, 'index'])->name('web.clubs.index');
    Route::get('clubs/{id}', [WebClubController::class, 'show'])->name('web.clubs.show');

    // Events
    Route::get('events', [WebEventController::class, 'index'])->name('web.events.index');
    Route::get('events/{id}', [WebEventController::class, 'show'])->name('web.events.show');

    // Matches & Batches
    Route::get('matches', [WebMatchController::class, 'index'])->name('web.matches.index');
    Route::get('matches/new', [WebMatchController::class, 'create'])->name('web.matches.create');
    Route::post('matches/new', [WebMatchController::class, 'store'])->name('web.matches.store');
    Route::get('matches/batches/{id}', [WebMatchController::class, 'showBatch'])->name('web.matches.batch.show');

    // Champions
    Route::get('champions', [WebChampionController::class, 'index'])->name('web.champions.index');
    Route::get('champions/{id}/history', [WebChampionController::class, 'history'])->name('web.champions.history');

    // Strategic Partners
    Route::get('partners', [WebPartnerController::class, 'index'])->name('web.partners.index');
});
