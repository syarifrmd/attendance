<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('intern can store profile with side photos', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('intern.setup-profile.store'), [
        'foto' => UploadedFile::fake()->image('front.jpg'),
        'foto_left' => UploadedFile::fake()->image('left.jpg'),
        'foto_right' => UploadedFile::fake()->image('right.jpg'),
        'nama_lengkap' => 'Nadia Pratama',
        'asal_kampus' => 'Universitas Contoh',
        'divisi' => 'Web Developer',
    ]);

    $response->assertRedirect(route('intern.dashboard'));

    $profile = $user->refresh()->profile;
    expect($profile)->not->toBeNull();
    expect($profile->foto)->not->toBeNull();
    expect($profile->foto_left)->not->toBeNull();
    expect($profile->foto_right)->not->toBeNull();

    Storage::disk('public')->assertExists($profile->foto);
    Storage::disk('public')->assertExists($profile->foto_left);
    Storage::disk('public')->assertExists($profile->foto_right);
});

test('attendance form receives profile face list', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'foto' => 'profiles/front.jpg',
        'foto_left' => 'profiles/left.jpg',
        'foto_right' => 'profiles/right.jpg',
        'nama_lengkap' => 'Nadia Pratama',
        'asal_kampus' => 'Universitas Contoh',
        'divisi' => 'Web Developer',
    ]);

    $this->actingAs($user)
        ->get(route('intern.attendance.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Intern/AttendanceForm')
            ->where('profile_faces', [
                'profiles/front.jpg',
                'profiles/left.jpg',
                'profiles/right.jpg',
            ]),
        );
});
