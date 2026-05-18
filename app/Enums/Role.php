<?php

namespace App\Enums;

enum Role: string
{
    case Intern = 'intern';
    case Mentor = 'mentor';
    case Admin = 'admin';

    /**
     * Determine if this role has manager-level access (mentor or admin).
     */
    public function isManager(): bool
    {
        return $this === self::Mentor || $this === self::Admin;
    }

    /**
     * Human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Intern => 'Intern',
            self::Mentor => 'Mentor',
            self::Admin => 'Admin',
        };
    }
}
