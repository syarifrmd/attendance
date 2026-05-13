<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\MentorController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Role-based root dashboard redirect
    Route::get('dashboard', function () {
        if (auth()->user()->role === 'mentor') {
            return redirect()->route('mentor.dashboard');
        }

        return redirect()->route('intern.dashboard');
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | INTERN ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('intern')->name('intern.')->group(function () {
        // Setup Profile routes (Exempt from profile.setup middleware)
        Route::get('setup-profile', [InternController::class, 'setupProfile'])->name('setup-profile');
        Route::post('setup-profile', [InternController::class, 'storeProfile'])->name('setup-profile.store');

        // Core Intern routes (Protected by profile.setup middleware)
        Route::middleware(['profile.setup'])->group(function () {
            Route::get('dashboard', [InternController::class, 'dashboard'])->name('dashboard');
            Route::get('profile', [InternController::class, 'profile'])->name('profile');

            Route::get('attendance/create', [AttendanceController::class, 'create'])->name('attendance.create');
            Route::post('attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
            Route::get('attendance/history', [InternController::class, 'history'])->name('attendance.history');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | MENTOR ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('mentor')->name('mentor.')->group(function () {
        Route::get('dashboard', [MentorController::class, 'dashboard'])->name('dashboard');
    });
});

require __DIR__.'/settings.php';
