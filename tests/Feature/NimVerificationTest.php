<?php

use App\Models\InternDraft;
use App\Models\User;

test('it verifies nim and claims draft successfully', function () {
    $user = User::factory()->unverifiedNim()->create();
    $draft = InternDraft::create([
        'nim' => '2025123456',
        'name' => 'Test Intern',
        'division_id' => null,
        'internship_duration_days' => 90,
        'is_claimed' => false,
        'claimed_by_user_id' => null,
    ]);

    $response = $this->actingAs($user)
        ->withSession(['can_claim_nim' => true])
        ->post(route('intern.claim-nim.store'), ['nim' => $draft->nim]);

    $response->assertRedirect(route('intern.setup-profile'));

    $user->refresh();
    expect($user->nim)->toBe($draft->nim);
    expect($user->nim_verified_at)->not->toBeNull();
    expect($user->name)->toBe($draft->name);

    expect($draft->fresh()->claimed_by_user_id)->toBe($user->id);
    expect($draft->fresh()->is_claimed)->toBeTruthy();
});

test('it fails verification with invalid nim', function () {
    $user = User::factory()->unverifiedNim()->create();

    $response = $this->actingAs($user)
        ->withSession(['can_claim_nim' => true])
        ->post(route('intern.claim-nim.store'), ['nim' => 'INVALIDNIM']);

    $response->assertSessionHasErrors(['nim']);
});

test('it binds account to existing user when nim is already in users table', function () {
    $draft = InternDraft::create([
        'nim' => '1234567890',
        'name' => 'Mahasiswa Test Claim',
        'division_id' => null,
        'internship_duration_days' => 90,
        'is_claimed' => false,
        'claimed_by_user_id' => null,
    ]);

    $existingUser = User::factory()->create([
        'nim' => '1234567890',
        'nim_verified_at' => null,
        'email' => 'seeded@example.com',
        'google_id' => null,
    ]);

    $currentUser = User::factory()->create([
        'nim' => null,
        'nim_verified_at' => null,
        'email' => 'newgoogle@example.com',
        'google_id' => 'google-123456',
    ]);

    $response = $this->actingAs($currentUser)
        ->withSession(['can_claim_nim' => true])
        ->post(route('intern.claim-nim.store'), ['nim' => '1234567890']);

    $response->assertRedirect(route('intern.setup-profile'));

    $this->assertDatabaseMissing('users', ['id' => $currentUser->id]);

    $existingUser->refresh();
    expect($existingUser->email)->toBe('newgoogle@example.com');
    expect($existingUser->google_id)->toBe('google-123456');
    expect($existingUser->nim_verified_at)->not->toBeNull();

    $draft->refresh();
    expect($draft->is_claimed)->toBeTruthy();
    expect($draft->claimed_by_user_id)->toBe($existingUser->id);

    expect(auth()->user()->id)->toBe($existingUser->id);
});
