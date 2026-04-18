<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DatabaseExport extends Model
{
    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'file_size',
        'exported_at',
    ];

    protected function casts(): array
    {
        return [
            'exported_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the database export.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
