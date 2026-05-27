<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use App\Notifications\VerifyAccountNotification;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['google' => 'Gagal login menggunakan Google. Silakan coba lagi.']);
        }

        // Cek apakah user dengan google_id tersebut sudah ada
        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            // Cek apakah email sudah terdaftar via metode biasa
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Binding google_id
                $user->update([
                    'google_id' => $googleUser->getId(),
                ]);
            } else {
                // Buat user baru
                $user = User::create([
                    'name' => $googleUser->getName() ?? 'Intern',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role' => Role::Intern,
                    'password' => null, // Tidak menggunakan password
                ]);
                $user->markEmailAsVerified(); // Auto verifikasi email karena via Google
            }
        }

        Auth::login($user, true);

        if ($user->role === Role::Intern) {
            if (empty($user->nim) || ! $user->nim_verified_at) {
                $user->notify(new VerifyAccountNotification);

                return redirect()->route('intern.verify-notice');
            }
        }

        return redirect()->intended('/dashboard');
    }
}
