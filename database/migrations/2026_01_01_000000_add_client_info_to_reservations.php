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
            if (!Schema::hasColumn('reservations', 'client_name')) {
                $table->string('client_name')->nullable();
            }
            if (!Schema::hasColumn('reservations', 'client_phone')) {
                $table->string('client_phone')->nullable();
            }
            if (!Schema::hasColumn('reservations', 'client_address')) {
                $table->text('client_address')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['client_name', 'client_phone', 'client_address']);
        });
    }
};
