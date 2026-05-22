<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Division;
use App\Models\InternDraft;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class InternController extends Controller
{
    /**
     * Compute late metadata for a given attendance and its division.
     *
     * @return array{is_late: bool, late_minutes: int, late_level: string}
     */
    private function lateMeta(Attendance $att, ?Division $division): array
    {
        if (! $att->check_in_at || ! $division?->start_time) {
            return ['is_late' => false, 'late_minutes' => 0, 'late_level' => 'green'];
        }

        $lateMinutes = $att->lateMinutes($division->start_time);
        $lateLevel = $att->lateLevel($division->start_time);

        return [
            'is_late' => $lateMinutes > 0,
            'late_minutes' => $lateMinutes,
            'late_level' => $lateLevel,
        ];
    }

    /**
     * Display a listing of all interns with their attendance for the selected date.
     */
    public function index(Request $request): Response
    {
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

            $late = $att ? $this->lateMeta($att, $division) : ['is_late' => false, 'late_minutes' => 0, 'late_level' => 'green'];
            $noCheckout = $att && in_array($att->status, ['wfo', 'wfh', 'wfa']) && is_null($att->check_out_at);

            $intern->today_attendance = $att ? [
                'id' => $att->id,
                'status' => $att->status,
                'check_in_at' => $att->check_in_at?->toIso8601String(),
                'check_out_at' => $att->check_out_at?->toIso8601String(),
                'reason' => $att->reason,
                'proof_image_path' => $att->proof_image_path,
                'is_late' => $late['is_late'],
                'late_minutes' => $late['late_minutes'],
                'late_level' => $late['late_level'],
                'no_checkout' => $noCheckout,
            ] : null;

            return $intern;
        });

        // Intern drafts (pre-registered, not yet claimed)
        $drafts = InternDraft::with('division')
            ->where('is_claimed', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Mentor/Interns/Index', [
            'interns' => $interns,
            'divisions' => Division::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'division_id', 'today_status', 'date']),
            'selected_date' => $date->toDateString(),
            'drafts' => $drafts,
        ]);
    }

    /**
     * Show attendance detail for a specific intern (rendered in Admin view for admin role).
     */
    public function show(Request $request, User $intern): Response
    {
        abort_if($intern->isManager() || $intern->isIntern() === false, 404);

        $intern->load('profile.division');

        $query = $intern->attendances()->latest();

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
        $division = $intern->profile?->division;

        $attendances->getCollection()->transform(function (Attendance $att) use ($division) {
            $late = $this->lateMeta($att, $division);
            $noCheckout = in_array($att->status, ['wfo', 'wfh', 'wfa']) && is_null($att->check_out_at);

            return array_merge($att->toArray(), [
                'is_late' => $late['is_late'],
                'late_minutes' => $late['late_minutes'],
                'late_level' => $late['late_level'],
                'no_checkout' => $noCheckout,
                'proof_image_url' => $att->proof_image_path ? asset('storage/'.$att->proof_image_path) : null,
            ]);
        });

        $divisions = Division::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Mentor/Interns/Show', [
            'intern' => $intern,
            'attendances' => $attendances,
            'division' => $division,
            'filters' => $request->only(['from', 'to', 'status']),
            'stats' => [
                'total_checkin' => $intern->attendances()->whereIn('status', ['wfo', 'wfh', 'wfa'])->count(),
                'total_absent' => $intern->attendances()->whereIn('status', ['izin', 'sakit'])->count(),
                'total_late' => $this->countLateAttendances($intern, $division),
            ],
            'divisions' => $divisions,
        ]);
    }

    /**
     * Update an intern's profile and user data (manager override).
     */
    public function update(Request $request, User $intern): RedirectResponse
    {
        abort_if($intern->isManager() || $intern->isIntern() === false, 404);

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'asal_kampus' => 'nullable|string|max:255',
            'division_id' => 'nullable|exists:divisions,id',
            'periode_magang' => 'nullable|string|max:255',
            'internship_duration_days' => 'nullable|integer|min:1|max:730',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$intern->id,
        ]);

        if (isset($validated['email'])) {
            $intern->update(['email' => $validated['email']]);
        }

        $profile = $intern->profile()->firstOrCreate(
            ['user_id' => $intern->id],
            ['nama_lengkap' => $validated['nama_lengkap']]
        );

        $divisionId = $validated['division_id'] ?? null;
        $divisionName = $divisionId ? Division::find($divisionId)?->name : $profile->divisi;

        $profile->update([
            'nama_lengkap' => $validated['nama_lengkap'],
            'asal_kampus' => $validated['asal_kampus'] ?? $profile->asal_kampus,
            'division_id' => $divisionId,
            'divisi' => $divisionName,
            'periode_magang' => $validated['periode_magang'] ?? $profile->periode_magang,
            'internship_duration_days' => $validated['internship_duration_days'] ?? $profile->internship_duration_days ?? 90,
        ]);

        return back()->with('success', 'Data intern berhasil diperbarui.');
    }

    /**
     * Delete an intern user (and their profile/attendances via cascade).
     */
    public function destroy(User $intern): RedirectResponse
    {
        abort_if($intern->isManager() || $intern->isIntern() === false, 404);

        $intern->delete();

        return redirect()->route('mentor.interns.index')->with('success', 'Intern berhasil dihapus.');
    }

    /**
     * Store a new intern draft or remove if inactive.
     */
    public function storeDraft(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:255',
            'nama_lengkap' => 'required|string|max:255',
            'division_id' => 'nullable|exists:divisions,id',
            'internship_duration_days' => 'nullable|integer|min:1|max:730',
            'is_active' => 'boolean',
        ]);

        $isActive = $validated['is_active'] ?? true;

        if (! $isActive) {
            // Hard delete
            InternDraft::where('nim', $validated['nim'])->delete();
            $user = Profile::where('nim', $validated['nim'])->first()?->user;
            if ($user && $user->role === Role::Intern) {
                $user->delete();
            }

            return back()->with('success', 'Data intern berhasil dihapus karena berstatus Tidak Aktif.');
        }

        // Validate uniqueness only if creating active
        $request->validate(['nim' => 'unique:intern_drafts,nim']);

        InternDraft::create([
            'nim' => $validated['nim'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'division_id' => $validated['division_id'] ?? null,
            'internship_duration_days' => $validated['internship_duration_days'] ?? 90,
            'is_claimed' => false,
        ]);

        return back()->with('success', 'Data intern baru berhasil ditambahkan. Intern dapat mendaftar menggunakan NIM yang telah didaftarkan.');
    }

    /**
     * Process bulk import of intern drafts from frontend.
     */
    public function importProcess(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'drafts' => 'required|array|min:1',
            'drafts.*.nim' => 'required|string|max:255',
            'drafts.*.nama_lengkap' => 'required|string|max:255',
            'drafts.*.division_id' => 'nullable|exists:divisions,id',
            'drafts.*.internship_duration_days' => 'nullable|integer|min:1|max:730',
            'drafts.*.is_active' => 'boolean',
        ]);

        $countAdded = 0;
        $countDeleted = 0;

        foreach ($validated['drafts'] as $draft) {
            $isActive = $draft['is_active'] ?? true;

            if (! $isActive) {
                // Hard delete logic
                $draftDeleted = InternDraft::where('nim', $draft['nim'])->delete();
                $user = Profile::where('nim', $draft['nim'])->first()?->user;
                if ($user && $user->role === Role::Intern) {
                    $user->delete();
                    $countDeleted++;
                } elseif ($draftDeleted) {
                    $countDeleted++;
                }
            } else {
                // Add active logic
                $existsInDrafts = InternDraft::where('nim', $draft['nim'])->exists();
                if (! $existsInDrafts) {
                    InternDraft::create([
                        'nim' => $draft['nim'],
                        'nama_lengkap' => $draft['nama_lengkap'],
                        'division_id' => $draft['division_id'] ?? null,
                        'internship_duration_days' => $draft['internship_duration_days'] ?? 90,
                        'is_claimed' => false,
                    ]);
                    $countAdded++;
                }
            }
        }

        $message = 'Berhasil memproses import.';
        if ($countAdded > 0) {
            $message .= " $countAdded data ditambahkan.";
        }
        if ($countDeleted > 0) {
            $message .= " $countDeleted data dihapus (resign).";
        }

        return back()->with('success', $message);
    }

    /**
     * Delete an intern draft.
     */
    public function destroyDraft(InternDraft $internDraft): RedirectResponse
    {
        $internDraft->delete();

        return back()->with('success', 'Data draft intern berhasil dihapus.');
    }

    /**
     * Update an attendance record (manager override).
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
     * Delete an attendance record.
     */
    public function destroyAttendance(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return back()->with('success', 'Data absensi berhasil dihapus.');
    }

    /**
     * Count how many times this intern was late (with grace period).
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
            ->filter(fn (Attendance $att) => $att->lateMinutes($division->start_time) > 0)
            ->count();
    }
}
