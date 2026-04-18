import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDatabaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ExportDatabaseModal({ open, onOpenChange }: ExportDatabaseModalProps) {
    const [exporting, setExporting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        setSuccess(false);

        try {
            const response = await fetch(route('database.export'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                await response.json();
                setSuccess(true);
                toast.success('Database exported successfully!');
                
                // Auto-close after 2 seconds
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                const data = await response.json();
                toast.error(data.message || 'Export failed');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const handleConfirmExport = () => {
        setShowConfirmation(false);
        handleExport();
    };

    const handleClose = () => {
        setShowConfirmation(false);
        setSuccess(false);
        setExporting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Database</DialogTitle>
                    <DialogDescription>
                        Create a backup dump of your entire database
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {success ? (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Database exported successfully!
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {!showConfirmation ? (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        This will create a complete dump of your database including all contacts, categories, and user data.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        You are going to export the database. Do you want to proceed?
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    {!showConfirmation && !success ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={exporting}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => setShowConfirmation(true)}
                                disabled={exporting}
                            >
                                Export Database
                            </Button>
                        </>
                    ) : showConfirmation && !success ? (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowConfirmation(false)}
                                disabled={exporting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirmExport}
                                disabled={exporting}
                            >
                                {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {exporting ? 'Exporting...' : 'Confirm Export'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
