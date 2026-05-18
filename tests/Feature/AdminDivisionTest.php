<?php

use App\Models\Division;
use App\Models\User;

test('mentor can create update and delete divisions', function () {
    $mentor = User::factory()->mentor()->create();

    $this->actingAs($mentor)
        ->post(route('mentor.divisions.store'), [
            'name' => 'Engineering',
            'description' => 'Divisi teknik',
            'start_time' => '08:00',
            'end_time' => '16:00',
            'work_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
            'internship_duration_days' => 90,
            'mentor_name' => 'Bima',
        ])
        ->assertRedirect(route('mentor.divisions.index'));

    $division = Division::query()->where('name', 'Engineering')->first();

    expect($division)->not->toBeNull();

    $this->actingAs($mentor)
        ->patch(route('mentor.divisions.update', $division), [
            'name' => 'Engineering Update',
            'description' => 'Divisi teknik updated',
            'start_time' => '09:00',
            'end_time' => '17:00',
            'work_days' => ['mon', 'wed', 'fri'],
            'internship_duration_days' => 120,
            'mentor_name' => 'Rina',
        ])
        ->assertRedirect(route('mentor.divisions.index'));

    $this->actingAs($mentor)
        ->delete(route('mentor.divisions.destroy', $division))
        ->assertRedirect(route('mentor.divisions.index'));

    expect(Division::query()->where('name', 'Engineering Update')->exists())->toBeFalse();
});

test('non mentor cannot access division routes', function () {
    $intern = User::factory()->create();

    $this->actingAs($intern)
        ->get(route('mentor.divisions.index'))
        ->assertForbidden();
});
