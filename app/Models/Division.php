<?php

namespace App\Models;

use Database\Factories\DivisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'start_time', 'end_time', 'work_days', 'mentor_name'])]
class Division extends Model
{
    /** @use HasFactory<DivisionFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'work_days' => 'array',
        ];
    }

    public function profiles(): HasMany
    {
        return $this->hasMany(Profile::class);
    }
}
