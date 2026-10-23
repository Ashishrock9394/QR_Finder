<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class QRCodeRegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_an_available_preprinted_qr_code(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user, 'sanctum');

        $this->postJson('/api/qr-codes/verify', ['qr_code' => 'STICKER-123'])
            ->assertOk()
            ->assertJson(['available' => true]);

        $this->postJson('/api/qr-codes', [
            'qr_code' => 'STICKER-123',
            'item_name' => 'House keys',
            'category' => 'Keys',
            'item_description' => 'Silver key ring',
            'emergency_message' => 'Please call if found.',
            'contact_name' => $user->name,
            'contact_email' => $user->email,
            'contact_phone' => '5551234567',
            'address' => '123 Main Street',
        ])
            ->assertCreated()
            ->assertJsonPath('data.qr_code', 'STICKER-123')
            ->assertJsonPath('data.category', 'Keys')
            ->assertJsonPath('data.emergency_message', 'Please call if found.')
            ->assertJsonPath('data.user_id', $user->id)
            ->assertJsonPath('data.agent_id', null);

        $this->postJson('/api/qr-codes/verify', ['qr_code' => 'STICKER-123'])
            ->assertStatus(409)
            ->assertJson(['available' => false]);
    }

    public function test_user_can_create_an_item_with_an_automatically_generated_qr_code(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/qr-codes', [
            'item_name' => 'Travel bag',
            'category' => 'Bag',
            'emergency_message' => 'Please contact me to arrange pickup.',
            'contact_name' => $user->name,
            'contact_email' => $user->email,
            'contact_phone' => '5551234567',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.item_name', 'Travel bag')
            ->assertJsonPath('data.category', 'Bag')
            ->assertJsonPath('data.emergency_message', 'Please contact me to arrange pickup.')
            ->assertJsonPath('data.user_id', $user->id);

        $item = $response->json('data');
        $this->assertTrue(Str::isUuid($item['qr_code']));
        Storage::disk('public')->assertExists($item['qr_code_image_path']);
        $this->getJson("/api/qr-codes/public/view/{$item['qr_code']}")
            ->assertOk()
            ->assertJsonPath('qr_code', $item['qr_code']);
        $this->assertStringContainsString('<svg', Storage::disk('public')->get($item['qr_code_image_path']));
    }
}
