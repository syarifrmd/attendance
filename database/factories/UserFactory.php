<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'role' => 'intern',
            'nim' => fake()->unique()->numerify('##########'),
            'nim_verified_at' => now(),
            'foto' => 'profiles/front.jpg',
            'foto_left' => 'profiles/left.jpg',
            'foto_right' => 'profiles/right.jpg',
            'asal_kampus' => fake()->company(),
            'divisi' => 'IT Support',
            'internship_duration_days' => 90,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model's NIM is unverified/unclaimed.
     */
    public function unverifiedNim(): static
    {
        return $this->state(fn (array $attributes) => [
            'nim' => null,
            'nim_verified_at' => null,
            'foto' => null,
            'foto_left' => null,
            'foto_right' => null,
        ]);
    }

    /**
     * Indicate that the model has no profile photos setup.
     */
    public function noPhotos(): static
    {
        return $this->state(fn (array $attributes) => [
            'foto' => null,
            'foto_left' => null,
            'foto_right' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function mentor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'mentor',
        ]);
    }
}
