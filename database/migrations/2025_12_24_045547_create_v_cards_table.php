<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('v_cards', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('company_name')->nullable();

            $table->string('mobile');
            $table->string('email');

            $table->text('address')->nullable();

            $table->string('logo')->nullable();   // company logo
            $table->string('photo')->nullable();  // profile photo

            $table->string('qr_code')->unique();  // unique identifier
            $table->string('qr_image')->nullable(); // stored QR image path

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('v_cards');
    }
};
