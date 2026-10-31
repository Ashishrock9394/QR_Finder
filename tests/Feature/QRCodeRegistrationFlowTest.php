<?php

namespace Tests\Feature;

use App\Models\QRCode;
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

    public function test_external_visitor_can_submit_recovery_details_and_owner_can_view_ip_log(): void
    {
        $owner = User::factory()->create(['role' => 'user']);
        $item = QRCode::create([
            'qr_code' => 'RECOVERY-ITEM-123',
            'user_id' => $owner->id,
            'item_name' => 'Travel bag',
            'contact_name' => $owner->name,
            'contact_email' => $owner->email,
            'contact_phone' => '5551234567',
            'status' => 'active',
        ]);

        $this->getJson("/api/qr-codes/public/view/{$item->qr_code}")
            ->assertOk()
            ->assertJsonPath('is_owner', false);

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.44'])
            ->postJson("/api/qr-codes/public/{$item->qr_code}/recovery-logs", [
                'name' => 'Finder Name',
                'contact_phone' => '5557654321',
                'details' => 'Found near the library entrance and can return it this evening.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.visitor_name', 'Finder Name')
            ->assertJsonPath('data.ip_address', '198.51.100.44');

        $this->actingAs($owner, 'sanctum')
            ->getJson("/api/qr-codes/{$item->id}/recovery-logs")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.visitor_phone', '5557654321')
            ->assertJsonPath('0.ip_address', '198.51.100.44');

        $this->getJson("/api/qr-codes/public/view/{$item->qr_code}")
            ->assertOk()
            ->assertJsonPath('is_owner', true);

        $otherUser = User::factory()->create(['role' => 'user']);
        $this->actingAs($otherUser, 'sanctum')
            ->getJson("/api/qr-codes/{$item->id}/recovery-logs")
            ->assertForbidden();
    }

    public function test_item_owner_cannot_submit_a_recovery_report_for_their_own_item(): void
    {
        $owner = User::factory()->create(['role' => 'user']);
        $item = QRCode::create([
            'qr_code' => 'OWNER-ITEM-123',
            'user_id' => $owner->id,
            'item_name' => 'Wallet',
            'contact_name' => $owner->name,
            'contact_email' => $owner->email,
            'contact_phone' => '5551234567',
            'status' => 'active',
        ]);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/qr-codes/public/{$item->qr_code}/recovery-logs", [
                'name' => $owner->name,
                'contact_phone' => '5551234567',
                'details' => 'I am the owner.',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('recovery_logs', 0);
    }
}
