<?php
// database/migrations/2024_01_01_000003_create_qr_codes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('qr_code')->unique();
            $table->foreignId('agent_id')->constrained('users');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('item_name');
            $table->text('item_description')->nullable();
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'inactive', 'found'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};