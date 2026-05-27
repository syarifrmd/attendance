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
        $user = $request->user()->load('division');

        $profileFaces = collect([
            $user?->foto,
            $user?->foto_left,
            $user?->foto_right,
        ])->filter()->values()->all();

        // Get today's attendance record (any status)
        $todayAttendance = $user->attendances()
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        $division = $user?->division;
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
                'is_late' => $division?->start_time ? $todayAttendance->lateMinutes($division->start_time) > 0 : false,
                'late_level' => $division?->start_time ? $todayAttendance->lateLevel($division->start_time) : 'green',
                'late_minutes' => $division?->start_time ? $todayAttendance->lateMinutes($division->start_time) : 0,
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
        $user = $request->user()->load('division');

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

        $user = $request->user()->load('division');
        $division = $user->division;
        $now = Carbon::now();

        // Validate early checkout reason
        $isEarly = false;
        if ($division?->end_time) {
            $endTime = Carbon::parse($division->end_time);
            $scheduledEnd = Carbon::today()->setTime($endTime->hour, $endTime->minute, 0);

            if ($now->lessThan($scheduledEnd)) {
                $isEarly = true;
                if (! $request->filled('checkout_reason')) {
                    $endFormatted = $endTime->format('H:i');

                    return back()->withErrors(['checkout' => "Presensi pulang sebelum jam {$endFormatted} wajib menyertakan alasan (Alasan Pulang Awal)."]);
                }
            }
        }

        // Validate location and face verification for WFO
        if ($attendance->status === 'wfo') {
            $request->validate([
                'latitude' => 'required|string',
                'longitude' => 'required|string',
                'face_verification_image' => 'required|image|max:5120',
                'face_match_score' => 'required|numeric',
                'checkout_reason' => 'nullable|string',
            ]);
        }

        $checkout_face_path = null;
        if ($request->hasFile('face_verification_image')) {
            $checkout_face_path = $request->file('face_verification_image')->store('attendances/faces_checkout', 'public');
        }

        $attendance->update([
            'check_out_at' => $now,
            'checkout_latitude' => $request->input('latitude'),
            'checkout_longitude' => $request->input('longitude'),
            'checkout_face_verification_path' => $checkout_face_path,
            'checkout_reason' => $request->input('checkout_reason'),
        ]);

        return redirect()->route('intern.attendance.create');
    }
}
