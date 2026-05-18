<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InternController extends Controller
{
    /**
     * Display the intern dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user()->load('profile.division');
        $division = $user->profile?->division;

        $recentAttendances = $user->attendances()->latest()->take(5)->get()
            ->map(fn (Attendance $att) => array_merge($att->toArray(), [
                'is_late' => $division?->start_time ? $att->lateMinutes($division->start_time) > 0 : false,
                'late_minutes' => $division?->start_time ? $att->lateMinutes($division->start_time) : 0,
                'late_level' => $division?->start_time ? $att->lateLevel($division->start_time) : 'green',
            ]));

        return Inertia::render('Intern/Dashboard', [
            'totalDays' => $user->profile?->internship_duration_days ?? 90,
            'daysAttended' => $user->attendances()->whereIn('status', ['wfo', 'wfh', 'wfa'])->count(),
            'daysAbsent' => $user->attendances()->whereIn('status', ['izin', 'sakit'])->count(),
            'recentAttendances' => $recentAttendances,
            'announcements' => Announcement::latest()->take(5)->get(),
        ]);
    }

    /**
     * Display the setup profile page for new interns.
     */
    public function setupProfile(Request $request)
    {
        $user = $request->user()->load('profile.division');

        return Inertia::render('Intern/SetupProfile', [
            'divisionName' => $user->profile?->division?->name ?? $user->profile?->divisi,
            'existingProfile' => $user->profile,
            'userName' => $user->name,
        ]);
    }

    /**
     * Store the initial profile setup data (especially the photo).
     */
    public function storeProfile(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:5120',
            'foto_left' => 'nullable|image|max:5120',
            'foto_right' => 'nullable|image|max:5120',
            'nama_lengkap' => 'required|string|max:255',
            'asal_kampus' => 'nullable|string|max:255',
            'divisi' => 'nullable|string|max:255',
            'internship_duration_days' => 'required|integer|min:1|max:365',
        ]);

        $user = $request->user();
        $profile = $user->profile()->firstOrNew(['user_id' => $user->id]);

        $divisionName = $user->profile?->division?->name ?? $request->divisi;
        $divisionId = \App\Models\Division::where('name', $divisionName)->value('id');

        $profile->fill([
            'foto' => $request->file('foto')->store('profiles', 'public'),
            'nama_lengkap' => $request->nama_lengkap,
            'asal_kampus' => $request->asal_kampus,
            'divisi' => $divisionName,
            'division_id' => $divisionId,
            'internship_duration_days' => $request->internship_duration_days,
        ]);

        if ($request->hasFile('foto_left')) {
            $profile->foto_left = $request->file('foto_left')->store('profiles', 'public');
        }

        if ($request->hasFile('foto_right')) {
            $profile->foto_right = $request->file('foto_right')->store('profiles', 'public');
        }

        $profile->save();

        return redirect()->route('intern.dashboard')->with('success', 'Profil berhasil dibuat!');
    }

    /**
     * Display the intern profile page (View mode).
     */
    public function profile(Request $request)
    {
        return Inertia::render('Intern/Profile', [
            'user' => $request->user()->load('profile.division'),
        ]);
    }

    /**
     * Display the form to edit existing intern profile.
     */
    public function editProfile(Request $request)
    {
        return Inertia::render('Intern/EditProfile', [
            'user' => $request->user()->load('profile.division'),
        ]);
    }

    /**
     * Update the existing intern profile.
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'asal_kampus' => 'nullable|string|max:255',
            'internship_duration_days' => 'required|integer|min:1|max:365',
        ]);

        $user = $request->user();
        $profile = $user->profile;

        $profile->update([
            'nama_lengkap' => $request->nama_lengkap,
            'asal_kampus' => $request->asal_kampus,
            'internship_duration_days' => $request->internship_duration_days,
        ]);

        return redirect()->route('intern.profile')->with('success', 'Profil berhasil diperbarui!');
    }

    /**
     * Display the intern attendance history page.
     */
    public function history(Request $request)
    {
        $user = $request->user()->load('profile.division');
        $division = $user->profile?->division;

        $attendances = $user->attendances()->latest()->paginate(15);

        $attendances->getCollection()->transform(fn (Attendance $att) => array_merge($att->toArray(), [
            'is_late' => $division?->start_time ? $att->lateMinutes($division->start_time) > 0 : false,
            'late_minutes' => $division?->start_time ? $att->lateMinutes($division->start_time) : 0,
            'late_level' => $division?->start_time ? $att->lateLevel($division->start_time) : 'green',
        ]));

        return Inertia::render('Intern/History', [
            'attendances' => $attendances,
        ]);
    }
}
