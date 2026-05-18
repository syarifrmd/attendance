<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckProfileSetup
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === \App\Enums\Role::Intern) {
            // Check if user has a profile and a photo
            $profile = $user->profile;

            // Allow them to visit the setup page without being caught in a redirect loop
            if (! $request->routeIs('intern.setup-profile') && ! $request->routeIs('intern.setup-profile.store') && ! $request->routeIs('logout')) {
                if (! $profile || empty($profile->foto) || empty($profile->foto_left) || empty($profile->foto_right)) {
                    return redirect()->route('intern.setup-profile');
                }
            }
        }

        return $next($request);
    }
}
