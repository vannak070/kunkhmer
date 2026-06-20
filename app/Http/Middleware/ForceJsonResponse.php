<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ForceJsonResponse
 *
 * Ensures that all API responses include the correct Content-Type header
 * so React's fetch() always receives JSON (even on Laravel error pages).
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        // Tell Laravel to always return JSON on /api routes
        $request->headers->set('Accept', 'application/json');

        $response = $next($request);

        // Set JSON content type if not already set
        if (!$response->headers->has('Content-Type') ||
            str_contains($response->headers->get('Content-Type', ''), 'text/html')
        ) {
            $response->headers->set('Content-Type', 'application/json');
        }

        return $response;
    }
}
