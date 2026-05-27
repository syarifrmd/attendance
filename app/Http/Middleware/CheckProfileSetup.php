<?php

namespace App\Http\Middleware;

use App\Enums\Role;
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

        if ($user && $user->role === Role::Intern) {
            // Allow them to visit the setup and claim page without being caught in a redirect loop
            if (! $request->routeIs('intern.setup-profile') && ! $request->routeIs('intern.setup-profile.store') && ! $request->routeIs('intern.claim-nim') && ! $request->routeIs('intern.claim-nim.store') && ! $request->routeIs('intern.verify-notice') && ! $request->routeIs('logout')) {
                // Periksa apakah NIM sudah diklaim
                if (empty($user->nim) || ! $user->nim_verified_at) {
                    return redirect()->route('intern.verify-notice');
                }

                // Setelah klaim NIM, periksa apakah foto wajah sudah di-setup
                if (empty($user->foto) || empty($user->foto_left) || empty($user->foto_right)) {
                    return redirect()->route('intern.setup-profile');
                }
            }
        }

        return $next($request);
    }
}
