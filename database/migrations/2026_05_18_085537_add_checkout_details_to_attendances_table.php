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
            $table->string('checkout_latitude')->nullable();
            $table->string('checkout_longitude')->nullable();
            $table->string('checkout_face_verification_path')->nullable();
            $table->text('checkout_reason')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'checkout_latitude',
                'checkout_longitude',
                'checkout_face_verification_path',
                'checkout_reason',
            ]);
        });
    }
};
