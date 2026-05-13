<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MentorController extends Controller
{
    /**
     * Display the mentor dashboard with the list of assigned interns.
     */
    public function dashboard(Request $request)
    {
        $mentorId = $request->user()->id;

        $interns = User::where('role', 'intern')
            ->whereHas('profile', function ($query) use ($mentorId) {
                $query->where('mentor_id', $mentorId);
            })
            ->with(['profile', 'attendances' => function ($query) {
                $query->latest()->limit(5); // Get recent 5 attendances for quick preview
            }])
            ->get();

        return Inertia::render('Mentor/Dashboard', [
            'interns' => $interns,
        ]);
    }
}
