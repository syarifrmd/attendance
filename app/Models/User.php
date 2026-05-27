<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name', 'email', 'password', 'role', 'google_id',
    'nim', 'nim_verified_at', 'division_id', 'foto', 'foto_left', 'foto_right',
    'asal_kampus', 'divisi', 'mentor_id', 'internship_duration_days',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUlids, Notifiable, TwoFactorAuthenticatable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['profile'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => Role::class,
            'nim_verified_at' => 'datetime',
        ];
    }

    /**
     * Virtual Profile attribute for backward-compatibility with the frontend
     */
    public function getProfileAttribute(): array
    {
        return [
            'nim' => $this->nim,
            'nim_verified_at' => $this->nim_verified_at?->toIso8601String(),
            'foto' => $this->foto,
            'foto_left' => $this->foto_left,
            'foto_right' => $this->foto_right,
            'asal_kampus' => $this->asal_kampus,
            'divisi' => $this->divisi,
            'division_id' => $this->division_id,
            'division' => $this->relationLoaded('division') ? $this->division : null,
            'mentor_id' => $this->mentor_id,
            'internship_duration_days' => $this->internship_duration_days,
        ];
    }

    /**
     * Determine if this user has manager-level access (mentor or admin).
     */
    public function isManager(): bool
    {
        return $this->role?->isManager() ?? false;
    }

    /**
     * Determine if this user is an intern.
     */
    public function isIntern(): bool
    {
        return $this->role === Role::Intern;
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'author_id');
    }
}
