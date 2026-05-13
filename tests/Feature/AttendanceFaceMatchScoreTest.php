<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('stores face_match_score when submitting wfo attendance', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/intern/attendance/store', [
        'status' => 'wfo',
        'latitude' => '-6.123456',
        'longitude' => '106.123456',
        'face_verification_image' => UploadedFile::fake()->image('face.jpg'),
        'face_match_score' => '0.3500',
    ]);

    $response->assertRedirect(route('intern.dashboard'));

    $this->assertDatabaseHas('attendances', [
        'user_id' => $user->id,
        'status' => 'wfo',
        'face_match_score' => 0.3500,
    ]);
});

it('rejects face_match_score above 1', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/intern/attendance/store', [
        'status' => 'wfo',
        'latitude' => '-6.123456',
        'longitude' => '106.123456',
        'face_verification_image' => UploadedFile::fake()->image('face.jpg'),
        'face_match_score' => '1.5',
    ]);

    $response->assertSessionHasErrors('face_match_score');
});

it('allows null face_match_score for izin status', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/intern/attendance/store', [
        'status' => 'izin',
        'proof_image' => UploadedFile::fake()->image('proof.jpg'),
        'reason' => 'Sakit demam tinggi',
    ]);

    $response->assertRedirect(route('intern.dashboard'));

    $this->assertDatabaseHas('attendances', [
        'user_id' => $user->id,
        'status' => 'izin',
        'face_match_score' => null,
    ]);
});
