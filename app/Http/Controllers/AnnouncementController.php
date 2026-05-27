<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Announcement;
use App\Models\Division;
use App\Models\User;
use App\Notifications\AnnouncementPostedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
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
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('announcements', 'public');
        }

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'division_id' => $validated['division_id'] ?? null,
            'author_id' => $request->user()->id,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
        ]);

        // Send notifications to interns in the target division (or all interns if division_id is null)
        $query = User::where('role', Role::Intern);

        if ($announcement->division_id) {
            $query->where('division_id', $announcement->division_id);
        }

        $users = $query->get();

        Notification::send($users, new AnnouncementPostedNotification($announcement));

        return back()->with('success', 'Pengumuman berhasil dibuat dan disebarkan.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        if ($announcement->attachment_path) {
            Storage::disk('public')->delete($announcement->attachment_path);
        }

        $announcement->delete();

        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
