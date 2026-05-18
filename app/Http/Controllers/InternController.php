<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
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

        return Inertia::render('Intern/Dashboard', [
            'totalDays' => 100, // In a real app, calculate based on Profile::periode_magang
            'daysAttended' => $user->attendances()->whereIn('status', ['wfo', 'wfh', 'wfa'])->count(),
            'daysAbsent' => $user->attendances()->whereIn('status', ['izin', 'sakit'])->count(),
            'recentAttendances' => $user->attendances()->latest()->take(5)->get(),
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
        ]);

        $user = $request->user();

        $profile = $user->profile()->firstOrNew(['user_id' => $user->id]);

        $divisionName = $user->profile?->division?->name ?? $request->divisi;

        $profile->fill([
            'foto' => $request->file('foto')->store('profiles', 'public'),
            'nama_lengkap' => $request->nama_lengkap,
            'asal_kampus' => $request->asal_kampus,
            'divisi' => $divisionName,
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
     * Display the intern profile page.
     */
    public function profile(Request $request)
    {
        return Inertia::render('Intern/Profile', [
            'user' => $request->user()->load('profile.division'),
        ]);
    }

    /**
     * Display the intern attendance history page.
     */
    public function history(Request $request)
    {
        return Inertia::render('Intern/History', [
            'attendances' => $request->user()->attendances()->latest()->paginate(15),
        ]);
    }
}
