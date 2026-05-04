<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('code', 6);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('blocked_until')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('user_id');
            $table->index('blocked_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otps');
    }
};
