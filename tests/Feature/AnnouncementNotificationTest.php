<?php

use App\Enums\Role;
use App\Models\Announcement;
use App\Models\Division;
use App\Models\User;
use App\Notifications\AnnouncementPostedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('mentor can create an announcement with attachment and notify interns', function () {
    Storage::fake('public');

    // Create divisions and users
    $division = Division::create([
        'name' => 'IT Department',
        'start_time' => '08:00:00',
        'end_time' => '17:00:00',
        'work_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ]);

    $mentor = User::factory()->create([
        'role' => Role::Mentor,
    ]);

    $internInDiv = User::factory()->create([
        'role' => Role::Intern,
        'division_id' => $division->id,
    ]);

    $internOtherDiv = User::factory()->create([
        'role' => Role::Intern,
        'division_id' => null,
    ]);

    // Mentor posts announcement targeted at the IT Department division
    $response = $this->actingAs($mentor)->post(route('mentor.announcements.store'), [
        'title' => 'Important Meeting',
        'content' => '<p>Please attend the <strong>meeting</strong> today.</p>',
        'division_id' => $division->id,
        'attachment' => UploadedFile::fake()->create('agenda.pdf', 100),
    ]);

    $response->assertRedirect();

    // Assert announcement was created
    $announcement = Announcement::latest()->first();
    expect($announcement)->not->toBeNull();
    expect($announcement->title)->toBe('Important Meeting');
    expect($announcement->attachment_name)->toBe('agenda.pdf');
    expect($announcement->attachment_path)->not->toBeNull();

    Storage::disk('public')->assertExists($announcement->attachment_path);

    // Verify notifications were delivered to targeted division intern only
    $internInDiv->refresh();
    $internOtherDiv->refresh();

    expect($internInDiv->notifications->count())->toBe(1);
    expect($internOtherDiv->notifications->count())->toBe(0);

    $notification = $internInDiv->notifications->first();
    expect($notification->data['title'])->toBe('Important Meeting');
    expect($notification->data['excerpt'])->toContain('Please attend the meeting today.');
});

test('intern can read announcements and mark notifications as read', function () {
    $mentor = User::factory()->create(['role' => Role::Mentor]);
    $intern = User::factory()->create(['role' => Role::Intern]);

    $announcement = Announcement::create([
        'title' => 'Global Announcement',
        'content' => '<p>Hello everyone</p>',
        'author_id' => $mentor->id,
    ]);

    // Manually trigger notification
    $intern->notify(new AnnouncementPostedNotification($announcement));

    expect($intern->unreadNotifications->count())->toBe(1);

    // Intern views announcements
    $response = $this->actingAs($intern)->get(route('intern.announcements'));
    $response->assertOk();

    // Intern marks notification as read
    $notification = $intern->unreadNotifications->first();

    $response = $this->actingAs($intern)->post(route('intern.notifications.mark-read', ['id' => $notification->id]));
    $response->assertRedirect();

    expect($intern->fresh()->unreadNotifications->count())->toBe(0);
});
