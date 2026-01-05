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
        Schema::table('sales', function (Blueprint $table) {
            // Rename 'date' column to 'order_date'
            $table->renameColumn('date', 'order_date');
            
            // Add new date columns after order_date
            $table->date('dispatch_date')->nullable()->after('order_date');
            $table->date('delivered_date')->nullable()->after('dispatch_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Drop the new columns
            $table->dropColumn(['dispatch_date', 'delivered_date']);
            
            // Rename order_date back to date
            $table->renameColumn('order_date', 'date');
        });
    }
};
