<?php

namespace Database\Factories;

use App\Models\EmailLoginOtp;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<EmailLoginOtp>
 */
class EmailLoginOtpFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'otp_hash' => Hash::make('1234'),
            'attempts_remaining' => 5,
            'expires_at' => now()->addMinutes(10),
            'resend_available_at' => now()->addMinute(),
            'requested_ip' => fake()->ipv4(),
        ];
    }
}
