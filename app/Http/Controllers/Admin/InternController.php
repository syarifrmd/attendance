<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class InternController extends Controller
{
    /**
     * Display a listing of all interns with their attendance for the selected date.
     */
    public function index(Request $request): Response
    {
        // Default date = today
        $date = $request->filled('date')
            ? Carbon::parse($request->date)->startOfDay()
            : Carbon::today();

        $query = User::where('role', 'intern')
            ->with(['profile.division'])
            ->withCount([
                'attendances as total_checkins' => fn ($q) => $q->whereIn('status', ['wfo', 'wfh', 'wfa']),
                'attendances as total_absent' => fn ($q) => $q->whereIn('status', ['izin', 'sakit']),
                'attendances as late_count' => function ($q) {
                    $q->whereIn('status', ['wfo', 'wfh', 'wfa'])
                        ->whereNotNull('check_in_at')
                        ->whereRaw('TIME(check_in_at) > (
                            SELECT d.start_time FROM divisions d
                            INNER JOIN profiles p ON p.division_id = d.id
                            WHERE p.user_id = attendances.user_id
                            LIMIT 1
                        )');
                },
            ]);

        if ($request->filled('division_id')) {
            $query->whereHas('profile', fn ($q) => $q->where('division_id', $request->division_id));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', fn ($pq) => $pq->where('nama_lengkap', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('today_status')) {
            $status = $request->today_status;
            if ($status === 'not_yet') {
                $query->whereDoesntHave('attendances', fn ($q) => $q->whereDate('created_at', $date));
            } else {
                $query->whereHas('attendances', fn ($q) => $q->whereDate('created_at', $date)->where('status', $status));
            }
        }

        $interns = $query->orderBy('name')->paginate(20)->withQueryString();

        // Attach selected-date attendance to each intern
        $internIds = $interns->pluck('id');
        $dateAttendances = Attendance::whereIn('user_id', $internIds)
            ->whereDate('created_at', $date)
            ->get()
            ->keyBy('user_id');

        $interns->getCollection()->transform(function (User $intern) use ($dateAttendances) {
            $att = $dateAttendances->get($intern->id);
            $division = $intern->profile?->division;
            $isLate = false;
            $noCheckout = false;

            if ($att && $att->check_in_at && $division?->start_time) {
                $startTime = Carbon::parse($division->start_time);
                $scheduledStart = Carbon::parse($att->check_in_at)->startOfDay()->setTime($startTime->hour, $startTime->minute, 0);
                $isLate = Carbon::parse($att->check_in_at)->greaterThan($scheduledStart);
            }

            if ($att && in_array($att->status, ['wfo', 'wfh', 'wfa']) && is_null($att->check_out_at)) {
                $noCheckout = true;
            }

            $intern->today_attendance = $att ? [
                'id' => $att->id,
                'status' => $att->status,
                'check_in_at' => $att->check_in_at?->toIso8601String(),
                'check_out_at' => $att->check_out_at?->toIso8601String(),
                'reason' => $att->reason,
                'proof_image_path' => $att->proof_image_path,
                'is_late' => $isLate,
                'no_checkout' => $noCheckout,
            ] : null;

            return $intern;
        });

        return Inertia::render('Admin/Interns/Index', [
            'interns' => $interns,
            'divisions' => Division::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'division_id', 'today_status', 'date']),
            'selected_date' => $date->toDateString(),
        ]);
    }

    /**
     * Show attendance detail for a specific intern.
     */
    public function show(Request $request, User $user): Response
    {
        abort_if($user->role !== 'intern', 404);

        $user->load('profile.division');

        $query = $user->attendances()->latest();

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->paginate(20)->withQueryString();
        $division = $user->profile?->division;

        $attendances->getCollection()->transform(function (Attendance $att) use ($division) {
            $isLate = false;

            if ($att->check_in_at && $division?->start_time) {
                $startTime = Carbon::parse($division->start_time);
                $dayStart = Carbon::parse($att->check_in_at)->startOfDay()->setTime($startTime->hour, $startTime->minute, 0);
                $isLate = Carbon::parse($att->check_in_at)->greaterThan($dayStart);
            }

            $noCheckout = in_array($att->status, ['wfo', 'wfh', 'wfa']) && is_null($att->check_out_at);

            return array_merge($att->toArray(), [
                'is_late' => $isLate,
                'no_checkout' => $noCheckout,
                'proof_image_url' => $att->proof_image_path ? asset('storage/'.$att->proof_image_path) : null,
            ]);
        });

        return Inertia::render('Admin/Interns/Show', [
            'intern' => $user,
            'attendances' => $attendances,
            'division' => $division,
            'filters' => $request->only(['from', 'to', 'status']),
            'stats' => [
                'total_checkin' => $user->attendances()->whereIn('status', ['wfo', 'wfh', 'wfa'])->count(),
                'total_absent' => $user->attendances()->whereIn('status', ['izin', 'sakit'])->count(),
                'total_late' => $this->countLateAttendances($user, $division),
            ],
        ]);
    }

    /**
     * Update an attendance record (admin override).
     */
    public function updateAttendance(Request $request, Attendance $attendance): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:wfo,wfh,wfa,izin,sakit',
            'check_in_at' => 'nullable|date',
            'check_out_at' => 'nullable|date|after_or_equal:check_in_at',
            'reason' => 'nullable|string|max:1000',
        ]);

        $attendance->update($validated);

        return back()->with('success', 'Data absensi berhasil diperbarui.');
    }

    /**
     * Delete an attendance record (admin).
     */
    public function destroyAttendance(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return back()->with('success', 'Data absensi berhasil dihapus.');
    }

    /**
     * Count how many times this intern was late.
     */
    private function countLateAttendances(User $user, ?Division $division): int
    {
        if (! $division?->start_time) {
            return 0;
        }

        return $user->attendances()
            ->whereIn('status', ['wfo', 'wfh', 'wfa'])
            ->whereNotNull('check_in_at')
            ->get()
            ->filter(function (Attendance $att) use ($division) {
                $startTime = Carbon::parse($division->start_time);
                $dayStart = Carbon::parse($att->check_in_at)->startOfDay()->setTime($startTime->hour, $startTime->minute, 0);

                return Carbon::parse($att->check_in_at)->greaterThan($dayStart);
            })
            ->count();
    }
}
