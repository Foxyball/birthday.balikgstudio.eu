<?php

namespace App\Http\Controllers;

use App\Models\DatabaseExport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use Symfony\Component\Process\Process;

class DatabaseController extends Controller
{
    /**
     * Export the database as a SQL dump file.
     */
    public function export()
    {
        try {
            $userId = Auth::id();
            $fileName = 'db_export_' . $userId . '_' . now()->format('Y-m-d_H-i-s') . '.sql';
            $filePath = 'exports/' . $fileName;
            $fullPath = storage_path('app/' . $filePath);

            // Ensure the exports directory exists
            if (!is_dir(storage_path('app/exports'))) {
                mkdir(storage_path('app/exports'), 0755, true);
            }

            // Get database configuration
            $db = config('database.connections.mysql');

            // Prepare environment for mysqldump with password
            $env = array_merge($_ENV, [
                'MYSQL_PWD' => $db['password'],
            ]);

            // Build mysqldump command (password via env var instead of command line)
            $command = [
                'mysqldump',
                '--host=' . escapeshellarg($db['host']),
                '--user=' . escapeshellarg($db['username']),
                '--single-transaction',
                '--quick',
                '--lock-tables=false',
                escapeshellarg($db['database']),
            ];

            // Execute mysqldump using shell
            $shellCommand = implode(' ', $command);
            $output = [];
            $returnCode = 0;

            // Use proc_open for better process handling with environment variables
            $descriptors = [
                0 => ['pipe', 'r'],  // stdin
                1 => ['pipe', 'w'],  // stdout
                2 => ['pipe', 'w'],  // stderr
            ];

            $process = proc_open($shellCommand, $descriptors, $pipes, null, $env);

            if (is_resource($process)) {
                fclose($pipes[0]);
                $stdout = stream_get_contents($pipes[1]);
                $stderr = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                $returnCode = proc_close($process);

                if ($returnCode !== 0) {
                    throw new \Exception('Mysqldump error: ' . $stderr);
                }

                // Write the output to file
                if (!file_put_contents($fullPath, $stdout)) {
                    throw new \Exception('Failed to write dump file to storage');
                }
            } else {
                throw new \Exception('Failed to execute mysqldump command');
            }

            // Get file size
            $fileSize = filesize($fullPath);

            // Create database export record (this will trigger the observer)
            $export = DatabaseExport::create([
                'user_id' => $userId,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'exported_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database exported successfully',
                'file_name' => $fileName,
                'file_size' => $this->formatBytes($fileSize),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database export failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a database export file.
     */
    public function download($id)
    {
        $export = DatabaseExport::findOrFail($id);
        
        // Check authorization - user can only download their own exports
        if ($export->user_id !== Auth::id() || !Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        // Check if file exists
        $filePath = storage_path('app/' . $export->file_path);
        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Export file not found',
            ], 404);
        }

        // Download file
        return response()->download(
            $filePath,
            $export->file_name,
            [
                'Content-Type' => 'application/sql',
                'Content-Disposition' => 'attachment; filename=' . $export->file_name,
            ]
        );
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
