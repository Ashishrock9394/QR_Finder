<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OTP>
 */
class OTPFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'email' => fake()->safeEmail(),
            'code' => str_pad(fake()->unique()->numberBetween(0, 999999), 6, '0', STR_PAD_LEFT),
            'attempts' => 0,
            'blocked_until' => null,
        ];
    }

    public function withUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    public function blocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'attempts' => 3,
            'blocked_until' => now()->addHours(24),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => now()->subMinutes(15),
        ]);
    }
}
