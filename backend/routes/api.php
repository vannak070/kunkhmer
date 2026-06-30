<?php

/**
 * ============================================================
 *  KUN KHMER FEDERATION — Central REST API Router
 * ============================================================
 *  All routes are prefixed with /api (set in bootstrap/app.php)
 *  Authentication: Laravel Sanctum (Bearer token)
 *
 *  Response format (consistent across all endpoints):
 *    { "success": true|false, "data": {...}|[...], "error": "..." }
 *
 *  Public endpoints  → no middleware
 *  Protected endpoints → middleware('auth:sanctum')
 * ============================================================
 */

use Illuminate\Support\Facades\Route;

/*
|----------------------------------------------------------
| 1. Auth / Users  →  /api/users/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Auth/Routes/api.php';

/*
|----------------------------------------------------------
| 2. Fighters  →  /api/fighters/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Fighters/Routes/api.php';

/*
|----------------------------------------------------------
| 3. Clubs  →  /api/clubs/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Clubs/Routes/api.php';

/*
|----------------------------------------------------------
| 4. Events  →  /api/events/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Events/Routes/api.php';

/*
|----------------------------------------------------------
| 5. Matches & Batches  →  /api/matches/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Matches/Routes/api.php';

/*
|----------------------------------------------------------
| 6. Champions  →  /api/champions/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Champions/Routes/api.php';

/*
|----------------------------------------------------------
| 7. Settings (Sponsors / Broadcast)  →  /api/settings/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Settings/Routes/api.php';

/*
|----------------------------------------------------------
| 8. News Articles  →  /api/news/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/News/Routes/api.php';

/*
|----------------------------------------------------------
| 9. Videos  →  /api/videos/*
|----------------------------------------------------------
*/
require __DIR__.'/../app/Modules/Video/Routes/api.php';
