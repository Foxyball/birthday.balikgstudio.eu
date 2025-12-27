<?php

namespace App\Models;

use App\Helpers\ImageHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'status',
        'name',
        'email',
        'phone',
        'birthday',
        'image',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    /**
     * Boot method to handle model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Clean up image file when contact is deleted
        static::deleting(function (Contact $contact) {
            if ($contact->image) {
                ImageHelper::delete($contact->image);
            }
        });
    }

    /**
     * Get the full URL to the contact's image.
     */
    public function getImageUrlAttribute(): ?string
    {
        return ImageHelper::url($this->image);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
