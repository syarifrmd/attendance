<?php

use App\Models\InternDraft;
use App\Models\User;
use App\Notifications\VerifyNimNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

test('sends nim verification link and stores pending nim', function () {
    Notification::fake();

    $user = User::factory()->create();
    $draft = InternDraft::create([
        'nim' => '2025123456',
        'nama_lengkap' => 'Test Intern',
        'division_id' => null,
        'internship_duration_days' => 90,
        'is_claimed' => false,
        'claimed_by_user_id' => null,
    ]);

    $this->actingAs($user)
        ->post(route('intern.claim-nim.store', absolute: false), ['nim' => $draft->nim])
        ->assertSessionHas('status', 'nim-verification-link-sent');

    Notification::assertSentTo($user, VerifyNimNotification::class);

    $profile = $user->fresh()->profile;

    expect($profile)->not->toBeNull();
    expect($profile->nim)->toBe($draft->nim);
    expect($profile->nim_verified_at)->toBeNull();
    expect($draft->fresh()->claimed_by_user_id)->toBe($user->id);
    expect($draft->fresh()->is_claimed)->toBeFalsy();
});

test('verifies nim via signed link', function () {
    $user = User::factory()->create();
    $draft = InternDraft::create([
        'nim' => '2025999888',
        'nama_lengkap' => 'Verified Intern',
        'division_id' => null,
        'internship_duration_days' => 90,
        'is_claimed' => false,
        'claimed_by_user_id' => $user->id,
    ]);

    $user->profile()->create([
        'nama_lengkap' => $draft->nama_lengkap,
        'nim' => $draft->nim,
        'nim_verified_at' => null,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'intern.verify-nim',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($draft->nim)],
    );

    $this->actingAs($user)
        ->get($verificationUrl)
        ->assertRedirect(route('intern.setup-profile', absolute: false));

    $profile = $user->fresh()->profile;

    expect($profile->nim_verified_at)->not->toBeNull();
    expect($draft->fresh()->is_claimed)->toBeTruthy();
});
