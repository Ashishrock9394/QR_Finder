<?php

namespace Tests\Feature;

use App\Models\OTP;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtpLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_otp_and_resend_once(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/send-otp', ['email' => $user->email]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'OTP sent successfully to your email',
                'remaining_resends' => 1,
            ]);

        $secondResponse = $this->postJson('/api/send-otp', ['email' => $user->email]);

        $secondResponse->assertStatus(200)
            ->assertJson([
                'message' => 'OTP sent successfully to your email',
                'remaining_resends' => 0,
            ]);

        $thirdResponse = $this->postJson('/api/send-otp', ['email' => $user->email]);

        $thirdResponse->assertStatus(429)
            ->assertJson([
                'remaining_resends' => 0,
            ]);
    }

    public function test_verify_otp_returns_token_and_user(): void
    {
        $user = User::factory()->create([
            'email' => 'verify@example.com',
        ]);

        $this->postJson('/api/send-otp', ['email' => $user->email])->assertStatus(200);

        $otp = OTP::where('email', $user->email)->latest()->first();

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'otp' => $otp->code,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token'])
            ->assertJson(['message' => 'Login successful']);
    }
}
