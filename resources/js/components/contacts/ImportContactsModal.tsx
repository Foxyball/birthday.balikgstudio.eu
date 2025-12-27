import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Upload, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ImportContactsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
    message: string;
}

export default function ImportContactsModal({ open, onOpenChange }: ImportContactsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    const handleImport = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(route('contacts.import'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            setUploadProgress(100);

            if (response.ok) {
                setResult(data);
                if (data.imported > 0) {
                    toast.success(data.message);
                }
            } else {
                setResult({
                    success: false,
                    imported: 0,
                    skipped: 0,
                    errors: [data.message || 'Import failed'],
                    message: data.message || 'Import failed',
                });
            }
        } catch {
            setResult({
                success: false,
                imported: 0,
                skipped: 0,
                errors: ['Network error. Please try again.'],
                message: 'Network error. Please try again.',
            });
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const handleClose = () => {
        if (result?.imported && result.imported > 0) {
            router.reload();
        }
        setFile(null);
        setResult(null);
        onOpenChange(false);
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('contacts.import.template');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Import contacts
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </DialogTitle>
                    <DialogDescription>
                        To get started, select a file.
                        <br />
                        Use a CSV format or our{' '}
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="text-primary hover:underline font-medium"
                        >
                            template
                        </button>
                        .
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {!result && (
                        <Button
                            variant="default"
                            onClick={handleSelectFile}
                            disabled={uploading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Select file
                        </Button>
                    )}

                    {file && !result && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                    )}

                    {uploadProgress !== null && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Upload className="h-4 w-4 animate-pulse" />
                                <span>Importing... {Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    {result && (
                        <div className="space-y-3">
                            <div className={`flex items-start gap-2 p-3 rounded-md ${
                                result.imported > 0 
                                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                                {result.imported > 0 ? (
                                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="font-medium">{result.message}</p>
                                    {result.errors.length > 0 && (
                                        <ul className="mt-2 text-sm space-y-1">
                                            {result.errors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        CSV columns: Name, Email, Phone, Birthday, Category (optional).
                        <br />
                        Category will be matched by name. Unmatched categories are ignored.
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={handleClose}>
                        {result ? 'Close' : 'Cancel'}
                    </Button>
                    {!result && (
                        <Button
                            onClick={handleImport}
                            disabled={!file || uploading}
                        >
                            Import
                        </Button>
                    )}
                    {result && result.imported > 0 && (
                        <Button onClick={handleClose}>
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
