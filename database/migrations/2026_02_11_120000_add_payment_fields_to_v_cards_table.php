<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('v_cards', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'paid', 'cancelled'])->default('pending')->after('qr_image');
            $table->string('razorpay_order_id')->nullable()->after('payment_status');
            $table->string('razorpay_payment_id')->nullable()->after('razorpay_order_id');
            $table->decimal('amount', 8, 2)->default(0)->after('razorpay_payment_id');
            $table->timestamp('paid_at')->nullable()->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('v_cards', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'razorpay_order_id', 'razorpay_payment_id', 'amount', 'paid_at']);
        });
    }
};
