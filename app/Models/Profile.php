<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'division_id', 'foto', 'foto_left', 'foto_right', 'nama_lengkap', 'asal_kampus', 'divisi', 'mentor_id', 'periode_magang', 'internship_duration_days'])]
class Profile extends Model
{
    use HasUlids;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }
}
