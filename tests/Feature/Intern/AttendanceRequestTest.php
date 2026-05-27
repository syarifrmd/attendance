<?php

use App\Models\User;

test('onsite attendance requires face verification image and location', function () {
    $user = User::factory()->create([
        'foto' => 'profiles/sample.jpg',
        'name' => 'Test User',
        'asal_kampus' => 'Test Campus',
        'divisi' => 'Test Division',
    ]);

    $response = $this->actingAs($user)->post(route('intern.attendance.store'), [
        'status' => 'wfo',
    ]);

    $response->assertSessionHasErrors(['latitude', 'longitude', 'face_verification_image']);
});

test('offsite attendance requires proof image and reason', function () {
    $user = User::factory()->create([
        'foto' => 'profiles/sample.jpg',
        'name' => 'Test User',
        'asal_kampus' => 'Test Campus',
        'divisi' => 'Test Division',
    ]);

    $response = $this->actingAs($user)->post(route('intern.attendance.store'), [
        'status' => 'izin',
    ]);

    $response->assertSessionHasErrors(['proof_image', 'reason']);
});
