<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageHelper
{
    /**
     * The disk to use for storing images.
     */
    protected static string $disk = 'public';

    /**
     * The directory within the disk to store uploads.
     */
    protected static string $directory = 'uploads';

    /**
     * Store an uploaded image file or base64 string to disk.
     *
     * @param \Illuminate\Http\UploadedFile|string|null $image
     * @param string|null $existingPath Optional existing path to delete if replacing
     * @return string|null The stored file path (relative to disk) or null
     */
    public static function store($image, ?string $existingPath = null): ?string
    {
        if ($image === null) {
            return null;
        }

        // Handle UploadedFile
        if ($image instanceof UploadedFile) {
            // Delete existing file if replacing
            if ($existingPath) {
                self::delete($existingPath);
            }

            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs(self::$directory, $filename, self::$disk);

            return $path;
        }

        // Handle base64 string
        if (is_string($image)) {
            $trimmed = trim($image);
            if ($trimmed === '') {
                return null;
            }

            // If it's already a storage path (not a data URL), return as-is
            if (!str_starts_with($trimmed, 'data:') && !str_starts_with($trimmed, '/storage/')) {
                return $trimmed;
            }

            // If it's a storage URL, keep it
            if (str_starts_with($trimmed, '/storage/')) {
                return str_replace('/storage/', '', $trimmed);
            }

            // Parse base64 data URL
            if (preg_match('/^data:(\w+\/[A-Za-z0-9+\-.]+);base64,(.+)$/', $trimmed, $matches)) {
                $mime = $matches[1];
                $data = base64_decode($matches[2]);

                if ($data === false) {
                    return null;
                }

                // Determine extension from mime type
                $extension = self::getExtensionFromMime($mime);

                // Delete existing file if replacing
                if ($existingPath) {
                    self::delete($existingPath);
                }

                $filename = Str::uuid() . '.' . $extension;
                $path = self::$directory . '/' . $filename;

                Storage::disk(self::$disk)->put($path, $data);

                return $path;
            }
        }

        return null;
    }

    /**
     * Delete an image from storage.
     *
     * @param string|null $path The path relative to the disk
     * @return bool
     */
    public static function delete(?string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        // Handle storage URLs
        if (str_starts_with($path, '/storage/')) {
            $path = str_replace('/storage/', '', $path);
        }

        if (Storage::disk(self::$disk)->exists($path)) {
            return Storage::disk(self::$disk)->delete($path);
        }

        return false;
    }

    /**
     * Get the public URL for a stored image.
     *
     * @param string|null $path The path relative to the disk
     * @return string|null
     */
    public static function url(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // If it's already a full URL or data URL, return as-is
        if (str_starts_with($path, 'http') || str_starts_with($path, 'data:')) {
            return $path;
        }

        // If it's already a storage URL, return as-is
        if (str_starts_with($path, '/storage/')) {
            return $path;
        }

        return asset('storage/' . $path);
    }

    /**
     * Get file extension from mime type.
     *
     * @param string $mime
     * @return string
     */
    protected static function getExtensionFromMime(string $mime): string
    {
        $map = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
            'image/bmp' => 'bmp',
            'image/tiff' => 'tiff',
        ];

        return $map[$mime] ?? 'jpg';
    }

    /**
     * Legacy method for backward compatibility.
     * Converts to data URL - deprecated, use store() instead.
     *
     * @deprecated Use store() instead
     * @param \Illuminate\Http\UploadedFile|string|null $image
     * @param string $defaultMime
     * @return string|null
     */
    public static function normalize($image, string $defaultMime = 'image/jpeg'): ?string
    {
        // For backward compatibility, redirect to store()
        return self::store($image);
    }
}
