import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClockIcon, EditIcon, Trash2Icon, Lock, LucideIcon } from 'lucide-react';
import { useState, ReactNode } from 'react';

// Field definition for displaying data
export interface DetailField {
    icon?: LucideIcon;
    label?: string;
    value: ReactNode;
}

// Section definition for grouping fields
export interface DetailSection {
    title: string;
    fields: DetailField[];
}

// Base record interface - all entities should extend this
export interface BaseRecord {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string | null;
    is_locked?: boolean;
    image_url?: string | null;
}

export interface DetailsSidebarProps<T extends BaseRecord> {
    record: T | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: (record: T) => void;
    entityName: string;
    sections?: DetailSection[];
    badge?: ReactNode;
    showAvatar?: boolean;
    headerContent?: ReactNode;
    beforeActions?: ReactNode;
    hideEdit?: boolean;
    hideDelete?: boolean;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export function DetailsSidebar<T extends BaseRecord>({
    record,
    open,
    onOpenChange,
    onEdit,
    onDelete,
    entityName,
    sections = [],
    badge,
    showAvatar = true,
    headerContent,
    beforeActions,
    hideEdit = false,
    hideDelete = false,
}: DetailsSidebarProps<T>) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!record) return null;

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
            onOpenChange(false);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            setDeleting(true);
            try {
                onDelete(record);
            } finally {
                setDeleting(false);
                setDeleteDialogOpen(false);
                onOpenChange(false);
            }
        }
    };

    const showActions = !hideEdit || !hideDelete;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto px-6">
                <SheetHeader className="text-left">
                    <div className="flex items-center gap-4">
                        {showAvatar && (
                            <Avatar className="h-16 w-16">
                                {record.image_url && (
                                    <AvatarImage src={record.image_url} alt={record.name} />
                                )}
                                <AvatarFallback className="text-lg">
                                    {getInitials(record.name)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-xl truncate">{record.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                {badge}
                                {record.is_locked && (
                                    <Badge variant="destructive">Locked</Badge>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                    {headerContent}
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Custom sections */}
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    {section.title}
                                </h3>
                                <div className="space-y-3">
                                    {section.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className="flex items-center gap-3">
                                            {field.icon && (
                                                <field.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <div className="text-sm">
                                                {field.label && (
                                                    <span className="text-muted-foreground">{field.label}: </span>
                                                )}
                                                {field.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {sectionIndex < sections.length - 1 && <Separator className="mt-6" />}
                        </div>
                    ))}

                    {sections.length > 0 && <Separator />}

                    {/* Record Details (always shown) */}
                    <section>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Record Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Created: </span>
                                    {formatDate(record.created_at)}
                                </div>
                            </div>
                            {record.updated_at && (
                                <div className="flex items-center gap-3">
                                    <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Updated: </span>
                                        {formatDate(record.updated_at)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {beforeActions}

                {/* Action Buttons */}
                {showActions && (
                    record.is_locked ? (
                        <SheetFooter className="mt-6">
                            <Alert variant="destructive" className="w-full">
                                <Lock className="h-4 w-4" />
                                <AlertDescription>
                                    <span className="font-semibold">This {entityName} is locked.</span>
                                    <br />
                                    <span className="text-xs">Subscribe to Pro to unlock and manage this {entityName}.</span>
                                </AlertDescription>
                            </Alert>
                        </SheetFooter>
                    ) : (
                        <SheetFooter className="mt-6 flex-row gap-2">
                            {!hideEdit && onEdit && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleEdit}
                                >
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            )}
                            {!hideDelete && onDelete && (
                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <Trash2Icon className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {entityName}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete{' '}
                                                <strong>{record.name}</strong>. This action cannot be
                                                undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2"
                                                disabled={deleting}
                                            >
                                                {deleting ? (
                                                    <Spinner className="h-4 w-4" />
                                                ) : (
                                                    <Trash2Icon className="h-4 w-4" />
                                                )}
                                                <span>Delete</span>
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </SheetFooter>
                    )
                )}
            </SheetContent>
        </Sheet>
    );
}
