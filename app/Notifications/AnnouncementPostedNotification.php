<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AnnouncementPostedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Announcement $announcement)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        // Strip HTML tags from content to make a plain-text excerpt
        $plainContent = strip_tags($this->announcement->content);
        $excerpt = mb_strlen($plainContent) > 100
            ? mb_substr($plainContent, 0, 100).'...'
            : $plainContent;

        return [
            'announcement_id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'excerpt' => $excerpt,
            'author_name' => $this->announcement->author?->name ?? 'Mentor',
            'division_id' => $this->announcement->division_id,
            'created_at' => $this->announcement->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }
}
