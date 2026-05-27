<?php

use App\Enums\Role;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\Mentor\DivisionController;
use App\Http\Controllers\Mentor\InternController as ManagerInternController;
use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Google Auth
Route::get('/auth/google', [SocialAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Role-based root dashboard redirect
    Route::get('dashboard', function () {
        $role = auth()->user()->role;

        if ($role === Role::Mentor) {
            return redirect()->route('mentor.interns.index');
        }

        return redirect()->route('intern.dashboard');
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | INTERN ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('intern')->name('intern.')->group(function () {
        // Setup & Claim NIM Profile routes (Exempt from profile.setup middleware)
        Route::get('verify-notice', function () {
            return inertia('Intern/VerifyNotice');
        })->name('verify-notice');
        Route::post('verify-notice/resend', [InternController::class, 'resendVerifyEmail'])->name('verify-notice.resend');

        Route::get('claim-nim', [InternController::class, 'claimNimForm'])
            ->name('claim-nim')
            ->middleware('signed');

        Route::post('claim-nim', [InternController::class, 'storeNimClaim'])->name('claim-nim.store');

        Route::get('setup-profile', [InternController::class, 'setupProfile'])->name('setup-profile');
        Route::post('setup-profile', [InternController::class, 'storeProfile'])->name('setup-profile.store');

        // Core Intern routes (Protected by profile.setup middleware)
        Route::middleware(['profile.setup'])->group(function () {
            Route::get('dashboard', [InternController::class, 'dashboard'])->name('dashboard');
            Route::get('profile', [InternController::class, 'profile'])->name('profile');
            Route::get('profile/edit', [InternController::class, 'editProfile'])->name('profile.edit');
            Route::patch('profile', [InternController::class, 'updateProfile'])->name('profile.update');

            Route::get('attendance/create', [AttendanceController::class, 'create'])->name('attendance.create');
            Route::post('attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
            Route::post('attendance/{attendance}/checkout', [AttendanceController::class, 'checkOut'])->name('attendance.checkout');
            Route::get('attendance/history', [InternController::class, 'history'])->name('attendance.history');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | MENTOR / ADMIN ROUTES (unified under /mentor)
    |--------------------------------------------------------------------------
    */
    Route::prefix('mentor')->name('mentor.')->middleware('mentor')->group(function () {
        Route::resource('divisions', DivisionController::class)->except(['show']);
        Route::resource('interns', ManagerInternController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::patch('attendances/{attendance}', [ManagerInternController::class, 'updateAttendance'])->name('attendances.update');
        Route::delete('attendances/{attendance}', [ManagerInternController::class, 'destroyAttendance'])->name('attendances.destroy');
        Route::post('intern-drafts/import', [ManagerInternController::class, 'importProcess'])->name('intern-drafts.import');
        Route::post('intern-drafts', [ManagerInternController::class, 'storeDraft'])->name('intern-drafts.store');
        Route::delete('intern-drafts/{internDraft}', [ManagerInternController::class, 'destroyDraft'])->name('intern-drafts.destroy');
        Route::resource('announcements', AnnouncementController::class)->only(['index', 'store', 'destroy']);
    });

});

require __DIR__.'/settings.php';
