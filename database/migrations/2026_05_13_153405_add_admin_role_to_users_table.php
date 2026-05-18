<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('intern','mentor','admin') NOT NULL DEFAULT 'intern'");
        }

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off;');

            DB::statement('DROP INDEX IF EXISTS users_email_unique');

            Schema::create('users_new', function (Blueprint $table) {
                $table->ulid('id')->primary();
                $table->string('name');
                $table->string('email')->unique();
                $table->enum('role', ['intern', 'mentor', 'admin'])->default('intern');
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            DB::statement(
                'INSERT INTO users_new (id, name, email, role, email_verified_at, password, two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at, remember_token, created_at, updated_at)
                SELECT id, name, email, role, email_verified_at, password, two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at, remember_token, created_at, updated_at
                FROM users'
            );

            Schema::drop('users');
            Schema::rename('users_new', 'users');

            $this->rebuildProfilesTable();

            DB::statement('PRAGMA foreign_keys=on;');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('intern','mentor') NOT NULL DEFAULT 'intern'");
        }

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off;');

            DB::statement('DROP INDEX IF EXISTS users_email_unique');

            Schema::create('users_new', function (Blueprint $table) {
                $table->ulid('id')->primary();
                $table->string('name');
                $table->string('email')->unique();
                $table->enum('role', ['intern', 'mentor'])->default('intern');
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            DB::statement(
                'INSERT INTO users_new (id, name, email, role, email_verified_at, password, two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at, remember_token, created_at, updated_at)
                SELECT id, name, email, role, email_verified_at, password, two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at, remember_token, created_at, updated_at
                FROM users'
            );

            Schema::drop('users');
            Schema::rename('users_new', 'users');

            $this->rebuildProfilesTable();

            DB::statement('PRAGMA foreign_keys=on;');
        }
    }

    private function rebuildProfilesTable(): void
    {
        Schema::create('profiles_new', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('foto')->nullable();
            $table->string('nama_lengkap');
            $table->string('asal_kampus')->nullable();
            $table->string('divisi')->nullable();
            $table->foreignUlid('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('periode_magang')->nullable();
            $table->timestamps();
        });

        DB::statement(
            'INSERT INTO profiles_new (id, user_id, foto, nama_lengkap, asal_kampus, divisi, mentor_id, periode_magang, created_at, updated_at)
            SELECT id, user_id, foto, nama_lengkap, asal_kampus, divisi, mentor_id, periode_magang, created_at, updated_at
            FROM profiles'
        );

        Schema::drop('profiles');
        Schema::rename('profiles_new', 'profiles');
    }
};
