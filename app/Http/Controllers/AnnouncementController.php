<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::with(['author', 'division'])->latest()->get();
        $divisions = Division::all();

        return Inertia::render('Mentor/Announcements/Index', [
            'announcements' => $announcements,
            'divisions' => $divisions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        Announcement::create([
            ...$validated,
            'author_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Pengumuman berhasil dibuat.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
