<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\InternDraft;
use Illuminate\Database\Seeder;

class InternDraftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $division = Division::first();

        // Draft yang belum di-claim untuk testing (Bisa dites klaim lewat email/NIM)
        InternDraft::create([
            'nim' => '1234567890',
            'nama_lengkap' => 'Mahasiswa Test Claim',
            'division_id' => $division?->id ?? 1,
            'internship_duration_days' => 90,
            'is_claimed' => false,
        ]);

        InternDraft::create([
            'nim' => 'A11.2020.12345',
            'nama_lengkap' => 'Budi Santoso Udin',
            'division_id' => $division?->id ?? 1,
            'internship_duration_days' => 60,
            'is_claimed' => false,
        ]);
    }
}
