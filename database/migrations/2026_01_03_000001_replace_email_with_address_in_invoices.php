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
            // Drop the email column if it exists and add address column
            if (Schema::hasColumn('invoices', 'customer_email')) {
                $table->dropColumn('customer_email');
            }
            
            if (!Schema::hasColumn('invoices', 'customer_address')) {
                $table->string('customer_address')->nullable()->after('customer_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'customer_address')) {
                $table->dropColumn('customer_address');
            }
            
            if (!Schema::hasColumn('invoices', 'customer_email')) {
                $table->string('customer_email')->nullable();
            }
        });
    }
};
