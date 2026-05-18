<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Show the form for creating a new attendance record.
     */
    public function create(Request $request)
    {
        $user = $request->user()->load('profile.division');
        $profile = $user->profile;

        $profileFaces = collect([
            $profile?->foto,
            $profile?->foto_left,
            $profile?->foto_right,
        ])->filter()->values()->all();

        // Get today's attendance record (any status)
        $todayAttendance = $user->attendances()
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        $division = $profile?->division;
        $workSchedule = null;

        if ($division) {
            $workSchedule = [
                'start_time' => substr($division->start_time, 0, 5),
                'end_time' => substr($division->end_time, 0, 5),
                'work_days' => $division->work_days,
            ];
        }

        return Inertia::render('Intern/AttendanceForm', [
            'profile_faces' => $profileFaces,
            'today_attendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'status' => $todayAttendance->status,
                'check_in_at' => $todayAttendance->check_in_at?->toIso8601String(),
                'check_out_at' => $todayAttendance->check_out_at?->toIso8601String(),
            ] : null,
            'work_schedule' => $workSchedule,
        ]);
    }

    /**
     * Store a newly created attendance (check-in) record in storage.
     */
    public function store(AttendanceRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user()->load('profile.division');

        $face_verification_path = null;
        $proof_image_path = null;

        if ($request->hasFile('face_verification_image')) {
            $face_verification_path = $request->file('face_verification_image')->store('attendances/faces', 'public');
        }

        if ($request->hasFile('proof_image')) {
            $proof_image_path = $request->file('proof_image')->store('attendances/proofs', 'public');
        }

        $user->attendances()->create([
            'status' => $validated['status'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'reason' => $validated['reason'] ?? null,
            'face_verification_path' => $face_verification_path,
            'face_match_score' => $validated['face_match_score'] ?? null,
            'proof_image_path' => $proof_image_path,
            'check_in_at' => Carbon::now(),
        ]);

        return redirect()->route('intern.attendance.create');
    }

    /**
     * Record check-out for an existing attendance record.
     */
    public function checkOut(Request $request, Attendance $attendance)
    {
        // Ensure the attendance belongs to the current user
        if ($attendance->user_id !== $request->user()->id) {
            abort(403);
        }

        // Only allow check-out for on-site attendance types
        if (! in_array($attendance->status, ['wfo', 'wfh', 'wfa'])) {
            return back()->withErrors(['checkout' => 'Hanya status WFO/WFH/WFA yang dapat melakukan presensi pulang.']);
        }

        if ($attendance->check_out_at) {
            return back()->withErrors(['checkout' => 'Presensi pulang sudah direkam sebelumnya.']);
        }

        $user = $request->user()->load('profile.division');
        $division = $user->profile?->division;
        $now = Carbon::now();

        // Validate end time
        if ($division?->end_time) {
            $endTime = Carbon::parse($division->end_time);
            $scheduledEnd = Carbon::today()->setTime($endTime->hour, $endTime->minute, 0);

            if ($now->lessThan($scheduledEnd)) {
                $endFormatted = $endTime->format('H:i');

                return back()->withErrors(['checkout' => "Presensi pulang hanya dapat dilakukan setelah jam {$endFormatted}."]);
            }
        }

        $attendance->update(['check_out_at' => $now]);

        return redirect()->route('intern.attendance.create');
    }
}
