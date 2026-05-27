<?php

namespace Database\Factories;

use App\Models\Division;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Division>
 */
class DivisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'description' => fake()->sentence(),
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'work_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
            'mentor_name' => fake()->name(),
        ];
    }
}
