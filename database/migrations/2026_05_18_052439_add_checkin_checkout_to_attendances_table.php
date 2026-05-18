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
        Schema::table('attendances', function (Blueprint $table) {
            // check_in_at stores the actual time the intern checked in
            $table->timestamp('check_in_at')->nullable()->after('reason');
            // check_out_at stores the actual time the intern checked out
            $table->timestamp('check_out_at')->nullable()->after('check_in_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['check_in_at', 'check_out_at']);
        });
    }
};
