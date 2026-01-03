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
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('client_id');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->string('location')->nullable()->after('customer_phone');
            $table->string('image')->nullable()->after('location');
            $table->decimal('discount', 5, 2)->default(0)->after('image');
            $table->decimal('tax', 5, 2)->default(0)->after('discount');
            $table->string('payment_method')->nullable()->after('tax');
            $table->decimal('received_amount', 10, 2)->default(0)->after('payment_method');
            $table->decimal('subtotal', 10, 2)->nullable()->after('received_amount');
            $table->decimal('total_invoice', 10, 2)->nullable()->after('subtotal');
            $table->decimal('balance', 10, 2)->nullable()->after('total_invoice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name',
                'customer_email',
                'customer_phone',
                'location',
                'image',
                'discount',
                'tax',
                'payment_method',
                'received_amount',
                'subtotal',
                'total_invoice',
                'balance',
            ]);
        });
    }
};
