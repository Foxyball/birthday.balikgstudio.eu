<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class ImageHelper
{
    /**
     * Convert an uploaded file or a base64 string to a normalized data URL.
     *
     * @param \Illuminate\Http\UploadedFile|string|null $image
     * @param string $defaultMime Default mime type for base64 strings without prefix
     * @return string|null
     */
    public static function normalize($image, string $defaultMime = 'image/jpeg'): ?string
    {
        if ($image instanceof UploadedFile) {
            $mime = $image->getMimeType() ?? $defaultMime;
            $contents = file_get_contents($image->getRealPath());
            return 'data:' . $mime . ';base64,' . base64_encode($contents);
        }

        if (is_string($image)) {
            $trimmed = trim($image);
            if ($trimmed === '') {
                return null;
            }

            // If already a data URL, return as-is
            if (preg_match('/^data:\w+\/[A-Za-z0-9+\-.]+;base64,/', $trimmed)) {
                return $trimmed;
            }

            // Otherwise assume default mime type
            return 'data:' . $defaultMime . ';base64,' . $trimmed;
        }

        return null;
    }
}
