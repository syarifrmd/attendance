<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restrict access to users with manager-level roles (mentor or admin).
 */
class EnsureMentor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isManager()) {
            abort(403);
        }

        return $next($request);
    }
}
