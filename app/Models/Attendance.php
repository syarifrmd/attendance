<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'status', 'latitude', 'longitude', 'face_verification_path', 'face_match_score', 'proof_image_path', 'reason'])]
class Attendance extends Model
{
    use HasUlids;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
