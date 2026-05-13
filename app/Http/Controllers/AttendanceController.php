<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Show the form for creating a new attendance record.
     */
    public function create(Request $request)
    {
        $profile = $request->user()->profile;
        $profileFaces = collect([
            $profile?->foto,
            $profile?->foto_left,
            $profile?->foto_right,
        ])->filter()->values()->all();

        return Inertia::render('Intern/AttendanceForm', [
            'profile_faces' => $profileFaces,
        ]);
    }

    /**
     * Store a newly created attendance record in storage.
     */
    public function store(AttendanceRequest $request)
    {
        $validated = $request->validated();

        $face_verification_path = null;
        $proof_image_path = null;

        if ($request->hasFile('face_verification_image')) {
            $face_verification_path = $request->file('face_verification_image')->store('attendances/faces', 'public');
        }

        if ($request->hasFile('proof_image')) {
            $proof_image_path = $request->file('proof_image')->store('attendances/proofs', 'public');
        }

        $attendance = $request->user()->attendances()->create([
            'status' => $validated['status'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'reason' => $validated['reason'] ?? null,
            'face_verification_path' => $face_verification_path,
            'face_match_score' => $validated['face_match_score'] ?? null,
            'proof_image_path' => $proof_image_path,
        ]);

        return redirect()->route('intern.dashboard')->with('success', 'Absensi berhasil direkam.');
    }
}
