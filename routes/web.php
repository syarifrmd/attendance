<?php

use App\Enums\Role;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\InternController as ManagerInternController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InternController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::redirect('/', '/login')->name('home');


// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Role-based root dashboard redirect
    Route::get('dashboard', function () {
        $role = auth()->user()->role;

        if ($role === Role::Mentor || $role === Role::Admin) {
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
        // Setup Profile routes (Exempt from profile.setup middleware)
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
        Route::resource('interns', ManagerInternController::class)->only(['index', 'show']);
        Route::patch('attendances/{attendance}', [ManagerInternController::class, 'updateAttendance'])->name('attendances.update');
        Route::delete('attendances/{attendance}', [ManagerInternController::class, 'destroyAttendance'])->name('attendances.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | LEGACY /admin REDIRECTS
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('mentor')->group(function () {
        Route::get('interns', fn () => redirect()->route('mentor.interns.index'));
        Route::get('interns/{user}', fn ($user) => redirect()->route('mentor.interns.show', $user));
        Route::get('divisions', fn () => redirect()->route('mentor.divisions.index'));
    });
});

require __DIR__.'/settings.php';
