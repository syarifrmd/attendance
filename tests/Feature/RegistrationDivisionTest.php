<?php

use App\Models\Division;
use App\Models\User;
use Laravel\Fortify\Features;

test('registration requires division and creates profile', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $division = Division::factory()->create();

    $this->post(route('register'), [
        'name' => 'Test Intern',
        'email' => 'intern@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'division_id' => $division->id,
    ])->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'intern@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->division_id)->toEqual($division->id);
});
