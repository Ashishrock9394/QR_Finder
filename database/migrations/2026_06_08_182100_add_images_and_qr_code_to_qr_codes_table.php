<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            $table->string('user_image_path')->nullable()->after('status');
            $table->string('item_image_path')->nullable()->after('user_image_path');
            $table->string('qr_code_image_path')->nullable()->after('item_image_path');
            $table->timestamp('registration_timestamp')->nullable()->after('qr_code_image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            $table->dropColumn('user_image_path');
            $table->dropColumn('item_image_path');
            $table->dropColumn('qr_code_image_path');
            $table->dropColumn('registration_timestamp');
        });
    }
};
