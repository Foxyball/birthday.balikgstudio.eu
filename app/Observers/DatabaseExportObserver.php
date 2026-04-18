<?php

namespace App\Observers;

use App\Models\DatabaseExport;
use App\Models\Notification;

class DatabaseExportObserver
{
    /**
     * Handle the DatabaseExport "created" event.
     */
    public function created(DatabaseExport $databaseExport): void
    {
        Notification::createSuccessNotification(
            $databaseExport->user_id,
            'Database exported successfully',
            'Your database has been backed up. File size: '.$this->formatBytes($databaseExport->file_size),
            route('database.exports.download', $databaseExport->id)
        );
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(?int $bytes): string
    {
        if (is_null($bytes)) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2).' '.$units[$pow];
    }

    /**
     * Handle the DatabaseExport "updated" event.
     */
    public function updated(DatabaseExport $databaseExport): void
    {
        //
    }

    /**
     * Handle the DatabaseExport "deleted" event.
     */
    public function deleted(DatabaseExport $databaseExport): void
    {
        //
    }

    /**
     * Handle the DatabaseExport "restored" event.
     */
    public function restored(DatabaseExport $databaseExport): void
    {
        //
    }

    /**
     * Handle the DatabaseExport "force deleted" event.
     */
    public function forceDeleted(DatabaseExport $databaseExport): void
    {
        //
    }
}
