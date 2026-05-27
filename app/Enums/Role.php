<?php

namespace App\Enums;

enum Role: string
{
    case Intern = 'intern';
    case Mentor = 'mentor';

    /**
     * Determine if this role has manager-level access (mentor or admin).
     */
    public function isManager(): bool
    {
        return $this === self::Mentor;
    }

    /**
     * Human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Intern => 'Intern',
            self::Mentor => 'Mentor',
        };
    }
}
