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

            // safer template_id
            $table->unsignedBigInteger('template_id')->nullable();

            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('company_name')->nullable();

            $table->string('mobile');
            $table->string('email');
            $table->string('website')->nullable();
            $table->text('address')->nullable();

            $table->string('logo')->nullable();
            $table->string('photo')->nullable();

            $table->string('qr_code')->unique();
            $table->string('qr_image')->nullable();

            $table->timestamps();
        });

        // Add foreign key separately
        Schema::table('v_cards', function (Blueprint $table) {
            $table->foreign('template_id')
                  ->references('id')
                  ->on('card_templates')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('v_cards', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
        });

        Schema::dropIfExists('v_cards');
    }
};
