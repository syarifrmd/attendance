<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class MentorController extends Controller
{
    /**
     * Display the mentor dashboard with the list of all interns.
     */
    public function dashboard(Request $request)
    {
        $search = $request->get('search', '');

        $query = User::where('role', 'intern')
            ->with(['profile.division', 'attendances' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->withCount([
                'attendances as total_checkins' => fn ($q) => $q->whereIn('status', ['wfo', 'wfh', 'wfa']),
                'attendances as total_absent' => fn ($q) => $q->whereIn('status', ['izin', 'sakit']),
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', fn ($pq) => $pq->where('nama_lengkap', 'like', "%{$search}%"));
            });
        }

        $interns = $query->orderBy('name')->get();

        // Attach today's attendance info
        $internIds = $interns->pluck('id');
        $todayAttendances = Attendance::whereIn('user_id', $internIds)
            ->whereDate('created_at', Carbon::today())
            ->get()
            ->keyBy('user_id');

        $interns->transform(function (User $intern) use ($todayAttendances) {
            $todayAtt = $todayAttendances->get($intern->id);
            $division = $intern->profile?->division;
            $isLate = false;

            if ($todayAtt && $todayAtt->check_in_at && $division?->start_time) {
                $startTime = Carbon::parse($division->start_time);
                $scheduledStart = Carbon::today()->setTime($startTime->hour, $startTime->minute, 0);
                $isLate = Carbon::parse($todayAtt->check_in_at)->greaterThan($scheduledStart);
            }

            $noCheckout = $todayAtt
                && in_array($todayAtt->status, ['wfo', 'wfh', 'wfa'])
                && is_null($todayAtt->check_out_at);

            $intern->today_attendance = $todayAtt ? [
                'id' => $todayAtt->id,
                'status' => $todayAtt->status,
                'check_in_at' => $todayAtt->check_in_at,
                'check_out_at' => $todayAtt->check_out_at,
                'is_late' => $isLate,
                'no_checkout' => $noCheckout,
            ] : null;

            return $intern;
        });

        return Inertia::render('Mentor/Dashboard', [
            'interns' => $interns,
            'filters' => ['search' => $search],
        ]);
    }
}
