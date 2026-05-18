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
        Schema::table('profiles', function (Blueprint $table) {
            $table->integer('internship_duration_days')->default(90)->after('periode_magang');
        });

        Schema::table('divisions', function (Blueprint $table) {
            $table->dropColumn('internship_duration_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('divisions', function (Blueprint $table) {
            $table->integer('internship_duration_days')->default(90)->after('work_days');
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('internship_duration_days');
        });
    }
};
