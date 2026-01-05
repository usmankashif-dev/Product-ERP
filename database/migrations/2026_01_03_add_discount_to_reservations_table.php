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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('discount_type')->nullable()->default(null)->after('total_amount'); // 'amount' or 'percentage'
            $table->decimal('discount_value', 10, 2)->nullable()->default(0)->after('discount_type'); // discount amount or percentage
            $table->decimal('discount_amount', 10, 2)->nullable()->default(0)->after('discount_value'); // calculated discount amount in currency
            $table->decimal('final_amount', 10, 2)->nullable()->after('discount_amount'); // total_amount - discount_amount
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'discount_value', 'discount_amount', 'final_amount']);
        });
    }
};
