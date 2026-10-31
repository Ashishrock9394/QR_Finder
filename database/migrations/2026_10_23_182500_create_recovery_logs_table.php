<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recovery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_code_id')->constrained('qr_codes')->cascadeOnDelete();
            $table->foreignId('visitor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('visitor_name');
            $table->string('visitor_phone', 30);
            $table->text('details');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['qr_code_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recovery_logs');
    }
};
