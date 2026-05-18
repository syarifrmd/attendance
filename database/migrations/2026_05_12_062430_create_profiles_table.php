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
        Schema::create('profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('foto')->nullable();
            $table->string('foto_left')->nullable();
            $table->string('foto_right')->nullable();
            $table->string('nama_lengkap');
            $table->string('asal_kampus')->nullable();
            $table->string('divisi')->nullable();
            $table->foreignUlid('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('periode_magang')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
