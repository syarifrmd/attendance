<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['title', 'content', 'author_id', 'division_id', 'attachment_path', 'attachment_name'])]
class Announcement extends Model
{
    use HasUlids;

    protected $appends = ['attachment_url'];

    /**
     * Get the public URL for the attachment.
     */
    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->attachment_path
            ? Storage::url($this->attachment_path)
            : null;
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }
}
