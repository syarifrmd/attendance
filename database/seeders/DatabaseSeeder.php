<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Attendance;
use App\Models\Division;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Divisions
        $itDiv = Division::create([
            'name' => 'IT Support',
            'description' => 'Mengelola infrastruktur IT perusahaan.',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'work_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
            'mentor_name' => 'Budi Santoso',
        ]);

        $hrDiv = Division::create([
            'name' => 'Human Resources',
            'description' => 'Manajemen SDM dan rekrutmen.',
            'start_time' => '09:00:00',
            'end_time' => '16:00:00',
            'work_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
            'mentor_name' => 'Siti Aminah',
        ]);

        // 2. Create Mentor User
        $mentor = User::create([
            'name' => 'Mentor Indosat',
            'email' => 'mentor@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Mentor,
        ]);

        // 3. Create Interns with direct fields
        $intern1 = User::create([
            'name' => 'Andi Intern',
            'email' => 'intern1@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Intern,
            'nim' => '1234567891',
            'nim_verified_at' => now(),
            'asal_kampus' => 'Universitas Diponegoro',
            'divisi' => $itDiv->name,
            'division_id' => $itDiv->id,
            'mentor_id' => $mentor->id,
            'internship_duration_days' => 90,
        ]);

        $intern2 = User::create([
            'name' => 'Sari Intern',
            'email' => 'intern2@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Intern,
            'nim' => '1234567892',
            'nim_verified_at' => now(),
            'asal_kampus' => 'Universitas Negeri Semarang',
            'divisi' => $hrDiv->name,
            'division_id' => $hrDiv->id,
            'mentor_id' => $mentor->id,
            'internship_duration_days' => 60,
        ]);

        // Seed unverified intern for testing NIM Claim flow
        User::create([
            'name' => 'Mahasiswa Test Claim',
            'email' => 'testclaim@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Intern,
            'nim' => '1234567890',
            'nim_verified_at' => null, // Needs verification
            'asal_kampus' => 'Universitas Contoh',
            'divisi' => $itDiv->name,
            'division_id' => $itDiv->id,
            'mentor_id' => $mentor->id,
            'internship_duration_days' => 90,
        ]);

        // 5. Create some dummy attendances for Andi
        // WFO - Tepat Waktu
        Attendance::create([
            'user_id' => $intern1->id,
            'status' => 'wfo',
            'latitude' => '-6.98979',
            'longitude' => '110.42133',
            'check_in_at' => Carbon::today()->setHour(7)->setMinute(55),
            'check_out_at' => Carbon::today()->setHour(17)->setMinute(10),
            'created_at' => Carbon::today()->setHour(7)->setMinute(55),
        ]);

        // WFH - Terlambat (Kuning)
        Attendance::create([
            'user_id' => $intern1->id,
            'status' => 'wfh',
            'reason' => 'Hujan deras, jalanan banjir',
            'check_in_at' => Carbon::yesterday()->setHour(8)->setMinute(15),
            'check_out_at' => Carbon::yesterday()->setHour(17)->setMinute(5),
            'created_at' => Carbon::yesterday()->setHour(8)->setMinute(15),
        ]);

        // Sakit
        Attendance::create([
            'user_id' => $intern1->id,
            'status' => 'sakit',
            'reason' => 'Demam dan flu',
            'created_at' => Carbon::now()->subDays(2)->setHour(7)->setMinute(30),
        ]);

        // 6. Create some dummy attendances for Sari
        // WFO - Terlambat (Merah)
        Attendance::create([
            'user_id' => $intern2->id,
            'status' => 'wfo',
            'latitude' => '-6.98979',
            'longitude' => '110.42133',
            'check_in_at' => Carbon::today()->setHour(9)->setMinute(45),
            'check_out_at' => null, // Belum pulang
            'created_at' => Carbon::today()->setHour(9)->setMinute(45),
        ]);

        $this->call([
            InternDraftSeeder::class,
        ]);
    }
}
