<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable([
    'user_id',
    'status',
    'latitude',
    'longitude',
    'face_verification_path',
    'face_match_score',
    'proof_image_path',
    'reason',
    'check_in_at',
    'check_out_at',
    'checkout_latitude',
    'checkout_longitude',
    'checkout_face_verification_path',
    'checkout_reason',
])]
class Attendance extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate how many minutes late this check-in was relative to a given start time.
     * Returns 0 if on time (within grace period) or if data is missing.
     *
     * @param  string  $startTime  e.g. "08:00:00"
     * @param  int  $graceMinutes  minutes of tolerance before considered late
     */
    public function lateMinutes(string $startTime, int $graceMinutes = 5): int
    {
        if (! $this->check_in_at) {
            return 0;
        }

        $checkIn = Carbon::parse($this->check_in_at);
        [$h, $m] = explode(':', $startTime);
        $scheduledStart = $checkIn->copy()->startOfDay()->setTime((int) $h, (int) $m, 0);

        $diff = (int) $scheduledStart->diffInMinutes($checkIn, false);

        return max(0, $diff - $graceMinutes);
    }

    /**
     * Determine the late level badge color key.
     * Returns 'green', 'yellow', or 'red'.
     *
     * @param  string  $startTime  e.g. "08:00:00"
     */
    public function lateLevel(string $startTime): string
    {
        $minutes = $this->lateMinutes($startTime);

        if ($minutes === 0) {
            return 'green';
        }

        if ($minutes < 30) {
            return 'yellow';
        }

        return 'red';
    }
}
