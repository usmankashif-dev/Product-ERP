<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('product_id');
        });

        // Populate existing reservations with product names
        DB::table('reservations')->whereNotNull('product_id')->get()->each(function ($reservation) {
            $product = DB::table('products')->find($reservation->product_id);
            if ($product) {
                DB::table('reservations')
                    ->where('id', $reservation->id)
                    ->update(['product_name' => $product->name]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('product_name');
        });
    }
};
